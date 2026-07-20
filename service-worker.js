const CACHE = "atualize-v4";

const arquivos = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./clientes.json",
    "./logo.png",
    "./manifest.json",
    "./service-worker.js",
    "./xlsx.full.min.js"
];

// Instala e salva os arquivos
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(arquivos))
    );
    self.skipWaiting();
});

// Remove caches antigos
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE)
                    .map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Usa o cache, mas tenta atualizar em segundo plano
self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        caches.match(event.request).then(async cached => {
            try {
                const network = await fetch(event.request);
                const cache = await caches.open(CACHE);
                cache.put(event.request, network.clone());
                return cached || network;
            } catch {
                return cached;
            }
        })
    );
});
