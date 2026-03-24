// Service Worker for PWA Support
const CACHE_NAME = 'saoyad-portfolio-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/logo.avif',
  '/wallpaper.jpg',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log('Service Worker: Caching files');
      await cache.addAll(urlsToCache);
      await self.skipWaiting();
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(name);
          })
      );
      await self.clients.claim();
    })()
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);

      // Cache hit - return response
      if (cached) {
        return cached;
      }

      try {
        const response = await fetch(event.request.clone());

        // Cache valid same-origin responses
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, responseToCache);
        }

        return response;
      } catch {
        // Return offline fallback
        return caches.match('/index.html');
      }
    })()
  );
});
