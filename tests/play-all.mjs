// End-to-end: beats every level of every activity in headless Chrome using only real pointer input (mouse down/move/up
// at screen coordinates). Each activity exposes next(): the next input a player would make, so this proves every level is winnable.
import { chromium } from 'playwright-core';
const URL = process.env.URL || 'http://localhost:4182/';
const b = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: false })).newPage();
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => m.type() === 'error' && !/voice|manifest|404|Failed to load/.test(m.text()) && errors.push(m.text()));
await page.goto(URL); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(500);
const S = (fn, a) => page.evaluate(fn, a), wait = ms => page.waitForTimeout(ms);
const pt = (x, y) => S(([x, y]) => window.__snap.toScreen(x, y), [x, y]);
async function tapBtn(id) { let bt = null; for (let k = 0; k < 20 && !bt; k++) { bt = await S(id => window.__snap.buttons().find(b => b.id === id), id); if (!bt) await wait(100); } if (!bt) throw new Error('no button ' + id); const p = await pt(bt.x + bt.w / 2, bt.y + bt.h / 2); await page.mouse.click(p.x, p.y); await wait(250); }
async function run(a) {
  if (a.type === 'wait') return wait(a.ms);
  if (a.type === 'tap') { const p = await pt(a.x, a.y); await page.mouse.move(p.x, p.y); await page.mouse.down(); await wait(40); await page.mouse.up(); return wait(150); }
  const ps = []; for (const [x, y] of a.path) ps.push(await pt(x, y));
  await page.mouse.move(ps[0].x, ps[0].y); await page.mouse.down(); await wait(30);
  for (let i = 1; i < ps.length; i++) await page.mouse.move(ps[i].x, ps[i].y, { steps: 6 }); await wait(30); await page.mouse.up(); await wait(250);
}
let fails = 0; const ok = (c, m) => { if (c) console.log('ok   ' + m); else { fails++; console.log('FAIL ' + m); } };
// UI: title -> hub (Play), each card opens, Back is a single tap
await tapBtn('play'); ok(await S(() => window.__snap.screen) === 'setup', 'first launch: Play opens the profile setup');
await wait(800); await tapBtn('setupKid1'); await tapBtn('setupAge2'); await tapBtn('setupGo'); ok(await S(() => window.__snap.screen) === 'hub' && (await S(() => window.__snap.slack)) === 0, 'setup saves the ball and age (5-6 tuning), then the hub');
const LV = await S(() => window.__snap.levels), NA = LV.length;
for (let i = 0; i < NA; i++) { await tapBtn('act' + i); await wait(300); const intro = await S(() => window.__snap.intro); const s = await S(() => window.__snap.screen); await tapBtn('back'); const s2 = await S(() => window.__snap.screen); ok(s === 'play' && intro && s2 === 'hub', `card ${i} pokes, opens with its sport intro, one tap on Back returns`); }
await tapBtn('town'); ok(await S(() => window.__snap.screen) === 'town', 'Trophy Room opens'); await tapBtn('back');
await tapBtn('back'); ok(await S(() => window.__snap.screen) === 'title', 'Back from hub returns to title'); await tapBtn('play');
// beat every level (authored + 2 remixes) with real input
async function beat(i, l) {
  await S(([i, l]) => window.__snap.start(i, l), [i, l]); await wait(300); if ((await S(() => window.__snap.act)) !== i) await S(([i, l]) => window.__snap.start(i, l), [i, l]); const t0 = Date.now(); let steps = 0;
  while (Date.now() - t0 < 90000) {
    if ((await S(() => window.__snap.winT)) >= 0) return steps;
    const a = await S(() => window.__snap.busy() ? null : window.__snap.next()); if (!a) { await wait(200); continue; } await run(a); if (a.type !== 'wait') steps++; if (steps > 250) break;
  }
  console.log("  stuck state", JSON.stringify(await S(() => ({ actDbg: window.__snap.actDbg, perf: window.__snap.perf, dbg: window.__snap.dbg, busyT: window.__snap.busyT, T: window.__snap.T, stalls: window.__snap.stalls, heals: window.__snap.heals, screen: window.__snap.screen, act: window.__snap.act, level: window.__snap.level, winT: window.__snap.winT, modal: window.__snap.modal, busy: window.__snap.busy(), next: window.__snap.next(), intro: window.__snap.intro }))));
  return -1;
}
const ONLY = process.env.ONLY ? process.env.ONLY.split(',').map(Number) : null;
for (let i = 0; i < NA; i++) if (!ONLY || ONLY.includes(i)) for (let l = 0; l < LV[i] + 2; l++) if (!process.env.LVL || process.env.LVL.split(",").map(Number).includes(l)) { const n = await beat(i, l); ok(n >= 0, `activity ${i} level ${l}${l >= LV[i] ? ' (remix)' : ''}: won in ${n} inputs`); }
// mistakes are recoverable: a kick that misses wide bounces back (no fail), then the round is still winnable
await S(() => window.__snap.start(0, 0)); await wait(800);
await run({ type: 'drag', path: [[195, 700], [120, 650], [20, 600]] }); await wait(300); ok((await S(() => window.__snap.winT)) < 0, 'soccer: a wide kick is a miss, no win, no fail');
{ let n = 0; while ((await S(() => window.__snap.winT)) < 0 && n++ < 60) { const a = await S(() => window.__snap.busy() ? null : window.__snap.next()); if (a) await run(a); else await wait(200); } }
ok((await S(() => window.__snap.winT)) >= 0, 'soccer: after a miss the level is still winnable');
// basketball: a weak pull falls short, then the right pull scores
await S(() => window.__snap.start(1, 0)); await wait(800); await run({ type: 'drag', path: [[90, 640], [80, 650], [75, 655]] }); await wait(1500);
ok((await S(() => window.__snap.winT)) < 0, 'basketball: a weak pull falls short (no win, no fail)');
{ let n = 0; while ((await S(() => window.__snap.winT)) < 0 && n++ < 60) { const a = await S(() => window.__snap.busy() ? null : window.__snap.next()); if (a) await run(a); else await wait(200); } }
ok((await S(() => window.__snap.winT)) >= 0, 'basketball: the right pull then wins');
// stickers and a trophy
const sv = await S(() => window.__snap.save()); ok(ONLY || (sv.wins >= LV.reduce((a, b) => a + b + 2, 0) && sv.stickers.length === sv.wins), `wins counted (${sv.wins}), stickers ${sv.stickers.length}, trophies ${JSON.stringify(sv.trophies)}`);
ok(ONLY || sv.trophies.length === NA, `a trophy for each of the ${NA} games after its levels`);
await S(() => { const s = window.__snap.save(); s.trophies = []; s.lv[0] = 4; window.__snap.setSave(s); window.__snap.start(0, 4); }); await wait(300);
while ((await S(() => window.__snap.winT)) < 0) { const a = await S(() => window.__snap.busy() ? null : window.__snap.next()); if (a) await run(a); else await wait(200); }
await wait(3800); ok(await S(() => window.__snap.modal) === 'unlock', 'trophy celebration after finishing level 5'); await wait(1000); await page.mouse.click(195, 400); await wait(400);
ok(await S(() => window.__snap.modal) === null && await S(() => window.__snap.screen) === 'play', 'tap closes it and the next level starts');
// parental gate + paywall (store simulator)
await page.goto(URL + '?store=sim'); await wait(500); await S(() => window.__snap.storeTest.reset()); await tapBtn('play');
await tapBtn('act0'); await wait(300); ok(await S(() => window.__snap.screen) === 'play', 'every sport opens (first 2 levels free)'); await tapBtn('back');
await S(() => window.__snap.start(0, 3)); ok(await S(() => window.__snap.freeRemix), 'level 3 without the Club plays a free-level remix (store sim)'); await S(() => window.__snap.go('hub')); await wait(300);
await tapBtn('gear'); ok(await S(() => window.__snap.modal) === 'gate', 'gear opens the grown-up gate');
{ const bt = await S(() => window.__snap.buttons().find(b => b.id === 'gateHold')); const p = await pt(bt.x + 70, bt.y + 70); await page.mouse.move(p.x, p.y); await page.mouse.down(); await wait(3400); await page.mouse.up(); await wait(200);
  const g = await S(() => window.__snap.gate); ok(g.asked, 'hold 3 s passes the first step');
  const ans = g.q[0] + g.q[1], k = g.opts.indexOf(ans); await tapBtn('gateA' + k); ok(await S(() => window.__snap.screen) === 'parents', 'right answer opens grown-ups'); }
await tapBtn('buy-yearly'); await wait(300); ok((await S(() => window.__snap.store())).club, 'simulated purchase unlocks the mascot Club');
await tapBtn('back'); await S(() => window.__snap.start(0, 3)); ok(!(await S(() => window.__snap.freeRemix)), 'level 3 is the real level after purchase');
ok(!errors.length, 'no page errors ' + JSON.stringify(errors.slice(0, 5)));
console.log(fails ? `${fails} FAILED` : 'ALL PASSED'); await b.close(); process.exit(fails ? 1 : 0);
