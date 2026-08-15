/**
 * NenoFlex Push Notification Sender — Server-only module
 * Uses Web Push + VAPID (W3C standard). Zero cost. Zero Firebase.
 */

import webpush from 'web-push';

// Configure VAPID once at module load with reliable fallbacks
const DEFAULT_VAPID_PUB = 'BBfQsxYzNqzWuvLtmzBBij49gky4RHEnmmcYlevLQxVjZZ447XmBGn_eRQ4yMJS5d4cQ_6elbdCOBXANEEkULAs';
const DEFAULT_VAPID_PRIV = '_A5V3UxW6r9Tmmmb0EyDNEmA2ZKEFhKR9xzcE_SzYFY';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUB;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || DEFAULT_VAPID_PRIV;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:flexnagaon@gmail.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export interface PushSubscriptionRecord {
  endpoint: string;
  p256dh: string;
  auth_key: string;
  admin_email: string;
  user_agent?: string;
}

/**
 * Send a real push notification to ALL active admin devices.
 * Idempotent: will not resend for the same orderId.
 */
export async function sendNewOrderPush(order: {
  id: string;
  total: number;
  items: Array<{ quantity: number }>;
}): Promise<void> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('[PushSender]: VAPID keys not configured. Skipping push.');
    return;
  }

  try {
    const { SupabasePushDB } = await import('./supabase-push-db');

    // Idempotency guard: only send once per order
    const alreadySent = await SupabasePushDB.isPushSent(order.id);
    if (alreadySent) {
      console.log(`[PushSender]: Notification for ${order.id} already sent. Skipping.`);
      return;
    }

    // Fetch all active admin subscriptions
    const subscriptions = await SupabasePushDB.fetchActiveSubscriptions();
    if (subscriptions.length === 0) {
      console.log('[PushSender]: No registered admin devices. Skipping.');
      return;
    }

    const itemCount = order.items.reduce((sum, i) => sum + (i.quantity || 1), 0);
    const payload = JSON.stringify({
      type: 'NEW_ORDER',
      title: 'NenoFlex — New Order 🔥',
      body: `Order ${order.id} • ${itemCount} item${itemCount !== 1 ? 's' : ''} • ₹${order.total.toLocaleString('en-IN')}`,
      orderId: order.id,
      url: '/admin',
    });

    let sentCount = 0;
    const invalidEndpoints: string[] = [];

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth_key },
            },
            payload,
            { TTL: 86400 } // 24 hours TTL
          );
          sentCount++;
        } catch (err: any) {
          // 410 Gone or 404 = subscription expired/invalid
          if (err?.statusCode === 410 || err?.statusCode === 404) {
            invalidEndpoints.push(sub.endpoint);
          } else {
            console.error(`[PushSender]: Failed to send to ${sub.endpoint.slice(0, 40)}:`, err?.message);
          }
        }
      })
    );

    // Clean up invalid/expired subscriptions
    for (const ep of invalidEndpoints) {
      await SupabasePushDB.deleteSubscription(ep);
    }

    // Record as sent (idempotency key)
    await SupabasePushDB.markPushSent(order.id, sentCount);

    console.log(`[PushSender]: ✅ Sent to ${sentCount}/${subscriptions.length} devices for order ${order.id}`);
  } catch (err: any) {
    // Never let push failures break the order response
    console.error('[PushSender]: Exception (non-fatal):', err?.message || err);
  }
}

/**
 * Send a test push notification to all devices for a specific admin.
 */
export async function sendTestPush(adminEmail: string): Promise<{ sent: number; error?: string }> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return { sent: 0, error: 'VAPID keys not configured on server.' };
  }

  try {
    const { SupabasePushDB } = await import('./supabase-push-db');
    const subscriptions = await SupabasePushDB.fetchSubscriptionsForAdmin(adminEmail);

    if (subscriptions.length === 0) {
      return { sent: 0, error: 'No registered devices for this admin.' };
    }

    const payload = JSON.stringify({
      type: 'TEST',
      title: 'NenoFlex — Test Notification ✅',
      body: 'Push notifications are working! You\'ll receive alerts for new orders.',
      url: '/admin',
    });

    let sentCount = 0;
    const invalidEndpoints: string[] = [];

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
            payload,
            { TTL: 3600 }
          );
          sentCount++;
        } catch (err: any) {
          if (err?.statusCode === 410 || err?.statusCode === 404) {
            invalidEndpoints.push(sub.endpoint);
          }
        }
      })
    );

    for (const ep of invalidEndpoints) {
      await SupabasePushDB.deleteSubscription(ep);
    }

    return { sent: sentCount };
  } catch (err: any) {
    return { sent: 0, error: err?.message || 'Unknown error' };
  }
}
