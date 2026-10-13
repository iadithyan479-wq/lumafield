const CACHE_NAME = 'lumafield-shell-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/lumafield-192.png',
  './icons/lumafield-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith('lumafield-shell-') && key !== CACHE_NAME)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (!response.ok) {
            return caches.match('./index.html').then(cached => cached || response);
          }
          const copy = response.clone();
          return caches.open(CACHE_NAME)
            .then(cache => cache.put('./index.html', copy))
            .then(() => response);
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (!response.ok) return caches.match(request).then(saved => saved || response);
      const copy = response.clone();
      return caches.open(CACHE_NAME)
        .then(cache => cache.put(request, copy))
        .then(() => response);
    }))
  );
});
