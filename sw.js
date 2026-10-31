/* Al-Falah Islamic Academy — Service Worker
 * Strategy:
 *  - Only same-origin GET requests are handled here. Supabase (different origin),
 *    Google Fonts, jsDelivr and Analytics pass straight through to the network,
 *    so live auth/data is NEVER served from cache.
 *  - HTML pages: network-first (fresh content when online, cached shell offline).
 *  - Other static assets (css/js/images/icons): cache-first (fast, offline-ready).
 */
const CACHE = 'alfalah-v2';

const PRECACHE = [
  '/',
  '/index.html',
  '/login.html',
  '/student-dashboard.html',
  '/teacher-dashboard.html',
  '/admin-dashboard.html',
  '/enroll.html',
  '/lessons.html',
  '/manifest.json',
  '/assets/app.js',
  '/assets/dashboard-shared.js',
  '/supabase-config.js',
  '/assets/logo-full.png',
  '/assets/logo-icon.png',
  '/assets/favicon.png',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/maskable-192.png',
  '/assets/maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      // addAll fails the whole install if one file 404s; add individually instead.
      .then((cache) => Promise.allSettled(PRECACHE.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin GET. Everything else (Supabase, fonts, CDN, analytics,
  // and all POST/auth requests) goes straight to the network.
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  const isHTML = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    // Network-first for pages.
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('/login.html')))
    );
    return;
  }

  // Cache-first for other static assets.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
