const CACHE = "atualize-v11";

const ARQUIVOS = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./version.json",
    "./clientes.json",
    "./logo.png",
    "./xlsx.full.min.js"
];

// Permite ativação imediata
self.addEventListener("message", event => {
    if (event.data === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

// Instalação
self.addEventListener("install", event => {
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE)
            .then(cache => cache.addAll(ARQUIVOS))
    );
});

// Ativação
self.addEventListener("activate", event => {
    event.waitUntil(
        Promise.all([
            caches.keys().then(keys =>
                Promise.all(
                    keys
                        .filter(key => key !== CACHE)
                        .map(key => caches.delete(key))
                )
            ),
            self.clients.claim()
        ])
    );
});

// Fetch
self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") return;

    const url = new URL(event.request.url);

    // Ignora extensões do navegador
    if (url.protocol.startsWith("chrome")) return;

    // HTML e JSON: sempre tenta a rede primeiro
    if (
        event.request.destination === "document" ||
        url.pathname.endsWith(".json")
    ) {

        event.respondWith(

            fetch(event.request)

                .then(response => {

                    if (response.ok) {

                        const copia = response.clone();

                        caches.open(CACHE)
                            .then(cache => cache.put(event.request, copia));

                    }

                    return response;

                })

                .catch(() => caches.match(event.request))

        );

        return;

    }

    // CSS / JS / imagens: cache primeiro
    event.respondWith(

        caches.match(event.request)

            .then(cache => {

                if (cache) return cache;

                return fetch(event.request)

                    .then(response => {

                        if (
                            response &&
                            response.status === 200
                        ) {

                            const copia = response.clone();

                            caches.open(CACHE)
                                .then(cache => cache.put(event.request, copia));

                        }

                        return response;

                    });

            })

    );

});
