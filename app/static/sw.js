const CACHE = 'solar-v95';
const API_CACHE = 'solar-api-v1';
const API_CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes

const PRECACHE = [
  '/',
  '/static/style.css',
  '/static/app.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE && k !== API_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // WebSocket - skip
  if (url.pathname === '/ws') return;

  // API calls: network-first, cache-fallback with 5min TTL
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(e.request).then(resp => {
        if (resp.ok) {
          const clone = resp.clone();
          caches.open(API_CACHE).then(c => {
            // Store with timestamp header
            const headers = new Headers(clone.headers);
            headers.set('X-Cache-Time', Date.now().toString());
            const cachedResp = new Response(clone.body, {
              status: clone.status,
              statusText: clone.statusText,
              headers: headers
            });
            c.put(e.request, cachedResp);
          });
        }
        // Notify clients they are online
        self.clients.matchAll().then(clients => {
          clients.forEach(c => c.postMessage({ type: 'online' }));
        });
        return resp;
      }).catch(() => {
        // Network failed, try cache
        self.clients.matchAll().then(clients => {
          clients.forEach(c => c.postMessage({ type: 'offline' }));
        });
        return caches.open(API_CACHE).then(c => c.match(e.request)).then(cached => {
          if (cached) {
            const cacheTime = parseInt(cached.headers.get('X-Cache-Time') || '0');
            if (Date.now() - cacheTime < API_CACHE_MAX_AGE) {
              return cached;
            }
            // Even expired cache is better than nothing when offline
            return cached;
          }
          return new Response(JSON.stringify({ error: 'offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        });
      })
    );
    return;
  }

  // Static assets: cache-first, network-fallback
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetched = fetch(e.request).then(resp => {
        if (resp.ok) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
