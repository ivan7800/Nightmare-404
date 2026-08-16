const CACHE_PREFIX = "nightmare-404-";
const CACHE = `${CACHE_PREFIX}v3.2.0`;
const CORE = [
  "./",
  "./index.html",
  "./404.html",
  "./manifest.webmanifest",
  "./css/styles.css",
  "./css/premium.css",
  "./js/data.js",
  "./js/modules/premium-art.js",
  "./js/modules/premium-audio.js",
  "./js/modules/nocturne-ui.js",
  "./js/app.js",
  "./assets/art/bosses/dreamer.svg",
  "./assets/art/bosses/elevator.svg",
  "./assets/art/bosses/lady.svg",
  "./assets/art/bosses/stag.svg",
  "./assets/art/bosses/surgeon.svg",
  "./assets/art/events/b-mirror.svg",
  "./assets/art/events/b-vhs.svg",
  "./assets/art/events/b-zero.svg",
  "./assets/art/events/f-bells.svg",
  "./assets/art/events/f-shrine.svg",
  "./assets/art/events/f-well.svg",
  "./assets/art/events/h-morgue.svg",
  "./assets/art/events/h-theater.svg",
  "./assets/art/events/m-ballroom.svg",
  "./assets/art/events/m-gallery.svg",
  "./assets/art/events/n-copies.svg",
  "./assets/art/events/n-threshold.svg",
  "./assets/art/prologue/signal.svg",
  "./assets/art/prologue/descent.svg",
  "./assets/art/prologue/threshold.svg",
  "./assets/art/endings/dawn.svg",
  "./assets/art/endings/archive.svg",
  "./assets/art/endings/offline.svg",
  "./assets/art/endings/vessel.svg",
  "./assets/art/cases/block404.svg",
  "./assets/art/cases/hospital.svg",
  "./assets/art/cases/forest.svg",
  "./assets/art/cases/mansion.svg",
  "./assets/art/cases/nexus.svg",
  "./assets/audio/intro.ogg",
  "./assets/audio/case-block.ogg",
  "./assets/audio/case-hospital.ogg",
  "./assets/audio/case-forest.ogg",
  "./assets/audio/case-mansion.ogg",
  "./assets/audio/case-nexus.ogg",
  "./assets/audio/ambience-forest.ogg",
  "./assets/audio/ambience-hospital.ogg",
  "./assets/audio/ambience-mansion.ogg",
  "./assets/audio/ambience-nexus.ogg",
  "./assets/audio/ambience-rain.ogg",
  "./assets/audio/fx-bell.ogg",
  "./assets/audio/fx-door.ogg",
  "./assets/audio/fx-impact.ogg",
  "./assets/audio/fx-step.ogg",
  "./assets/audio/fx-water.ogg",
  "./assets/audio/fx-whisper.ogg",
  "./assets/audio/kenney-click-002.ogg",
  "./assets/audio/kenney-click-005.ogg",
  "./assets/audio/music-ritual.ogg",
  "./assets/audio/ambience-menu.ogg",
  "./assets/audio/stinger-anomaly.ogg",
  "./assets/audio/stinger-case-clear.ogg",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/maskable-512.png",
  "./assets/images/ambient-bg.webp",
  "./assets/images/gabriel.webp",
  "./assets/images/lucia.webp",
  "./assets/images/menu-hero.webp",
  "./assets/images/noa.webp",
  "./assets/images/scenes/block.webp",
  "./assets/images/scenes/forest.webp",
  "./assets/images/scenes/hospital.webp",
  "./assets/images/scenes/mansion.webp",
  "./assets/images/scenes/nexus.webp",
  "./assets/images/universe-404.webp"
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
