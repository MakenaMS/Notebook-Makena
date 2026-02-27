// =========================================================
// KÓDEX PWA ENGINE - Service Worker de Alta Resiliência (Mobile)
// =========================================================

// Subimos para v7 para forçar os telemóveis a atualizarem o cofre
const CACHE_NAME = 'makena-pro-v7';

// 1. O NÚCLEO VITAL (Deve ser guardado primeiro para garantir o arranque)
const CORE_ASSETS = [
  '/',
  '/index.html'
];

// 2. OS MOTORES EXTERNOS (Guardados em segundo plano)
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
      console.log('KÓDEX: Selando o núcleo vital da Academia Makena...');
      
      // Garante que o index.html é salvo. Se isto falhar, a app não instala (o que é correto e seguro).
      await cache.addAll(CORE_ASSETS);
      
      console.log('KÓDEX: Puxando os motores externos de renderização...');
      // Tenta guardar os CDNs individualmente. Se um telemóvel falhar num, não destrói o resto do cofre.
      for (let asset of CDN_ASSETS) {
        try {
          const req = new Request(asset, { mode: 'no-cors' });
          const res = await fetch(req);
          if (res) {
            await cache.put(req, res);
          }
        } catch (e) {
          console.warn('KÓDEX Aviso: O telemóvel não conseguiu guardar o motor:', asset);
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

// O NEXO AFROKÓDICO: Interceção de Pedidos Mobile
self.addEventListener('fetch', event => {
  // Ignora requisições que não sejam GET (como envio de formulários externos)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // 1. Se encontrou no cofre (no telemóvel), devolve imediatamente.
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // 2. Se não está no cofre, vai buscar à internet silenciosamente.
      return fetch(event.request).catch(() => {
        // 3. A MAGIA MOBILE: Se falhar (sem internet) e for um pedido de abertura de página (navigate)...
        if (event.request.mode === 'navigate' || event.request.headers.get('accept').includes('text/html')) {
           // ...força o telemóvel a abrir o index.html guardado, ignorando erros da operadora.
           return caches.match('/index.html');
        }
      });
    })
  );
});
