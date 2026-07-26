const CACHE_PREFIX = "nightmare-404-";
const CACHE = `${CACHE_PREFIX}v2.0.0`;
const CORE = [
  "./",
  "./index.html",
  "./404.html",
  "./manifest.webmanifest",
  "./css/styles.css",
  "./js/data.js",
  "./js/app.js",
  "./assets/images/title-screen.webp",
  "./assets/images/menu-hero.webp",
  "./assets/images/ambient-bg.webp",
  "./assets/images/universe-404.webp",
  "./assets/images/lucia.webp",
  "./assets/images/gabriel.webp",
  "./assets/images/noa.webp",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/maskable-512.png"
];

async function cacheIfValid(request, response) {
  if (!response || !response.ok || response.type === "opaque") return response;
  const cache = await caches.open(CACHE);
  await cache.put(request, response.clone());
  return response;
}

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => cacheIfValid(request, response))
        .catch(async () => (await caches.match(request)) || caches.match("./index.html"))
    );
    return;
  }

  const network = fetch(request).then(response => cacheIfValid(request, response));
  event.waitUntil(network.catch(() => undefined));
  event.respondWith(
    caches.match(request).then(cached => cached || network.catch(() => new Response(
      "Recurso no disponible sin conexión.",
      { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    )))
  );
});
