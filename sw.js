const CACHE="bowl-v21";
const FILES=["./","index.html","style.css","app.js","manifest.webmanifest","icon-192.png","icon-512.png","icon-180.png","https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"];
/* always take fresh copies into the cache, never the browser's stale ones */
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(u=>new Request(u,{cache:"reload"})))));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim()});
/* own files: network first so updates show right away, cache only when offline. Libraries: cache first. */
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const own=new URL(e.request.url).origin===location.origin;
  if(own){
    e.respondWith(fetch(e.request,{cache:"no-cache"}).then(res=>{
      if(res.ok){const c=res.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}
      return res;}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match("index.html"))));
  }else{
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
      if(res.ok){const c=res.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}
      return res;})));
  }
});
