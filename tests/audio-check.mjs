// Audio: music plays (hub loop on the hub, sports loop in a game), recorded narration never overlaps even when lines are spammed, no errors.
import { chromium } from 'playwright-core';
const URL = process.env.URL || 'http://localhost:4182/';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--autoplay-policy=no-user-gesture-required'] }); const page = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => m.type() === 'error' && errors.push(m.text())); let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
await page.goto(URL); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(800);
const S = (f, a) => page.evaluate(f, a), W = ms => page.waitForTimeout(ms);
const p = await page.evaluate(() => window.__snap.toScreen(195, 760)); await page.mouse.click(p.x, p.y); await W(4000);
let a = await S(() => window.__snap.audio); ok(a.ctx === 'running', 'audio context running after the first tap'); ok(a.track === 'hub', 'hub music loop playing (' + a.track + ')');
await S(() => window.__snap.start(1, 0)); await W(4000); a = await S(() => window.__snap.audio); ok(a.track === 'sports', 'sports music loop in a game (' + a.track + ')'); ok(a.lines > 0, `recorded lines played (${a.lines})`);
// spam: mascot taps, ? taps, Back/start churn, every activity's intro
for (let i = 0; i < 11; i++) { await S(i => window.__snap.start(i, 0), i); await W(250); for (let k = 0; k < 4; k++) { const q = await page.evaluate(() => window.__snap.toScreen(195, 64)); await page.mouse.click(q.x, q.y); await W(120); } }
await W(6000); a = await S(() => window.__snap.audio); ok(a.maxVoices <= 1, `narration never overlapped (max ${a.maxVoices} at once, ${a.lines} lines)`);
await S(() => window.__snap.go('hub')); await W(3000); ok((await S(() => window.__snap.audio)).track === 'hub', 'back on the hub the music returns to the hub loop');
ok(!errors.length, 'zero console/page errors ' + JSON.stringify(errors)); console.log(fails ? fails + ' FAILED' : 'ALL PASSED'); await b.close(); process.exit(fails ? 1 : 0);
