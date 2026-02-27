// =========================================================
// KÓDEX PWA ENGINE - Service Worker de Alta Fidelidade
// =========================================================

const CACHE_NAME = 'makena-pro-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html'
];

// 1. FASE DE INSTALAÇÃO: Guarda o index.html no cofre do telemóvel
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('KÓDEX: Arquivos selados no cache offline.');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// 2. FASE DE ATIVAÇÃO: Limpa memórias antigas para manter a app leve
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
  self.clients.claim();
});

// 3. INTERCEPTAÇÃO DE REDE (O Nexo Afrokódico)
self.addEventListener('fetch', event => {
  event.respondWith(
    // Tenta buscar na rede (Internet)
    fetch(event.request).catch(() => {
      // Se a rede falhar (Modo Offline), puxa o index.html do Cache do telemóvel
      return caches.match(event.request).then(response => {
        return response || caches.match('/index.html');
      });
    })
  );
});