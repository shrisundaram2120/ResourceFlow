const CACHE_PREFIX = "resourceflow-";

self.addEventListener("install", function (event) {
  self.skipWaiting();
  event.waitUntil(Promise.resolve());
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key.indexOf(CACHE_PREFIX) === 0; })
          .map(function (key) { return caches.delete(key); })
      );
    }).then(function () {
      return self.registration.unregister();
    }).then(function () {
      return self.clients.matchAll({ type: "window" });
    }).then(function (clients) {
      clients.forEach(function (client) {
        client.navigate(client.url);
      });
    })
  );
});

self.addEventListener("fetch", function () {
  return;
});
