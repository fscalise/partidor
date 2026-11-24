// Guarda la app en el celular para que funcione sin internet (en la pileta).
// Abre siempre lo guardado al instante y, si hay internet, baja la versión nueva
// para la próxima vez que se abra.
const CACHE = 'partidor-v2.2';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const guardado = await cache.match(req, { ignoreSearch: true });
      const red = fetch(req)
        .then(resp => { if (resp && resp.ok) cache.put(req, resp.clone()); return resp; })
        .catch(() => null);
      if (guardado) { try { e.waitUntil(red); } catch (_) {} return guardado; }
      const resp = await red;
      return resp || cache.match('./index.html');
    })
  );
});
