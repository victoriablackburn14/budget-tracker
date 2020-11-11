const PRECACHE = 'offline-form';
const IDB_VERSION=1;
const FOLDER_NAME= 'post requests';
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/db.js',
    '/style.css',
    '/index.js',
    'https://cdn.jsdelivr.net/npm/chart.js@2.8.0',
    'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css'
  ];
  
  
  
  self.addEventListener('install', (event) => {
    if (event.request.cache === 'only-if-cached' && e.request.mode !== 'same-origin') {
      return;
    }
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

  function getObjectStore (transaction, store) {
    return db.transaction(transaction, store).objectStore(transaction)
  }
  
  function savePostRequests (url, payload) {
    var request = getObjectStore(FOLDER_NAME, 'readwrite').add({
      url: url,
      payload: payload,
      method: 'POST'
    })
    request.onsuccess = function (event) {
      console.log('a new post_ request has been added to indexedb')
    }
  
    request.onerror = function (error) {
      console.error(error)
    }
  }


  function openDatabase(){
    var indexedDBOpen = indexedDB.open('budget', IDB_VERSION)

    indexedDBOpen.onerror = function (error) {
      // error creating db
      console.error('IndexedDB error:', error)
  
  }
  indexedDBOpen.onupgradeneeded = function () {
    // This should only executes if there's a need to 
    // create/update db.
    this.result.createObjectStore('post_requests', {
     autoIncrement:  true, keyPath: 'id' })
  }
    // This will execute each time the database is opened.
    indexedDBOpen.onsuccess = function () {
      our_db = this.result
    }
  }
  var our_db
  openDatabase();


  self.addEventListener('fetch', (event) => {
    if (event.request.cache === 'only-if-cached' && e.request.mode !== 'same-origin') {
      return;
    }
    console.log("fetch")
    if (event.request.method==='GET') {
      console.log("checking fetch")
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch (event.request);
        }
        )
      );
    } else if (event.request.clone().method ==='POST'){
      console.log('budget data', budget)
      event.respondWith(fetch(event.request.clone().catch))
      savePostRequests(event.request.clone()).catch(function(error){
        savePostRequests(event.request.clone().url, budget)
      })
    }
  });

  self.addEventListener('message', function(event){
    console.log('transaction_data', event.data)
    if(event.data.hasOwnProperty('transaction_data')){
      transaction_data= event.data.transaction_data
    }
  });

  function sendToServer (){
    const savedRequest=[]
    var req = getObjectStore(FOLDER_NAME).openCursor() 

    req.onsuccess = async function (event) {
      var cursor = event.target.result
  
      if (cursor) {

        savedRequests.push(cursor.value)
        cursor.continue()
      } else {
      
          for (let savedRequest of savedRequests) {
            console.log('saved request', savedRequest)
            var requestUrl = savedRequest.url
            var payload = JSON.stringify(savedRequest.payload)
            var method = savedRequest.method
            var headers = {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
            fetch(requestUrl, {
              headers: headers,
              method: method,
              body: payload
            }).then(function (response) {
              console.log('server response', response)
              if (response.status < 400) {
                getObjectStore(FOLDER_NAME, 'readwrite').delete(savedRequest.id)
              } 
            }).catch(function (error) {

              console.error('Send to Server failed:', error)
            })
          }
      }
    }
  }
  
  
  self.addEventListener('sync', function (event) {
    console.log('now online')
    if (event.tag === 'sendFormData') { 
      event.waitUntil(

        sendPostToServer()
        )
    }
  });

  
          // return caches.open(PRECACHE).then((cache) => {
          //   return fetch(event.request).then((response) => {
          //     return cache.put(event.request, response.clone()).then(() => {
          //       return response;
  //             });
  //           });
  //         });
  //       })
  //     );
  //   }
  // });


 
