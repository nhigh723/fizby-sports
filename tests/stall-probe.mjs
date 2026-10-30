// B1 probe: replays given act:level pairs many times with real input; on a stall dumps loop/act state twice 2 s apart.
import { chromium } from 'playwright-core';
const URL = process.env.URL || 'http://localhost:4182/', DEV = process.env.DEV || 'iphone', PAIRS = (process.env.PAIRS || '10:6,2:5,2:3,3:1,3:4,10:5').split(',').map(s => s.split(':').map(Number)), REP = +(process.env.REP || 6);
const VP = DEV === 'ipad' ? { width: 820, height: 1180 } : { width: 390, height: 844 };
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' }); const page = await (await b.newContext({ viewport: VP, hasTouch: true, isMobile: true })).newPage();
const errs = []; page.on('pageerror', e => errs.push(e.message));
const S = (f, a) => page.evaluate(f, a), wait = ms => page.waitForTimeout(ms), pt = (x, y) => S(([x, y]) => window.__snap.toScreen(x, y), [x, y]);
async function run(a) { if (a.type === 'wait') return wait(a.ms); if (a.type === 'tap') { const p = await pt(a.x, a.y); await page.mouse.move(p.x, p.y); await page.mouse.down(); await wait(40); await page.mouse.up(); return wait(150); }
  const ps = []; for (const [x, y] of a.path) ps.push(await pt(x, y)); await page.mouse.move(ps[0].x, ps[0].y); await page.mouse.down(); await wait(30); for (let i = 1; i < ps.length; i++) await page.mouse.move(ps[i].x, ps[i].y, { steps: 6 }); await wait(30); await page.mouse.up(); await wait(250); }
if (process.env.THROTTLE) { const cdp = await page.context().newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: +process.env.THROTTLE }); }
await page.goto(URL); await wait(1200); let bad = 0, n = 0;
if (process.env.AGE) { await S(() => window.__snap.go('setup')); await wait(800); for (const id of ['setupKid1', 'setupAge' + process.env.AGE, 'setupGo']) { const bt = await S(id => window.__snap.buttons().find(b => b.id === id), id); const p = await pt(bt.x + bt.w / 2, bt.y + bt.h / 2); await page.mouse.click(p.x, p.y); await wait(400); } }
const st = () => S(() => ({ T: window.__snap.T, busyT: window.__snap.busyT, heals: window.__snap.heals, stalls: window.__snap.stalls, ...window.__snap.dbg }));
for (let r = 0; r < REP; r++) for (const [i, l] of PAIRS) { n++; await S(([i, l]) => window.__snap.start(i, l), [i, l]); await wait(300); const t0 = Date.now(); let steps = 0, won = false;
  while (Date.now() - t0 < 60000 && steps < 250) { if ((await S(() => window.__snap.winT)) >= 0) { won = true; break; } const a = await S(() => window.__snap.busy() ? null : window.__snap.next()); if (!a) { await wait(200); continue; } await run(a); if (a.type !== 'wait') steps++; }
  if (!won) { bad++; const a1 = await st(); await wait(2000); const a2 = await st(); console.log('STALL', i, l, 'steps', steps, JSON.stringify(a1), JSON.stringify(a2), JSON.stringify(await S(() => window.__rc && window.__rc()))); } }
const T = await S(() => window.__snap.T); console.log(`game clock ${T.toFixed(0)} s; runs ${n} stalls ${bad} errors ${JSON.stringify(errs.slice(0, 3))}`); await b.close(); process.exit(bad ? 1 : 0);
