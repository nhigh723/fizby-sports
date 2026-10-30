// Screens on a device size: DEV=ipad|iphone OUT=dir. Title, hub, trophy room, parents, every game (level 1) and a win.
import { chromium } from 'playwright-core'; import fs from 'node:fs';
const URL = process.env.URL || 'http://localhost:4182/', DEV = process.env.DEV || 'ipad', OUT = process.env.OUT || 'screenshots/ipad'; fs.mkdirSync(OUT, { recursive: true });
const VP = DEV === 'ipad' ? { width: 820, height: 1180 } : DEV === 'ipadl' ? { width: 1180, height: 820 } : { width: 390, height: 844 };
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' }); const p = await (await b.newContext({ viewport: VP, deviceScaleFactor: 2, hasTouch: true, isMobile: true })).newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(1500);
const S = (f, a) => p.evaluate(f, a), W = ms => p.waitForTimeout(ms), shot = n => p.screenshot({ path: `${OUT}/${DEV}-${n}.png` });
await shot('01-title'); for (const [n, f] of [['02-hub', () => window.__snap.go('hub')], ['03-trophy', () => { const s = window.__snap.save(); s.stickers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; s.trophies = [0, 3]; window.__snap.setSave(s); window.__snap.go('town'); }], ['04-parents', () => window.__snap.go('parents')]]) { await S(f); await W(1500); await shot(n); }
for (let i = 0; i < 11; i++) { await S(i => window.__snap.start(i, 1), i); await W(2200); await shot(`game${String(i).padStart(2, '0')}`); }
console.log(errs.length ? 'errors ' + errs : 'no errors'); await b.close();
