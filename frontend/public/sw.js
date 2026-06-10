/**
 * AirAssist Service Worker
 * Handles background Web Push notifications for boarding alerts.
 * This file must be in the /public root so it registers at scope '/'.
 */

const CACHE_NAME = 'airassist-v1';

// ── Install ───────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing AirAssist Service Worker...');
  self.skipWaiting();
});

// ── Activate ──────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// ── Push Event ────────────────────────────────────────────────────────────────
// Fires when the server sends a Web Push message
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');

  let data = {
    title: '✈️ AirAssist Alert',
    body: 'You have a new notification.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: { url: '/' },
    actions: [],
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/badge-72x72.png',
    data: data.data || {},
    actions: data.actions || [],
    vibrate: [200, 100, 200, 100, 400],
    requireInteraction: true,   // stays on screen until user interacts
    tag: 'boarding-alert',      // replace previous notification of same type
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ── Notification Click ────────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/boarding-pass';
  const action = event.action;

  if (action === 'navigate' || !action) {
    // Open/focus the app
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        return self.clients.openWindow(targetUrl);
      })
    );
  }
});
