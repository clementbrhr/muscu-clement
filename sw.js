/* Service worker : garde une copie de l'appli dans le téléphone
   pour qu'elle fonctionne sans réseau.
   À chaque nouvelle version de l'appli, on change VERSION :
   l'ancien cache est supprimé et le nouveau est rempli. */

const VERSION = "0.2.0";
const CACHE = "ma-seance-" + VERSION;

const FICHIERS = [
  "./",
  "./index.html",
  "./style.css",
  "./programme.js",
  "./moteur.js",
  "./app.js",
  "./manifest.json",
  "./sw.js",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(FICHIERS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((noms) =>
      Promise.all(noms.filter((n) => n !== CACHE).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

/* Stratégie : d'abord le cache, sinon le réseau.
   Les fichiers de l'appli sont toujours servis depuis le téléphone. */
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((reponse) => {
      if (reponse) return reponse;
      return fetch(event.request).then((reseau) => {
        if (reseau && reseau.ok) {
          const copie = reseau.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copie));
        }
        return reseau;
      }).catch(() => caches.match("./index.html"));
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "VERSION") {
    event.source.postMessage({ type: "VERSION", version: VERSION });
  }
});
