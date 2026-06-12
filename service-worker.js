const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',

  // CSS
  '/css/materialize.min.css',
  '/css/navigationbar.css',

  // JS
  '/js/materialize.min.js',
  '/js/navigationbar.js',
  '/js/ajuste.js',
  '/js/barcode.js',
  '/js/hilos.js',
  '/js/invrack.js',
  '/js/JsBarcode.all.min.js',
  '/js/partescompradas.js',
  '/js/partsdb.js',
  '/js/reglatres.js',
  '/js/scan.js',
  '/js/table.js',

  // Pages
  '/ascan.html',
  '/ajuste.html',
  '/barcode.html',
  '/codegen.html',
  '/hilos.html',
  '/invrack.html',
  '/partescompradas.html',
  '/reglatres.html',
  '/scan.html',
  '/table.html',
  '/velcros_3.1_noSuper.html',
  '/velcros_3.1_Super.html',

  // Icons
  '/icons/settings.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// INSTALL
self.addEventListener('install', event => {
  self.skipWaiting();

  event.waitUntil(
  caches.open(STATIC_CACHE).then(cache => {
    return Promise.all(
      STATIC_ASSETS.map(url =>
        cache.add(url).catch(err => console.warn('Failed to cache:', url))
      )
    );
  })
);
});

// ACTIVATE
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});
function limitCacheSize(name, size) {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(() => limitCacheSize(name, size));
      }
    });
  });
}

// FETCH
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const request = event.request;

  // Handle page navigation
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (!response || response.status !== 200) return response;

          return caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, response.clone());
            return response;
          });
        })
        .catch(() =>
          caches.match(request).then(res => res || caches.match('/index.html'))
        )
    );
    return;
  }

  // Static files (cache first)
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        if (!response || response.status !== 200) return response;

        return caches.open(DYNAMIC_CACHE).then(cache => {
          cache.put(request, response.clone());
          limitCacheSize(DYNAMIC_CACHE, 50);
          return response;
        });
      });
    })
  );
});