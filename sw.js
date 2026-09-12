const CACHE = 'wbs-quantum-final-v3';
const APP_SHELL = [
  './','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./styles.css',
  './ai-service.js',
  './ai-ui.js',
  './bootstrap.js',
  './navigation.js',
  './session-lifecycle.js',
  './auth-service.js',
  './session-controller.js',
  './config.js',
  './errors.js',
  './release-integrity.js',
  './firebase.js',
  './state.js',
  './storage.js',
  './sync-queue.js',
  './cloud-repository.js',
  './school-calendar.js',
  './exam-service.js',
  './insights-service.js',
  './insights-ui.js',
  './note-service.js',
  './notification-service.js',
  './notification-ui.js',
  './preferences-service.js',
  './preferences-ui.js',
  './profile-registry.js',
  './pwa-service.js',
  './revision-service.js',
  './revision-ui.js',
  './search-service.js',
  './search-ui.js',
  './streak-service.js',
  './streak-ui.js',
  './task-service.js',
  './academic-data.js',
  './profile-integrity.js',
  './timetable-service.js',
  './academic-ui.js',
  './auth-ui.js',
  './accessibility.js',
  './home-ui.js',
  './productivity-ui.js',
  './admin-service.js',
  './admin-ui.js',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', event => { if (event.data?.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      if (response.ok) caches.open(CACHE).then(cache => cache.put('./index.html', response.clone())).catch(() => {});
      return response;
    }).catch(() => caches.match('./index.html')));
    return;
  }

  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone())).catch(() => {});
    return response;
  }).catch(() => caches.match(event.request).then(cached => cached || new Response('Offline', { status: 503, headers: {'Content-Type':'text/plain'} }))));
});
