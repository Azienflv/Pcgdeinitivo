const CACHE_NAME = "pcg-tours-v5"; // 🔥 cambia versión cada vez que actualices

const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./assets/logo.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png"
];

// =======================
// 📦 INSTALL
// =======================
self.addEventListener("install", (event) => {
  console.log("Service Worker instalado ✅");

  self.skipWaiting(); // 🔥 fuerza actualización inmediata

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// =======================
// 🔄 ACTIVATE
// =======================
self.addEventListener("activate", (event) => {
  console.log("Service Worker activado 🔥");

  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Borrando cache vieja:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim(); // 🔥 toma control inmediato
});

// =======================
// 🌐 FETCH (ESTRATEGIA INTELIGENTE)
// =======================
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 🔥 Guarda en cache lo nuevo
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => {
        // 🔥 Si no hay internet → usa cache
        return caches.match(event.request);
      })
  );
});
