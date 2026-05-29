var CACHE = 'haraset-v3';
var ASSETS = [
  '/acesso.html',
  '/portal.html',
  '/sistema.html',
  '/api.js',
  '/theme.css',
  '/logo.jpg',
  '/manifest.json'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return c.addAll(ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  if(e.request.url.includes('haraset-api.onrender.com')) return;
  if(e.request.url.includes('fonts.googleapis.com')) return;
  if(e.request.url.includes('cdnjs.cloudflare.com')) return;

  e.respondWith(
    fetch(e.request).then(function(res) {
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
      return res;
    }).catch(function() {
      return caches.match(e.request);
    })
  );
});
