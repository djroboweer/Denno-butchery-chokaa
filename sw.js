// Service worker: lets the site open quickly and work offline once visited.
// When you change any site file, change the version number below (v8 -> v9) so phones refresh.
const CACHE = "denno-v8";
const ASSETS = ["./", "index.html", "style.css", "script.js", "manifest.json",
  "images/logo.svg", "images/logo-mark.jpg", "images/hero.jpg", "images/goat.jpg", "images/chicken.jpg", "images/liver.jpg",
  "images/icon-192.png", "images/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(ASSETS.map((a) => c.add(a).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; })
      .catch(() => caches.match(req).then((hit) => hit || caches.match("index.html")))
  );
});
