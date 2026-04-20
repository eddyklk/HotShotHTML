const CACHE_NAME = 'hotshot-cache-v2'; // Cambiamos la versión a v2
const urlsToCache = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Instalar y guardar en caché
self.addEventListener('install', event => {
  self.skipWaiting(); // Obliga al celular a instalar la nueva versión de inmediato
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Activar y borrar cachés viejos (la versión v1 que tenías antes)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// ESTRATEGIA: Red primero, Caché como respaldo
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si hay internet, actualiza el caché con la versión más nueva
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Si NO hay internet, carga el juego desde el celular
        return caches.match(event.request);
      })
  );
});
