const CACHE_NAME = "catatan-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const appRoot = new URL("./", self.location.href);
      const shellUrls = [
        "",
        "index.html",
        "manifest.webmanifest",
        "favicon.svg",
        "icons/icon-192.png",
        "icons/icon-512.png",
        "icons/icon-maskable-512.png",
      ].map((path) => new URL(path, appRoot).href);
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(shellUrls);

      const response = await cache.match(new URL("index.html", appRoot).href);
      const html = await response.text();
      const assetUrls = Array.from(html.matchAll(/(?:src|href)="([^"]+)"/g), (match) =>
        new URL(match[1], appRoot)
      )
        .filter((url) => url.origin === self.location.origin)
        .map((url) => url.href);

      await cache.addAll([...new Set(assetUrls)]);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith("catatan-") && cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(request, { ignoreVary: true });
      if (cachedResponse) return cachedResponse;

      try {
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
      } catch (error) {
        if (request.mode === "navigate") {
          const appRoot = new URL("./", self.location.href);
          const fallback = await cache.match(new URL("index.html", appRoot).href);
          if (fallback) return fallback;
        }
        throw error;
      }
    })()
  );
});
