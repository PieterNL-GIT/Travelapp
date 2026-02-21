const CACHE_NAME = "travelapp-cache-v3";
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
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
