// Cache des images de cartes : chaque joueur ne télécharge chaque image qu'une seule fois.
const CACHE='sefirah-img-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin||!/\/img\/[^/]+\.(webp|jpg|jpeg|png)$/.test(u.pathname))return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(e.request);if(hit)return hit;
    try{const r=await fetch(e.request);if(r.ok)c.put(e.request,r.clone());return r}
    catch(x){return Response.error()}
  }));
});
