// After vite build: writes dist/sw.js, a service worker that precaches every file in dist (app, art, voice clips) so the game
// reloads and plays with no network. The cache name carries a hash of the file list, so each deploy replaces the old cache.
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto';
const D = 'dist', files = []; (function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else files.push(path.relative(D, p).split(path.sep).join('/')); } })(D);
const list = ['./', ...files.filter(f => f !== 'sw.js' && !f.startsWith('.')).map(f => './' + f)];
const h = crypto.createHash('sha1'); for (const f of files) if (f !== 'sw.js') h.update(f + fs.statSync(path.join(D, f)).size); const V = 'fs5-' + h.digest('hex').slice(0, 10);
fs.writeFileSync(path.join(D, 'sw.js'), `const V=${JSON.stringify(V)},FILES=${JSON.stringify(list)};
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request,{ignoreSearch:true,ignoreVary:true}).then(r=>r||fetch(e.request)))});
`); console.log('sw.js:', list.length, 'files, cache', V);
