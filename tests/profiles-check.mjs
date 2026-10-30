// Parent area: add a second child, give each an age band, check progress stays per child and tuning follows the band.
import { chromium } from 'playwright-core';
const URL = process.env.URL || 'http://localhost:4182/';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' }); const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage();
const errors = []; page.on('pageerror', e => errors.push(e.message)); let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
await page.goto(URL); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(600);
const S = (f, a) => page.evaluate(f, a), tapId = async id => { const bt = await S(id => window.__snap.buttons().find(b => b.id === id), id); if (!bt) { console.log('no button ' + id); return; } await tap(bt.x + bt.w / 2, bt.y + bt.h / 2); }, tap = async (x, y) => { const p = await S(([x, y]) => window.__snap.toScreen(x, y), [x, y]); await page.mouse.click(p.x, p.y); await page.waitForTimeout(250); };
await S(() => window.__snap.go('setup')); await page.waitForTimeout(600); await tapId('setupKid0'); await tapId('setupAge1'); await tapId('setupGo'); await page.waitForTimeout(400);
await S(() => { const s = window.__snap.save(); s.lv[0] = 2; s.wins = 3; s.skills = { Counting: 3 }; window.__snap.setSave(s); window.__snap.go('parents'); }); await page.waitForTimeout(300);
await tapId('kidAdd'); ok(await S(() => window.__snap.kid) === 1, 'added and switched to child 2');
ok(await S(() => window.__snap.save().lv[0]) === 0, 'child 2 starts fresh');
await tapId('band2-3'); ok(await S(() => window.__snap.hintDelay) === 4 && await S(() => window.__snap.slack) === 16, 'age 3: hint at 4 s, +16 px touch slack');
if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT });
await tapId('kid0'); ok(await S(() => window.__snap.kid) === 0 && await S(() => window.__snap.save().lv[0]) === 2, 'back to child 1 keeps its progress');
ok(await S(() => window.__snap.hintDelay) === 5, 'child 1 keeps age 4 tuning');
await tapId('music'); ok(JSON.parse(await S(() => localStorage.getItem('fs5~settings'))).musicVol === 3, 'music volume step saved');
ok(!errors.length, 'no page errors ' + JSON.stringify(errors)); console.log(fails ? fails + ' FAILED' : 'ALL PASSED'); await b.close(); process.exit(fails ? 1 : 0);
