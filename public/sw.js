// Maǵyna — App shell service worker.
// Кітап мәтіндері IndexedDB-де сақталады (lib/offline.ts); бұл SW тек
// негізгі бет қаңқасы мен статикалық ресурстарды офлайн қолжетімді етеді.

const CACHE_NAME = 'magyna-shell-v1';
const SHELL_URLS = ['/', '/offline', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/offline')))
  );
});
