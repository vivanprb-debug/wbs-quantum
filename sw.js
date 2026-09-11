const CACHE = 'wbs-quantum-recode-m20-v1';
const APP_SHELL = [
  './','./index.html','./manifest.json','./assets/icon-192.png','./assets/icon-512.png','./styles/tokens.css','./styles/base.css',
  './src/ai/ai-service.js',
  './src/ai/ai-ui.js',
  './src/app/bootstrap.js',
  './src/app/navigation.js',
  './src/app/session-lifecycle.js',
  './src/auth/auth-service.js',
  './src/auth/session-controller.js',
  './src/core/config.js',
  './src/core/errors.js',
  './src/core/release-integrity.js',
  './src/core/firebase.js',
  './src/core/state.js',
  './src/core/storage.js',
  './src/core/sync-queue.js',
  './src/data/cloud-repository.js',
  './src/data/school-calendar.js',
  './src/exams/exam-service.js',
  './src/insights/insights-service.js',
  './src/insights/insights-ui.js',
  './src/notes/note-service.js',
  './src/notifications/notification-service.js',
  './src/notifications/notification-ui.js',
  './src/preferences/preferences-service.js',
  './src/preferences/preferences-ui.js',
  './src/profiles/profile-registry.js',
  './src/pwa/pwa-service.js',
  './src/revision/revision-service.js',
  './src/revision/revision-ui.js',
  './src/search/search-service.js',
  './src/search/search-ui.js',
  './src/streaks/streak-service.js',
  './src/streaks/streak-ui.js',
  './src/tasks/task-service.js',
  './src/timetable/academic-data.js',
  './src/timetable/profile-integrity.js',
  './src/timetable/timetable-service.js',
  './src/ui/academic-ui.js',
  './src/ui/auth-ui.js',
  './src/ui/accessibility.js',
  './src/ui/home-ui.js',
  './src/ui/productivity-ui.js',
  './src/admin/admin-service.js',
  './src/admin/admin-ui.js',
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
  if (url.origin === location.origin) {
    event.respondWith(fetch(event.request).then(response => {
      if (response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone())).catch(() => {});
      return response;
    }).catch(() => caches.match(event.request).then(cached => cached || new Response('Offline', { status: 503, headers: {'Content-Type':'text/plain'} }))));
  }
});
