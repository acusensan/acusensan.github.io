const VERSION = 'v7';

const STATIC_CACHE = 'static-' + VERSION;
const DYNAMIC_CACHE = 'dynamic-' + VERSION;

const STATIC_ASSETS = [
  '/',
  '/index.html',

  '/css/materialize.min.css',
  '/css/navigationbar.css',

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

  '/icons/settings.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// INSTALL
self.addEventListener('install', event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// ACTIVATE
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// LIMIT CACHE SIZE
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

  // ALWAYS get fresh HTML
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(res => {
          return caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, res.clone());
            return res;
          });
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // STATIC: cache first
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        return caches.open(DYNAMIC_CACHE).then(cache => {
          cache.put(request, response.clone());
          limitCacheSize(DYNAMIC_CACHE, 50);
          return response;
        });
      });
    })
  );
});
// BACKGROUND SYNC
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncPendingData());
  }
});

// Function to retry sending stored requests
async function syncPendingData() {
  // Example: get stored data from IndexedDB (you must implement it)
  const data = await getStoredRequests();

  for (let item of data) {
    try {
      await fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify(item),
        headers: { 'Content-Type': 'application/json' }
      });

      await deleteStoredRequest(item.id); // remove if success
    } catch (err) {
      console.log('Sync failed, will retry later');
    }
  }
}

async function sendData(data) {
  try {
    await fetch('/api/save', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    const reg = await navigator.serviceWorker.ready;

    await saveRequestLocally(data); // store in IndexedDB

    await reg.sync.register('sync-data');
  }
}

// PERIODIC SYNC
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-data') {
    event.waitUntil(updateCachedData());
  }
});

async function updateCachedData() {
  try {
    const response = await fetch('/api/data');
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put('/api/data', response.clone());
  } catch (err) {
    console.log('Periodic sync failed');
  }
}

async function registerPeriodicSync() {
  const reg = await navigator.serviceWorker.ready;

  if ('periodicSync' in reg) {
    const status = await navigator.permissions.query({
      name: 'periodic-background-sync'
    });

    if (status.state === 'granted') {
      await reg.periodicSync.register('update-data', {
        minInterval: 24 * 60 * 60 * 1000 // 1 day
      });
    }
  }
}