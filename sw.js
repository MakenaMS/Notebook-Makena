// =========================================================
// KÓDEX PWA ENGINE - Service Worker V8 (Simetria Absoluta)
// =========================================================

// Subimos para v8 para forçar os telemóveis a atualizarem a matriz
const CACHE_NAME = 'makena-pro-v8';

// 1. NÚCLEO VITAL (Cobre todas as variações de URL de arranque do telemóvel)
const CORE_ASSETS = [
  './',
  './index.html',
  '/'
];

// 2. MOTORES EXTERNOS (Buscados com permissões de Alta Fidelidade)
const CDN_ASSETS = [
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      console.log('KÓDEX: Selando o núcleo vital e rotas de arranque...');
      
      // Evita falhar toda a instalação se o telemóvel estranhar uma das rotas
      for (let asset of CORE_ASSETS) {
        try { await cache.add(asset); } catch(e) {}
      }
      
      console.log('KÓDEX: Puxando os motores externos em estado puro...');
      for (let asset of CDN_ASSETS) {
        try {
          // O fetch puro liberta o bloqueio opaco, permitindo que o React corra offline
          const res = await fetch(asset);
          if (res.ok) {
            await cache.put(asset, res.clone());
          }
        } catch (e) {
          console.warn('KÓDEX Aviso: O telemóvel não conseguiu pré-carregar:', asset);
        }
      }
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('KÓDEX: Purgando memórias antigas (', cache, ')');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// O NEXO AFROKÓDICO: Interceção Híbrida e Caching em Tempo Real
self.addEventListener('fetch', event => {
  // Ignora requisições que não sejam leitura (GET)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
      // 1. Se está no cofre (offline), devolve com velocidade máxima
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // 2. Se não está no cofre, busca na internet E GUARDA IMEDIATAMENTE (Runtime Caching)
      return fetch(event.request).then(networkResponse => {
        // Se a resposta for válida, faz uma cópia para o cofre para o futuro
        if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
           const responseToCache = networkResponse.clone();
           caches.open(CACHE_NAME).then(cache => {
             cache.put(event.request, responseToCache);
           });
        }
        return networkResponse;
      }).catch(() => {
        // 3. FALHA DE REDE ABSOLUTA (Sem internet e ficheiro não guardado)
        // Se o telemóvel pedir a aplicação pelo ecrã inicial, obriga a abrir o núcleo
        if (event.request.mode === 'navigate' || event.request.headers.get('accept').includes('text/html')) {
           return caches.match('./index.html') || caches.match('/');
        }
      });
    })
  );
});
