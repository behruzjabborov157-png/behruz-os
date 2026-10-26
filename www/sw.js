/* BEHRUZ OS — oflayn kesh (veb-ilova uchun). Yangi versiya chiqarilganda VERSION ni oshiring. */
const VERSION = 'behruz-os-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'js/calc.js', 'js/core.js', 'js/main.js', 'js/ui.js', 'js/v-config.js', 'js/v-disc.js', 'js/v-faith.js', 'js/v-fit.js', 'js/v-habits.js', 'js/v-home.js', 'js/v-lang.js', 'js/v-money.js', 'js/v-plan.js', 'js/v-review.js', 'js/v-uni.js', 'js/v-work.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Shriftlar (Google Fonts): birinchi marta internetdan, keyin keshdan
  if (url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com') {
    e.respondWith(caches.open(VERSION + '-fonts').then(c => c.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }))));
    return;
  }
  if (url.origin !== location.origin) return;
  // Ilova fayllari: avval tarmoq (yangilanish uchun), boʻlmasa kesh
  e.respondWith(fetch(req).then(r => { if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); } return r; }).catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('index.html'))));
});
