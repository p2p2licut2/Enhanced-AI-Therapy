// Versiunea cache-ului - schimbați la fiecare actualizare
const CACHE_VERSION = 'v1';
const CACHE_NAME = `terapie-ai-${CACHE_VERSION}`;

// Resursele care vor fi cache-uite la instalare
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/maria-avatar.png',
  '/alin-avatar.png',
  '/ana-avatar.png',
  '/teodora-avatar.png',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Instalarea service worker-ului și precache resurselor
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activarea service worker-ului și ștergerea cache-urilor vechi
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Strategie de cache: Network first, apoi cache
self.addEventListener('fetch', event => {
  // Nu interceptăm requesturile către API
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Salvăm o copie a răspunsului în cache
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Dacă rețeaua eșuează, verificăm cache-ul
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Dacă resursa nu e în cache și suntem offline, returnam o pagină offline
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return null;
        });
      })
  );
});