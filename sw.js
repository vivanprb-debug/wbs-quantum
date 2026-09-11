// WBS Quantum Service Worker
const CACHE_NAME = "wbs-quantum-v10";
self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(r => { if (r && r.ok) { const c=r.clone(); caches.open(CACHE_NAME).then(cache=>cache.put(event.request,c)); } return r; }).catch(()=>caches.match(event.request)));
});
self.addEventListener("notificationclick", event => { event.notification.close(); event.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(list => list.length ? list[0].focus() : self.clients.openWindow("./"))); });
