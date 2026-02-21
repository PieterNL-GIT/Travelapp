const CACHE_NAME = "travelapp-cache-v5";
const ASSETS = [
  "./",
  "./login.html",
  "./index.html",
  "./database.html",
  "./route.html",
  "./inspiratie.html",
  "./styles.css",
  "./common.js",
  "./app-login.js",
  "./app-home.js",
  "./app-database.js",
  "./app-route.js",
  "./app-inspiration.js",
  "./manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const isSameOrigin = event.request.url.startsWith(self.location.origin);

  if (!isSameOrigin) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => {
        if (event.request.mode === "navigate") {
          return caches.match(event.request).then((cached) => cached || caches.match("./index.html"));
        }

        return caches.match(event.request);
      })
  );
});
