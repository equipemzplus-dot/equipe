const CACHE_NAME = 'mz-plus-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Stratégie Network First : on tente le réseau, sinon le cache
  // C'est plus sûr pour une application dynamique qui change souvent
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la réponse est valide, on peut éventuellement la mettre en cache ici
        // Mais pour l'instant on se contente de la retourner
        return response;
      })
      .catch(() => {
        // En cas d'échec réseau (hors ligne), on cherche dans le cache
        return caches.match(event.request);
      })
  );
});
