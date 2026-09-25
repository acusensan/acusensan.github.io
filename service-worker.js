'use strict';

/*
 * SERVICE WORKER VERSION
 *
 * Change this value whenever you deploy updated files.
 */
const VERSION = '2026.09.25.1';

const STATIC_CACHE = `static-${VERSION}`;
const DYNAMIC_CACHE = `dynamic-${VERSION}`;

const MAX_DYNAMIC_CACHE_ITEMS = 50;

/*
 * STATIC ASSETS
 *
 * Every path should exist on the server.
 * Missing files will be reported in the console but will not
 * prevent the remaining files from being cached.
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
 * Cache the application shell.
 */
self.addEventListener('install', event => {
  console.log(`[SW] Installing version ${VERSION}`);

  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);

      const results = await Promise.allSettled(
        STATIC_ASSETS.map(async asset => {
          const request = new Request(asset, {
            cache: 'reload'
          });

          const response = await fetch(request);

          if (!response.ok) {
            throw new Error(
              `${asset}: HTTP ${response.status} ${response.statusText}`
            );
          }

          await cache.put(request, response);

          console.log('[SW] Cached:', asset);

          return asset;
        })
      );

      const failedAssets = results
        .filter(result => result.status === 'rejected')
        .map(result => result.reason);

      if (failedAssets.length > 0) {
        console.warn(
          `[SW] ${failedAssets.length} file(s) failed to cache:`,
          failedAssets
        );
      }

      /*
       * Verify that the main offline page was cached.
       * Without index.html, navigation would not have a reliable fallback.
       */
      const cachedIndex = await cache.match('/index.html');

      if (!cachedIndex) {
        throw new Error(
          '[SW] Installation failed because /index.html was not cached.'
        );
      }

      const cachedRequests = await cache.keys();

      console.log(
        `[SW] Static cache contains ${cachedRequests.length} file(s).`
      );

      /*
       * Activate the new service worker immediately.
       */
      await self.skipWaiting();
    })()
  );
});

/*
 * ACTIVATE
 *
 * Delete old application caches and take control of open pages.
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
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }

          return Promise.resolve(false);
        })
      );

      await self.clients.claim();

      console.log(`[SW] Version ${VERSION} is active.`);
    })()
  );
});

/*
 * LIMIT DYNAMIC CACHE
 *
 * Remove the oldest cached entries when the limit is exceeded.
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
 * CHECK WHETHER A RESPONSE CAN BE CACHED
 */
function canCacheResponse(request, response) {
  if (!response || !response.ok) {
    return false;
  }

  const requestUrl = new URL(request.url);

  if (requestUrl.origin !== self.location.origin) {
    return false;
  }

  return response.type === 'basic';
}

/*
 * SAVE A RESPONSE
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
 * FIND A CACHED RESPONSE
 *
 * Search the static cache first, then the dynamic cache.
 */
async function findCachedResponse(request) {
  const staticCache = await caches.open(STATIC_CACHE);
  const dynamicCache = await caches.open(DYNAMIC_CACHE);

  let cachedResponse = await staticCache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  cachedResponse = await dynamicCache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  /*
   * Try matching only the pathname.
   *
   * This helps when the requested URL contains query parameters,
   * such as /scan.html?source=pwa.
   */
  const requestUrl = new URL(request.url);
  const pathname = requestUrl.pathname;

  cachedResponse = await staticCache.match(pathname);

  if (cachedResponse) {
    return cachedResponse;
  }

  return dynamicCache.match(pathname);
}

/*
 * NETWORK-FIRST
 *
 * Used for HTML navigation:
 * 1. Try the network.
 * 2. Cache the newest response.
 * 3. Use the cache when offline.
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

    const cachedResponse = await findCachedResponse(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    /*
     * Return the cached home page when a requested HTML page
     * is not available offline.
     */
    if (
      request.mode === 'navigate' ||
      request.destination === 'document'
    ) {
      const staticCache = await caches.open(STATIC_CACHE);

      const indexFallback =
        await staticCache.match('/index.html') ||
        await staticCache.match('/');

      if (indexFallback) {
        return indexFallback;
      }

      return createOfflinePage();
    }

    return createOfflineResponse();
  }
}

/*
 * STALE-WHILE-REVALIDATE
 *
 * Used for CSS, JavaScript, images, fonts, JSON and manifests:
 * 1. Return the cached response immediately.
 * 2. Update the cache in the background.
 * 3. Use the network directly if no cached response exists.
 */
async function staleWhileRevalidate(request, event) {
  const cachedResponse = await findCachedResponse(request);

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
 * CACHE-FIRST
 *
 * Used for files that rarely change, such as icons.
 */
async function cacheFirst(request) {
  const cachedResponse = await findCachedResponse(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    await saveResponse(
      DYNAMIC_CACHE,
      request,
      networkResponse
    );

    return networkResponse;
  } catch (error) {
    console.warn(
      '[SW] Resource unavailable offline:',
      request.url,
      error
    );

    return createOfflineResponse();
  }
}

/*
 * FETCH
 *
 * Intercept requests made by controlled pages.
 */
self.addEventListener('fetch', event => {
  const request = event.request;

  /*
   * Cache only GET requests.
   */
  if (request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(request.url);

  /*
   * Ignore browser extension requests and unsupported protocols.
   */
  if (
    requestUrl.protocol !== 'http:' &&
    requestUrl.protocol !== 'https:'
  ) {
    return;
  }

  /*
   * HTML navigation uses network-first so pages stay current
   * while still working offline.
   */
  if (
    request.mode === 'navigate' ||
    request.destination === 'document'
  ) {
    event.respondWith(networkFirst(request));
    return;
  }

  /*
   * CSS, JavaScript, JSON and manifests use
   * stale-while-revalidate.
   */
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'manifest' ||
    requestUrl.pathname.endsWith('.json')
  ) {
    event.respondWith(
      staleWhileRevalidate(request, event)
    );
    return;
  }

  /*
   * Images and fonts use cache-first.
   */
  if (
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  /*
   * Other same-origin GET requests use network-first.
   */
  if (requestUrl.origin === self.location.origin) {
    event.respondWith(networkFirst(request));
  }
});

/*
 * OFFLINE HTML PAGE
 */
function createOfflinePage() {
  const offlineHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
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

    <button type="button" onclick="window.location.reload()"> Try again </button>
  </main>
</body>
</html>`;

  return new Response(offlineHtml, {
    status: 503,
    statusText: 'Offline',
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'no-store'
    }
  });
}

/*
 * GENERIC OFFLINE RESPONSE
 */
function createOfflineResponse() {
  return new Response('Resource unavailable while offline.', {
    status: 503,
    statusText: 'Offline',
    headers: {
      'Content-Type': 'text/plain; charset=UTF-8',
      'Cache-Control': 'no-store'
    }
  });
}