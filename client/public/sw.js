// Caches the app shell so the site opens without a network. Songs and API calls are never cached.
const CACHE = 'shell-v1'; // bump to drop old entries; hashed /assets files are immutable so this rarely needs it

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.add('/')).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);
  // Only same-origin GETs: the API (Render) and audio/images (Cloudinary) are other origins and pass through
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (url.pathname.startsWith('/assets/')) {
    // hashed filenames never change content: cache first
    e.respondWith(
      caches.match(request).then((hit) => hit || fetch(request).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(request, copy)); }
        return res;
      }))
    );
    return;
  }

  // pages and other files: network first so a new deploy shows up at once, cache only when offline
  e.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok && (request.mode === 'navigate' || url.pathname.match(/\.(png|svg|webmanifest)$/))) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request.mode === 'navigate' ? '/' : request, copy));
        }
        return res;
      })
      .catch(() => caches.match(request.mode === 'navigate' ? '/' : request).then((hit) => hit || Response.error()))
  );
});
