/* Atlas SfN — service worker : fonctionnement hors ligne */
const V = 'atlas-sfn-v1';
const CORE = [
  './', './index.html', './manifest.webmanifest', './atlas.css', './app/mobile.css', './app/app.js',
  './atlas-data.js', './atlas-verif.js', './atlas-vuln.js', './atlas-map.js', './atlas-sfn.js', './atlas-sfn-map.js',
  './atlas-hors.js', './atlas-panels.js', './atlas-pdf.js', './atlas-3d-hors.js', './atlas-3d.js',
  './app/icon-192.png', './app/icon-512.png', './app/icon-maskable-512.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];
const TILE_HOSTS = /arcgisonline\.com|tile\.openstreetmap\.org|tile\.opentopomap\.org/;
const TILE_CACHE = 'atlas-tiles-v1';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== TILE_CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Tuiles cartographiques : cache d'abord (consultables hors ligne une fois vues ou préchargées)
  if (TILE_HOSTS.test(url.hostname)) {
    e.respondWith(caches.open(TILE_CACHE).then(async c => {
      const hit = await c.match(req.url); if (hit) return hit;
      try { const r = await fetch(req); if (r && (r.ok || r.type === 'opaque')) c.put(req.url, r.clone()); return r; }
      catch (_) { return hit || Response.error(); }
    }));
    return;
  }
  // Fichiers de l'application : réseau d'abord (mises à jour), repli sur le cache hors ligne
  e.respondWith(fetch(req).then(r => {
    if (r && (r.ok || r.type === 'opaque')) { const cp = r.clone(); caches.open(V).then(c => c.put(req, cp)); }
    return r;
  }).catch(() => caches.match(req).then(h => h || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error()))));
});
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
