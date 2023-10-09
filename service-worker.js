// service-worker.js
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open('app-static-v1').then((cache) => cache.addAll(['/', '/index.html', '/script.js', '/service-worker.js'])));
});

self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request).then((response) => response || fetch(event.request)));
});
