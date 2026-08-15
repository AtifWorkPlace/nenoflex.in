/**
 * NenoFlex Service Worker — Web Push + Notification Handler
 * Place in /public/sw.js so it's served at https://nenoflex.in/sw.js
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

/**
 * Handle incoming push messages — show OS notification
 */
self.addEventListener('push', (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'NenoFlex', body: event.data ? event.data.text() : 'New notification' };
  }

  const title = data.title || 'NenoFlex — New Order 🔥';
  const options = {
    body: data.body || 'A new order was placed.',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    tag: data.orderId || 'nenoflex-order',          // prevent duplicate notifications for same order
    renotify: false,                                  // don't re-alert if same tag already shown
    requireInteraction: true,                         // keep notification visible until tapped
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/admin',
      orderId: data.orderId || null,
    },
    actions: [
      { action: 'view', title: '📋 View Order' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/**
 * Handle notification click — open/focus admin page
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/admin';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Try to focus an already-open admin tab
        for (const client of windowClients) {
          if (client.url.includes('/admin') && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open a new tab
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

/**
 * Handle subscription expiry — auto-resubscribe with same VAPID key
 */
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: self.__VAPID_PUBLIC_KEY__,
      })
      .then((newSubscription) => {
        return fetch('/api/admin/notifications/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: newSubscription }),
          credentials: 'include',
        });
      })
  );
});
