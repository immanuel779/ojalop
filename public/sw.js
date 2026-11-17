const CACHE_NAME = 'ojaloop-v4'; // Changed version to force update

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the new worker to take over immediately
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // Delete old broken caches
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // 1. Ignore non-GET requests (like POST forms, Server Actions)
  if (event.request.method !== 'GET') return;

  // 2. Ignore Next.js internal requests and API routes
  if (
    event.request.url.includes('/_next/') || 
    event.request.url.includes('/api/')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // If network fails, try the cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // If not in cache, return a valid fallback Response to prevent the crash
          return new Response('You are offline. Please check your internet connection.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain' }),
          });
        });
      })
  );
});