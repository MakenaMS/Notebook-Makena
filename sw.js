// =========================================================
// KÓDEX PWA ENGINE - Service Worker de Paridade Absoluta
// =========================================================

// A MUDANÇA VITAL ESTÁ AQUI: Mudamos para v6. 
// Isto avisa os telemóveis que há uma nova atualização do Makena Pro!
const CACHE_NAME = 'makena-pro-v6';

// Lista de motores vitais que garantem a experiência 100% igual offline
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Força o novo Service Worker a assumir o controlo imediatamente
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      console.log('KÓDEX: Atualizando os motores e receitas para o novo cofre (v6)...');
      for (let asset of ASSETS_TO_CACHE) {
        try {
          // Assegura o download contornando bloqueios CORS
          const req = new Request(asset, { mode: asset.startsWith('http') ? 'cors' : 'no-cors' });
          const res = await fetch(req);
          if (res.ok || res.type === 'opaque') {
            await cache.put(req, res);
          }
        } catch (e) {
          console.warn('KÓDEX Aviso: O item', asset, 'não pôde ser guardado.');
        }
      }
    })
  );
});

// Fase de Ativação: Elimina as versões antigas (ex: v5) para libertar espaço
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('KÓDEX: Limpando memórias antigas do sistema...');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercepta todas as requisições (O Escudo MEC-Shield Ativo)
self.addEventListener('fetch', event => {
  event.respondWith(
    // Tenta encontrar a biblioteca (React/Tailwind) ou o index.html no Cofre
    caches.match(event.request).then(cachedResponse => {
      // Retorna o que está salvo no telemóvel, senão tenta a internet
      return cachedResponse || fetch(event.request).catch(() => {
          // Se tudo falhar e o aluno estiver offline, devolve a página principal
          return caches.match('./index.html');
      });
    })
  );
});
