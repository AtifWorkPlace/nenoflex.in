/**
 * NenoFlex Supabase Push Subscriptions DB — Server-only
 * Handles CRUD for admin push subscriptions and idempotency log.
 * Provides dual-layer storage: uses dedicated tables if available,
 * or transparently falls back to Supabase site_settings JSON store.
 */

import { createClient } from '@supabase/supabase-js';

function getServerClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';
  if (!url || !key) throw new Error('Supabase server credentials not configured');
  return createClient(url, key);
}

export interface PushSubscriptionRecord {
  endpoint: string;
  p256dh: string;
  auth_key: string;
  admin_email: string;
  user_agent?: string;
  is_active?: boolean;
  created_at?: string;
  last_seen_at?: string;
}

interface PushLogRecord {
  order_id: string;
  sent_at: string;
  device_count: number;
}

// In-memory cache for fast lookup during high-throughput requests
let memorySubscriptions: PushSubscriptionRecord[] = [];
let memoryLog: Record<string, PushLogRecord> = {};

// Helper to access fallback store in site_settings
async function fetchStoreJson<T>(storeKey: string, defaultValue: T): Promise<T> {
  try {
    const db = getServerClient();
    const { data, error } = await db
      .from('site_settings')
      .select('catalog_data')
      .eq('id', storeKey)
      .maybeSingle();

    if (error || !data) return defaultValue;
    return (data.catalog_data as T) || defaultValue;
  } catch {
    return defaultValue;
  }
}

async function saveStoreJson<T>(storeKey: string, data: T): Promise<boolean> {
  try {
    const db = getServerClient();
    const { error } = await db.from('site_settings').upsert({
      id: storeKey,
      catalog_data: data as any,
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}

export const SupabasePushDB = {
  /**
   * Fetch all active push subscriptions (all admin devices).
   */
  fetchActiveSubscriptions: async (): Promise<PushSubscriptionRecord[]> => {
    try {
      const db = getServerClient();
      const { data, error } = await db
        .from('admin_push_subscriptions')
        .select('endpoint, p256dh, auth_key, admin_email, user_agent, is_active')
        .eq('is_active', true);

      if (!error && Array.isArray(data)) {
        return data as PushSubscriptionRecord[];
      }
    } catch {
      // Fall through to fallback store
    }

    // Fallback store in site_settings
    const store = await fetchStoreJson<PushSubscriptionRecord[]>('admin_push_subscriptions_store', []);
    memorySubscriptions = store.filter((s) => s.is_active !== false);
    return memorySubscriptions;
  },

  /**
   * Fetch subscriptions for a specific admin (for test push).
   */
  fetchSubscriptionsForAdmin: async (adminEmail: string): Promise<PushSubscriptionRecord[]> => {
    const all = await SupabasePushDB.fetchActiveSubscriptions();
    return all.filter((s) => s.admin_email.toLowerCase() === adminEmail.toLowerCase());
  },

  /**
   * Save or update a push subscription (upsert by endpoint).
   */
  saveSubscription: async (sub: PushSubscriptionRecord): Promise<boolean> => {
    // 1. Try dedicated table first
    try {
      const db = getServerClient();
      const { error } = await db.from('admin_push_subscriptions').upsert(
        {
          admin_email: sub.admin_email,
          endpoint: sub.endpoint,
          p256dh: sub.p256dh,
          auth_key: sub.auth_key,
          user_agent: sub.user_agent || null,
          is_active: true,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' }
      );

      if (!error) return true;
    } catch {
      // Fall through to fallback
    }

    // 2. Fallback to site_settings JSON store
    const store = await fetchStoreJson<PushSubscriptionRecord[]>('admin_push_subscriptions_store', []);
    const existingIdx = store.findIndex((s) => s.endpoint === sub.endpoint);
    const now = new Date().toISOString();
    const updatedSub: PushSubscriptionRecord = {
      ...sub,
      is_active: true,
      created_at: existingIdx >= 0 ? store[existingIdx].created_at || now : now,
      last_seen_at: now,
    };

    if (existingIdx >= 0) {
      store[existingIdx] = updatedSub;
    } else {
      store.push(updatedSub);
    }

    const saved = await saveStoreJson('admin_push_subscriptions_store', store);
    if (saved) {
      memorySubscriptions = store.filter((s) => s.is_active !== false);
    }
    return saved;
  },

  /**
   * Mark a subscription as inactive (soft delete by endpoint).
   */
  deleteSubscription: async (endpoint: string): Promise<void> => {
    try {
      const db = getServerClient();
      await db
        .from('admin_push_subscriptions')
        .update({ is_active: false })
        .eq('endpoint', endpoint);
    } catch {}

    const store = await fetchStoreJson<PushSubscriptionRecord[]>('admin_push_subscriptions_store', []);
    const updated = store.map((s) => (s.endpoint === endpoint ? { ...s, is_active: false } : s));
    await saveStoreJson('admin_push_subscriptions_store', updated);
    memorySubscriptions = updated.filter((s) => s.is_active !== false);
  },

  /**
   * Hard delete a specific subscription by endpoint (for unregister).
   */
  hardDeleteSubscription: async (endpoint: string): Promise<void> => {
    try {
      const db = getServerClient();
      await db.from('admin_push_subscriptions').delete().eq('endpoint', endpoint);
    } catch {}

    const store = await fetchStoreJson<PushSubscriptionRecord[]>('admin_push_subscriptions_store', []);
    const updated = store.filter((s) => s.endpoint !== endpoint);
    await saveStoreJson('admin_push_subscriptions_store', updated);
    memorySubscriptions = updated;
  },

  /**
   * Get device count for an admin (for status display).
   */
  getDeviceCountForAdmin: async (adminEmail: string): Promise<number> => {
    const list = await SupabasePushDB.fetchSubscriptionsForAdmin(adminEmail);
    return list.length;
  },

  /**
   * Idempotency: check if push was already sent for this order.
   */
  isPushSent: async (orderId: string): Promise<boolean> => {
    if (memoryLog[orderId]) return true;

    try {
      const db = getServerClient();
      const { data, error } = await db
        .from('push_notification_log')
        .select('order_id')
        .eq('order_id', orderId)
        .maybeSingle();

      if (!error && data) {
        memoryLog[orderId] = { order_id: orderId, sent_at: new Date().toISOString(), device_count: 1 };
        return true;
      }
    } catch {}

    const store = await fetchStoreJson<Record<string, PushLogRecord>>('push_notification_log_store', {});
    if (store[orderId]) {
      memoryLog[orderId] = store[orderId];
      return true;
    }
    return false;
  },

  /**
   * Record that push was sent for this order (idempotency key).
   */
  markPushSent: async (orderId: string, deviceCount: number): Promise<void> => {
    const rec: PushLogRecord = {
      order_id: orderId,
      sent_at: new Date().toISOString(),
      device_count: deviceCount,
    };
    memoryLog[orderId] = rec;

    try {
      const db = getServerClient();
      await db
        .from('push_notification_log')
        .upsert(rec, { onConflict: 'order_id' });
    } catch {}

    const store = await fetchStoreJson<Record<string, PushLogRecord>>('push_notification_log_store', {});
    store[orderId] = rec;
    await saveStoreJson('push_notification_log_store', store);
  },
};
