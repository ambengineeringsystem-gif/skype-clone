const CACHE_NAME = 'dialer-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/ring.mp3'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

let ringAudio = null;

self.addEventListener('message', event => {
  if (event.data === 'startRing') {
    if (!ringAudio) {
      ringAudio = new Audio('/ring.mp3');
      ringAudio.loop = true;
      ringAudio.play().catch(err => console.log('SW ring play failed', err));
    }
  } else if (event.data === 'stopRing') {
    if (ringAudio) {
      ringAudio.pause();
      ringAudio.currentTime = 0;
      ringAudio = null;
    }
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const action = event.action;
  const callKey = event.notification.data ? event.notification.data.callKey : null;
  if (action === 'answer' || action === 'reject') {
    // Open the app with params
    event.waitUntil(
      clients.openWindow('/?action=' + action + (callKey ? '&callKey=' + callKey : ''))
    );
  } else {
    // Default click, open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});