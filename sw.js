// Sefirah Castle : service worker
// 1) Images de cartes (/img/…) : cache d'abord, chaque joueur ne télécharge chaque image qu'une seule fois.
// 2) Le jeu lui-même : réseau d'abord (toujours à jour), cache en secours hors ligne.
const IMG = 'sefirah-img-v1';
const APP = 'sefirah-app-1.5.0';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(APP).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x.startsWith('sefirah-app-') && x !== APP).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return; // serveur, Firebase, polices : directement le réseau
  if (/\/img\/[^/]+\.(webp|jpg|jpeg|png)$/.test(u.pathname)) {
    e.respondWith(caches.open(IMG).then(async c => {
      const hit = await c.match(r); if (hit) return hit;
      try { const res = await fetch(r); if (res.ok) c.put(r, res.clone()); return res; }
      catch (x) { return Response.error(); }
    }));
    return;
  }
  e.respondWith(
    fetch(r).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open(APP).then(c => c.put(r, cp)); }
      return res;
    }).catch(() => caches.match(r).then(m => m || (r.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(l => l.length ? l[0].focus() : self.clients.openWindow('./')));
});
