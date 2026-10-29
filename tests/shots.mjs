// Phone-size screenshots (1170x2532) of the title, hub, each activity mid-play and My Town.
import { chromium } from 'playwright-core';
const URL = process.env.URL || 'http://localhost:4182/', OUT = process.env.OUT || 'screenshots';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' }); const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 })).newPage();
const S = (f, a) => p.evaluate(f, a), wait = ms => p.waitForTimeout(ms);
async function run(a) { if (!a) return; if (a.type === 'wait') return wait(a.ms); if (a.type === 'tap') { const q = await S(([x, y]) => window.__snap.toScreen(x, y), [a.x, a.y]); await p.mouse.click(q.x, q.y); return wait(400); }
  const pts = []; for (const [x, y] of a.path) pts.push(await S(([x, y]) => window.__snap.toScreen(x, y), [x, y]));
  await p.mouse.move(pts[0].x, pts[0].y); await p.mouse.down(); for (const q of pts.slice(1)) await p.mouse.move(q.x, q.y, { steps: 12 }); await p.mouse.up(); await wait(500); }
const step = async n => { for (let i = 0; i < n; i++) { await wait(300); await run(await S(() => window.__snap.busy() ? null : window.__snap.next())); } };
await p.goto(URL); await wait(1500); await p.screenshot({ path: `${OUT}/01-title.png` });
await S(() => { const s = window.__snap.save(); s.lv = [3, 5, 2, 1, 5, 0, 2, 5, 1, 0, 4]; window.__snap.setSave(s); window.__snap.go('hub'); }); await wait(800); await p.screenshot({ path: `${OUT}/02-hub.png` });
const acts = [['03-soccer', 0, 2, 1], ['04-basketball', 1, 4, 1], ['05-bowling-hard', 2, 5, 1], ['06-tee-ball', 3, 3, 0], ['07-swimming', 4, 1, 3], ['08-mini-golf', 5, 2, 0], ['09-tennis', 6, 1, 0], ['10-racing', 7, 4, 0], ['11-hockey', 8, 2, 0], ['12-gymnastics', 9, 2, 0], ['13-paint-studio', 10, 2, 3]];
for (const [n, a, l, k] of acts) { await S(([a, l]) => window.__snap.start(a, l), [a, l]); await wait(2500); await step(k); await wait(300); await p.screenshot({ path: `${OUT}/${n}.png` }); }
await p.goto(URL); await wait(1200);
await S(() => { const s = window.__snap.save(); window.__snap.setSave({ ...s, wins: 13, seen: 13, trophies: [0, 2, 4, 7, 10], stickers: [0,1,2,10,11,20,21,30,40,41,50,60,70,71,80,90,100,101,3] }); window.__snap.go('town'); }); await wait(800); await p.screenshot({ path: `${OUT}/14-trophy-room.png` }); await b.close(); console.log('shots done');
