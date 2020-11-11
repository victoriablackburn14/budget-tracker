const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/db.js',
    '/style.css',
    '/index.js'
  ];
  
  const PRECACHE = 'precache-v1';
  const RUNTIME = 'runtime';
  
  self.addEventListener('install', (event) => {
    console.log("install");
    event.waitUntil(
      caches
        .open(PRECACHE)
        .then((cache) => {console.log("open cache");cache.addAll(FILES_TO_CACHE)})
        // .then(self.skipWaiting())
    );
  });
  
  // The activate handler takes care of cleaning up old caches.
  self.addEventListener('activate', (event) => {
    console.log("activate");
    const currentCaches = [PRECACHE];
    event.waitUntil(
      console.log("activating cache"),
      caches
        .keys()
        .then((cacheNames) => {
          return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
        })
        .then((cachesToDelete) => {
          return Promise.all(
            cachesToDelete.map((cacheToDelete) => {
              return caches.delete(cacheToDelete);
            })
          );
        })
        .then(() => self.clients.claim())
    );
    console.log("other console")
  });
  //error is located here//
  self.addEventListener('fetch', (event) => {
    console.log("fetch")
    if (event.request.url.startsWith(self.location.origin)) {
      console.log("checking fetch")
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
  
          return caches.open(PRECACHE).then((cache) => {
            return fetch(event.request).then((response) => {
              return cache.put(event.request, response.clone()).then(() => {
                return response;
              });
            });
          });
        })
      );
    }
  });