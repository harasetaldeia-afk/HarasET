const CACHE = 'haraset-v2';
const ASSETS = [
  '/HarasET/acesso.html',
  '/HarasET/portal.html',
  '/HarasET/sistema.html',
  '/HarasET/api.js',
  '/HarasET/logo.jpg',
  '/HarasET/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // API calls sempre vão para a rede — nunca cacheia
  if(e.request.url.includes('haraset-api.onrender.com')) return;
  if(e.request.url.includes('fonts.googleapis.com')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
