// firebase-messaging-sw.js
// Service Worker for Firebase Cloud Messaging push notifications

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyCLz4cXKGxILS5Use2KPe4XaUnLRhcrIyg",
  authDomain:        "thebohothread-96e2c.firebaseapp.com",
  projectId:         "thebohothread-96e2c",
  storageBucket:     "thebohothread-96e2c.firebasestorage.app",
  messagingSenderId: "100688387088",
  appId:             "1:100688387088:web:f8a6af7565d3c25952fe95",
  measurementId:     "G-5VTK93354M"
});

const messaging = firebase.messaging();

// Handle background push messages (when user is NOT on the site)
messaging.onBackgroundMessage(function(payload) {
  console.log('[SW] Background message received:', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || 'SplitMate';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'You have a new notification.',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    tag: payload.data?.tag || 'splitmate-notification',
    data: payload.data || {},
    actions: [
      { action: 'open', title: '📂 Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    requireInteraction: false,
    vibrate: [200, 100, 200]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/dashboard.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Focus existing tab if open
      for (const client of clientList) {
        if (client.url.includes('thebohothread') || client.url.includes('localhost')) {
          return client.focus().then(() => client.navigate(url));
        }
      }
      // Otherwise open new tab
      return clients.openWindow(url);
    })
  );
});
