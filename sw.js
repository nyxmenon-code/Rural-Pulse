// Themis Planner — Service Worker
// Version: 1.0.0

const CACHE_NAME = 'themis-v1';
const ASSETS = [
  './themis-planner.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install — cache core assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Themis SW] Caching core assets');
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate — clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch — serve from cache, fall back to network
self.addEventListener('fetch', (e) => {
  // Only handle same-origin requests
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request).then(response => {
        // Cache successful GET responses
        if (e.request.method === 'GET' && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback — return main app
        if (e.request.destination === 'document') {
          return caches.match('./themis-planner.html');
        }
      });
    })
  );
});

// Background sync placeholder
self.addEventListener('sync', (e) => {
  console.log('[Themis SW] Background sync:', e.tag);
});
