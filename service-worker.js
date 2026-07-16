const VERSION = 'v1.3';
const STATIC_CACHE = `static-${VERSION}`;
const DYNAMIC_CACHE = `dynamic-${VERSION}`;

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

  // HTML pages
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

//
//  INSTALL
//
self.addEventListener('install', event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(STATIC_CACHE).then(async cache => {
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
          console.log('[SW] Cached:', asset);
        } catch (err) {
          console.warn('[SW] Failed to cache:', asset);
        }
      }
    })
  );
});

//
//  ACTIVATE
//
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

//
//  LIMIT CACHE SIZE
//
function limitCacheSize(name, size) {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(() => limitCacheSize(name, size));
      }
    });
  });
}

//
//  FETCH
//
self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  //
  //  HTML NAVIGATION (FIXED!)
  //
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request).then(cached => {
        return (
          cached ||
          fetch(request)
            .then(response => {
              return caches.open(DYNAMIC_CACHE).then(cache => {
                cache.put(request, response.clone());
                return response;
              });
            })
            .catch(() => caches.match('/index.html'))
        );
      })
    );
    return;
  }

  //
  //  STATIC FILES (CSS, JS, IMAGES)
  //
  event.respondWith(
    caches.match(request).then(cached => {
      return (
        cached ||
        fetch(request)
          .then(response => {
            return caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, response.clone());
              limitCacheSize(DYNAMIC_CACHE, 50);
              return response;
            });
          })
          .catch(() => {
            // fallback (optional)
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
          })
      );
    })
  );
});