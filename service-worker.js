const CACHE = "atualize-v1";

const arquivos = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./clientes.json",
    "./logo.png",
    "./manifest.json"
];

self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(arquivos))
    );
});

self.addEventListener("fetch", e => {
    e.respondWith(
        caches.match(e.request).then(resp => {
            return resp || fetch(e.request);
        })
    );
});
