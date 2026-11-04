// Cache des images de cartes : chaque joueur ne télécharge chaque image qu'une seule fois.
const CACHE='sefirah-img-v3';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate', event => {
 event.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(key => key.startsWith('sefirah-img-') && key !== CACHE).map(key => caches.delete(key)));
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin||!/\/img\/(?:pathways\/)?[^/]+\.(webp|jpg|jpeg|png)$/.test(u.pathname))return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(e.request);if(hit)return hit;
    try{const r=await fetch(e.request);if(r.ok)c.put(e.request,r.clone());return r}
    catch(x){return Response.error()}
  }));
});
