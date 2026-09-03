const VERSION = 'v3.1';

const STATIC_CACHE = `static-${VERSION}`;
const DYNAMIC_CACHE = `dynamic-${VERSION}`;

const STATIC_ASSETS = [
  // Main page
  '/',
  '/index.html',

  // CSS
  '/css/ajuste.css',
  '/css/ascan.css',
  '/css/ascan-ux.css',
  '/css/barcode.css',
  '/css/hilos.css',
  '/css/home.css',
  '/css/invrack.css',
  '/css/konami.css',
  '/css/materiales.css',
  '/css/materialize.min.css',
  '/css/navigationbar.css',
  '/css/partescompradas.css',
  '/css/reglatres.css',
  '/css/scan.css',
  '/css/table.css',
  '/css/velcros.css',
  '/css/zipper.css',

  // JavaScript
  '/js/ajuste.js',
  '/js/ascan.js',
  '/js/ascan-ux.js',
  '/js/barcode.js',
  '/js/hilos.js',
  '/js/hilosdb.js',
  '/js/invrack.js',
  '/js/JsBarcode.all.min.js',
  '/js/konami.js',
  '/js/materiales.js',
  '/js/materialize.min.js',
  '/js/navigationbar.js',
  '/js/partescompradas.js',
  '/js/partsdb.js',
  '/js/reglatres.js',
  '/js/scan.js',
  '/js/table.js',
  '/js/velcros_3.1_noSuper.js',
  '/js/velcros_3.1_Super.js',
  '/js/zipper.js',

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

  // Add the manifest if the application has one:
  // '/manifest.json'
];

/*
 * INSTALL
 *
 * Save all essential application files in the static cache.
 */
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);

      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
          console.log('[SW] Cached:', asset);
        } catch (error) {
          console.warn('[SW] Failed to cache:', asset, error);
        }
      }

      await self.skipWaiting();
    })()
  );
});

/*
 * ACTIVATE
 *
 * Delete caches belonging to older service-worker versions.
 */
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames.map(cacheName => {
          if (
            cacheName !== STATIC_CACHE &&
            cacheName !== DYNAMIC_CACHE
          ) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }

          return Promise.resolve();
        })
      );

      await self.clients.claim();
    })()
  );
});

/*
 * LIMIT DYNAMIC CACHE
 *
 * Delete the oldest entries when the maximum size is exceeded.
 */
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const requests = await cache.keys();

  while (requests.length > maxItems) {
    const oldestRequest = requests.shift();
    await cache.delete(oldestRequest);
  }
}

/*
 * DETERMINE WHETHER A RESPONSE CAN BE CACHED
 */
function canCacheResponse(request, response) {
  if (!response || !response.ok) {
    return false;
  }

  const requestUrl = new URL(request.url);

  // Only dynamically cache files from this website.
  if (requestUrl.origin !== self.location.origin) {
    return false;
  }

  return response.type === 'basic';
}

/*
 * SAVE A RESPONSE IN THE DYNAMIC CACHE
 */
async function saveToDynamicCache(request, response) {
  if (canCacheResponse(request, response)) {
    const cache = await caches.open(DYNAMIC_CACHE);

    await cache.put(request, response.clone());
    await limitCacheSize(DYNAMIC_CACHE, 50);
  }

  return response;
}

/*
 * FETCH
 */
self.addEventListener('fetch', event => {
  const request = event.request;

  // Service workers should only cache GET requests.
  if (request.method !== 'GET') {
    return;
  }

  // Do not handle unsupported URL protocols.
  if (!request.url.startsWith('http')) {
    return;
  }

  /*
   * HTML NAVIGATION
   *
   * Strategy:
   * 1. Return the requested page from the cache.
   * 2. If it is not cached, request it from the network.
   * 3. Save the successful network response.
   * 4. If offline, return index.html as a fallback.
   */
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(request);

          await saveToDynamicCache(request, networkResponse);

          return networkResponse;
        } catch (error) {
          console.warn(
            '[SW] Navigation failed while offline:',
            request.url
          );

          const indexFallback = await caches.match('/index.html');

          if (indexFallback) {
            return indexFallback;
          }

          return new Response(
            `
              <!DOCTYPE html>
              <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                  >
                  <title>Offline</title>
                </head>
                <body>
                  <h1>You are offline</h1>
                  <p>
                    This page is not currently available offline.
                  </p>
                </body>
              </html>
            `,
            {
              status: 503,
              statusText: 'Offline',
              headers: {
                'Content-Type': 'text/html; charset=UTF-8'
              }
            }
          );
        }
      })()
    );

    return;
  }

  /*
   * CSS, JAVASCRIPT, IMAGES, FONTS AND OTHER FILES
   *
   * Strategy:
   * 1. Return the file from the cache.
   * 2. If it is not cached, request it from the network.
   * 3. Save the successful network response dynamically.
   */
  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(request);

      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const networkResponse = await fetch(request);

        await saveToDynamicCache(request, networkResponse);

        return networkResponse;
      } catch (error) {
        console.warn(
          '[SW] Resource unavailable while offline:',
          request.url
        );

        return new Response('', {
          status: 503,
          statusText: 'Offline'
        });
      }
    })()
  );
});