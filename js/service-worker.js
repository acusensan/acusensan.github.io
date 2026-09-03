"use strict";

/*
 * Change VERSION every time updated website files are deployed.
 */
const VERSION = "2026.09.03.2";
const STATIC_CACHE = `static-${VERSION}`;
const DYNAMIC_CACHE = `dynamic-${VERSION}`;
const MAX_DYNAMIC_CACHE_ITEMS = 50;

const STATIC_ASSETS = [
  // Main page
  "/",
  "/index.html",

  // CSS
  "/css/ajuste.css",
  "/css/ascan.css",
  "/css/ascan-ux.css",
  "/css/barcode.css",
  "/css/hilos.css",
  "/css/home.css",
  "/css/invrack.css",
  "/css/konami.css",
  "/css/materiales.css",
  "/css/materialize.min.css",
  "/css/navigationbar.css",
  "/css/partescompradas.css",
  "/css/reglatres.css",
  "/css/scan.css",
  "/css/table.css",
  "/css/velcros.css",
  "/css/zipper.css",

  // JavaScript
  "/js/ajuste.js",
  "/js/ascan.js",
  "/js/ascan-ux.js",
  "/js/barcode.js",
  "/js/hilos.js",
  "/js/hilosdb.js",
  "/js/invrack.js",
  "/js/JsBarcode.all.min.js",
  "/js/konami.js",
  "/js/materiales.js",
  "/js/materialize.min.js",
  "/js/navigationbar.js",
  "/js/partescompradas.js",
  "/js/partsdb.js",
  "/js/reglatres.js",
  "/js/scan.js",
  "/js/table.js",
  "/js/velcros_3.1_noSuper.js",
  "/js/velcros_3.1_Super.js",
  "/js/zipper.js",

  // HTML pages
  "/ascan.html",
  "/ajuste.html",
  "/barcode.html",
  "/partsdbgen.html",
  "/control-de-zipper.html",
  "/hilos.html",
  "/invrack.html",
  "/partescompradas.html",
  "/reglatres.html",
  "/materiales.html",
  "/scan.html",
  "/table.html",
  "/velcros_3.1_noSuper.html",
  "/velcros_3.1_Super.html",

  // Icons and manifest
  "/icons/settings.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/manifest.json"
];

/* INSTALL */
self.addEventListener("install", event => {
  console.log(`[SW] Installing ${VERSION}`);

  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);

      // Cache files separately so one missing file does not stop installation.
      for (const asset of STATIC_ASSETS) {
        try {
          const response = await fetch(asset, { cache: "reload" });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          await cache.put(asset, response.clone());
          console.log("[SW] Cached:", asset);
        } catch (error) {
          console.warn("[SW] Could not cache:", asset, error);
        }
      }

      await self.skipWaiting();
    })()
  );
});

/* ACTIVATE */
self.addEventListener("activate", event => {
  console.log(`[SW] Activating ${VERSION}`);

  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames.map(cacheName => {
          if (
            cacheName !== STATIC_CACHE &&
            cacheName !== DYNAMIC_CACHE
          ) {
            console.log("[SW] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }

          return Promise.resolve(false);
        })
      );

      await self.clients.claim();
    })()
  );
});

/* LIMIT DYNAMIC CACHE */
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

/* CHECK WHETHER A RESPONSE CAN BE CACHED */
function canCacheResponse(request, response) {
  if (!response || !response.ok) {
    return false;
  }

  const requestUrl = new URL(request.url);

  return (
    requestUrl.origin === self.location.origin &&
    response.type === "basic"
  );
}

/* SAVE RESPONSE */
async function saveResponse(cacheName, request, response) {
  if (!canCacheResponse(request, response)) {
    return;
  }

  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());

  if (cacheName === DYNAMIC_CACHE) {
    await limitCacheSize(cacheName, MAX_DYNAMIC_CACHE_ITEMS);
  }
}

/* NETWORK-FIRST: newest file online, cached file offline */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request, {
      cache: "no-store"
    });

    await saveResponse(
      DYNAMIC_CACHE,
      request,
      networkResponse
    );

    return networkResponse;
  } catch (error) {
    console.warn("[SW] Network failed:", request.url, error);

    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    if (
      request.mode === "navigate" ||
      request.destination === "document"
    ) {
      const fallback =
        (await caches.match("/index.html")) ||
        (await caches.match("/"));

      if (fallback) {
        return fallback;
      }

      return createOfflinePage();
    }

    return createOfflineResponse();
  }
}

/* STALE-WHILE-REVALIDATE: cached file now, newest file next request */
async function staleWhileRevalidate(request, event) {
  const cachedResponse = await caches.match(request);

  const networkPromise = fetch(request, {
    cache: "no-store"
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
        "[SW] Background update failed:",
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

/* OFFLINE HTML */
function createOfflinePage() {
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Offline</title>
  <style>
    body {
      min-height: 100vh;
      margin: 0;
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Arial, sans-serif;
      text-align: center;
      color: #202124;
      background: #f5f7fa;
    }

    main {
      max-width: 480px;
      padding: 32px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }

    button {
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
    <p>Check your connection and try again.</p>
    <button type="button" onclick="location.reload()">
      Try again
    </button>
  </main>
</body>
</html>`,
    {
      status: 503,
      statusText: "Offline",
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
        "Cache-Control": "no-store"
      }
    }
  );
}

function createOfflineResponse() {
  return new Response("", {
    status: 503,
    statusText: "Offline"
  });
}

/* FETCH */
self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  if (!request.url.startsWith("http")) {
    return;
  }

  const requestUrl = new URL(request.url);

  // Do not intercept files from other websites.
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  // HTML uses network-first for immediate website updates.
  if (
    request.mode === "navigate" ||
    request.destination === "document" ||
    requestUrl.pathname.endsWith(".html")
  ) {
    event.respondWith(networkFirst(request));
    return;
  }

  // CSS, JS, images, fonts, and JSON update in the background.
  const revalidateAsset =
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "image" ||
    request.destination === "font" ||
    requestUrl.pathname.endsWith(".css") ||
    requestUrl.pathname.endsWith(".js") ||
    requestUrl.pathname.endsWith(".json") ||
    requestUrl.pathname.endsWith(".svg") ||
    requestUrl.pathname.endsWith(".png") ||
    requestUrl.pathname.endsWith(".jpg") ||
    requestUrl.pathname.endsWith(".jpeg") ||
    requestUrl.pathname.endsWith(".webp") ||
    requestUrl.pathname.endsWith(".woff") ||
    requestUrl.pathname.endsWith(".woff2");

  if (revalidateAsset) {
    event.respondWith(
      staleWhileRevalidate(request, event)
    );
    return;
  }

  event.respondWith(networkFirst(request));
});

/* Allow the webpage to request immediate activation. */
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
