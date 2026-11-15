const CACHE_NAME = 'ojaloop-v2'; // Changed version to force an update

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Forces the new service worker to take over immediately
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // Deletes the old cached cloth image
          }
        })
      );
    })
  );
});

// NETWORK FIRST: Always try to get the newest version from the internet
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});