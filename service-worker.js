'use strict';

/*
 * SERVICE WORKER VERSION
 *
 * Change this value every time you deploy updated files.
 * Examples:
 *   2026.09.03.1
 *   2026.09.03.2
 */
const VERSION = '2026.09.04.6';

const STATIC_CACHE = `static-${VERSION}`;
const DYNAMIC_CACHE = `dynamic-${VERSION}`;

const MAX_DYNAMIC_CACHE_ITEMS = 50;

/*
 * ESSENTIAL OFFLINE FILES
 *
 * Make sure every path below exists.
 */
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
  '/icons/icon-512.png',

  // PWA manifest
  '/manifest.json'
];

/*
 * INSTALL
 *
 * Cache essential application files.
 *
 * Files are cached individually so that one missing file
 * does not prevent the entire service worker from installing.
 */
self.addEventListener('install', event => {
  console.log(`[SW] Installing version ${VERSION}`);

  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);

      for (const asset of STATIC_ASSETS) {
        try {
          /*
           * Request the newest file from the server instead
           * of using the browser's normal HTTP cache.
           */
          const request = new Request(asset, {
            cache: 'reload'
          });

          const response = await fetch(request);

          if (!response.ok) {
            throw new Error(
              `HTTP ${response.status} ${response.statusText}`
            );
          }

          await cache.put(asset, response);

          console.log('[SW] Cached:', asset);
        } catch (error) {
          console.warn(
            '[SW] Failed to cache:',
            asset,
            error
          );
        }
      }

      /*
       * Activate this new service worker without waiting
       * for all previously opened tabs to close.
       */
      await self.skipWaiting();
    })()
  );
});

/*
 * ACTIVATE
 *
 * Delete caches created by older service-worker versions.
 */
self.addEventListener('activate', event => {
  console.log(`[SW] Activating version ${VERSION}`);

  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames.map(cacheName => {
          const isCurrentCache =
            cacheName === STATIC_CACHE ||
            cacheName === DYNAMIC_CACHE;

          if (!isCurrentCache) {
            console.log(
              '[SW] Deleting old cache:',
              cacheName
            );

            return caches.delete(cacheName);
          }

          return Promise.resolve(false);
        })
      );

      /*
       * Immediately control all open pages within scope.
       */
      await self.clients.claim();

      console.log(`[SW] Version ${VERSION} is active`);
    })()
  );
});

/*
 * LIMIT DYNAMIC CACHE
 *
 * Delete the oldest dynamically cached entries when the
 * maximum cache size is exceeded.
 */
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const requests = await cache.keys();

  while (requests.length > maxItems) {
    const oldestRequest = requests.shift();

    if (oldestRequest) {
      await cache.delete(oldestRequest);
    }
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

  /*
   * Only cache resources from this website.
   */
  if (requestUrl.origin !== self.location.origin) {
    return false;
  }

  /*
   * "basic" means a normal same-origin response.
   */
  return response.type === 'basic';
}

/*
 * SAVE RESPONSE
 *
 * Save a successful response in the selected cache.
 */
async function saveResponse(cacheName, request, response) {
  if (!canCacheResponse(request, response)) {
    return;
  }

  const cache = await caches.open(cacheName);

  await cache.put(request, response.clone());

  if (cacheName === DYNAMIC_CACHE) {
    await limitCacheSize(
      DYNAMIC_CACHE,
      MAX_DYNAMIC_CACHE_ITEMS
    );
  }
}

/*
 * NETWORK-FIRST STRATEGY
 *
 * Used for HTML pages and other files where freshness
 * is more important than instant cached loading.
 *
 * 1. Try the network.
 * 2. Save the newest response.
 * 3. If offline, return the cached response.
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request, {
      cache: 'no-store'
    });

    await saveResponse(
      DYNAMIC_CACHE,
      request,
      networkResponse
    );

    return networkResponse;
  } catch (error) {
    console.warn(
      '[SW] Network request failed:',
      request.url,
      error
    );

    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    /*
     * If an HTML page is unavailable, return the
     * cached home page as an offline fallback.
     */
    if (
      request.mode === 'navigate' ||
      request.destination === 'document'
    ) {
      const indexFallback =
        await caches.match('/index.html') ||
        await caches.match('/');

      if (indexFallback) {
        return indexFallback;
      }

      return createOfflinePage();
    }

    return createOfflineResponse();
  }
}

/*
 * STALE-WHILE-REVALIDATE STRATEGY
 *
 * Used for CSS, JavaScript, images, fonts and JSON.
 *
 * 1. Return the cached response immediately, if available.
 * 2. Request the newest version in the background.
 * 3. Save the newest version for the next request.
 */
async function staleWhileRevalidate(request, event) {
  const cachedResponse = await caches.match(request);

  const networkPromise = fetch(request, {
    cache: 'no-store'
  })
    .then(async networkResponse => {
      await saveResponse(
        DYNAMIC_CACHE,
        request,
        networkResponse
      );

      return networkResponse;
    })
    .catch(error => {
      console.warn(
        '[SW] Background update failed:',
        request.url,
        error
      );

      return null;
    });

  /*
   * Keep the background cache update alive even after
   * returning the cached response to the page.
   */
  if (cachedResponse) {
    event.waitUntil(networkPromise);
    return cachedResponse;
  }

  const networkResponse = await networkPromise;

  if (networkResponse) {
    return networkResponse;
  }

  return createOfflineResponse();
}

/*
 * OFFLINE HTML PAGE
 */
function createOfflinePage() {
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
    >
    <meta name="theme-color" content="#ffffff">
    <title>Offline</title>

    <style>
      * {
        box-sizing: border-box;
      }

      body {
        min-height: 100vh;
        margin: 0;
        padding: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: Arial, sans-serif;
        color: #202124;
        background: #f5f7fa;
      }

      main {
        width: 100%;
        max-width: 480px;
        padding: 32px;
        text-align: center;
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      }

      h1 {
        margin-top: 0;
      }

      p {
        line-height: 1.6;
      }

      button {
        margin-top: 12px;
        padding: 12px 20px;
        color: #ffffff;
        background: #1565c0;
        border: 0;
        border-radius: 8px;
        font-size: 16px;
        cursor: pointer;
      }
    </style>
  </head>

  <body>
    <main>
      <h1>You are offline</h1>

      <p>
        This page is not currently available. Check your
        connection and try again.
      </p>

      <button type="button" onclick="window.location.reload()">
        Try again
      </button>
    </main>
  </body>
</html>`,
    {
      status: 503,
      statusText: 'Offline',
      headers: {
        'Content-