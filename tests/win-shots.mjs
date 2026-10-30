// Win screens for every game on a device: DEV=iphone|ipad OUT=dir. Autoplays level 1 with next() and shoots the win (sticker fly-in).
import { chromium } from 'playwright-core'; import fs from 'node:fs';
const URL = process.env.URL || 'http://localhost:4182/', DEV = process.env.DEV || 'iphone', OUT = process.env.OUT || 'screenshots/win'; fs.mkdirSync(OUT, { recursive: true });
const VP = DEV === 'ipad' ? { width: 820, height: 1180 } : { width: 390, height: 844 };
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' }); const page = await (await b.newContext({ viewport: VP, hasTouch: true, isMobile: true })).newPage();
const S = (f, a) => page.evaluate(f, a), wait = ms => page.waitForTimeout(ms), pt = (x, y) => S(([x, y]) => window.__snap.toScreen(x, y), [x, y]);
async function run(a) { if (a.type === 'wait') return wait(a.ms);
  if (a.type === 'tap') { const p = await pt(a.x, a.y); await page.mouse.move(p.x, p.y); await page.mouse.down(); await wait(40); await page.mouse.up(); return wait(150); }
  const ps = []; for (const [x, y] of a.path) ps.push(await pt(x, y)); await page.mouse.move(ps[0].x, ps[0].y); await page.mouse.down(); await wait(30);
  for (let i = 1; i < ps.length; i++) await page.mouse.move(ps[i].x, ps[i].y, { steps: 6 }); await wait(30); await page.mouse.up(); await wait(250); }
await page.goto(URL); await wait(1200); let bad = 0;
for (const i of (process.env.ONLY || '0,1,2,3,4,5,6,7,8,9,10').split(',').map(Number)) { await S(i => window.__snap.start(i, 0), i); await wait(600); const t0 = Date.now();
  while ((await S(() => window.__snap.winT)) < 0 && Date.now() - t0 < 90000) { if (await S(() => window.__snap.busy())) { await wait(100); continue; } const n = await S(() => window.__snap.next()); if (n) await run(n); else await wait(100); }
  const w = await S(() => window.__snap.winT); if (w < 0) { bad++; console.log('no win', i); continue; } await wait(1500); await page.screenshot({ path: `${OUT}/${DEV}-win${String(i).padStart(2, '0')}.png` }); console.log('win', i); }
await b.close(); process.exit(bad ? 1 : 0);
