// Screenshots for the QA round-2 nits: setup (5-6 + name), trophy room + sticker tabs, hub trophies, gymnastics bunting.
import { chromium } from 'playwright-core'; import fs from 'node:fs';
const URL = process.env.URL || 'http://localhost:4182/', OUT = 'screenshots/nits'; fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const errs = [];
for (const [DEV, VP] of [['iphone', { width: 390, height: 844 }], ['ipad', { width: 820, height: 1180 }]]) {
  const p = await (await b.newContext({ viewport: VP, deviceScaleFactor: 2, hasTouch: true, isMobile: true })).newPage(); p.on('pageerror', e => errs.push(e.message));
  p.on('dialog', d => d.accept('Mia'));
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(1500);
  const S = (f, a) => p.evaluate(f, a), W = ms => p.waitForTimeout(ms), shot = n => p.screenshot({ path: `${OUT}/${DEV}-${n}.png` });
  const tap = async id => { const bt = await S(id => window.__snap.buttons().find(b => b.id === id), id); if (!bt) throw new Error('no button ' + id); const q = await S(([x, y]) => window.__snap.toScreen(x, y), [bt.x + bt.w / 2, bt.y + bt.h / 2]); await p.mouse.click(q.x, q.y); await W(500); };
  await S(() => window.__snap.go('setup')); await W(1200); await shot('3-age-5-6');
  // press the name pill through the real button handler
  await tap('setupName'); await W(600); const hasFn = 'tapped';
  await shot('4-name-entry'); await tap('setupGo'); await W(800);
  const prof = await S(() => localStorage.getItem(Object.keys(localStorage).find(k => /prof/i.test(k)) || ''));
  console.log(DEV, 'btn fn', hasFn, 'profile', prof);
  await S(() => { const s = window.__snap.save(); s.stickers = [0, 1, 2, 10, 11, 20, 40, 41, 70, 75, 86, 100]; s.trophies = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; window.__snap.setSave(s); window.__snap.go('hub'); }); await W(1500); await shot('1-hub-trophies');
  await S(() => window.__snap.go('town')); await W(1500); await shot('1-trophy-room-and-sticker-tabs');
  await S(i => window.__snap.start(i, 1), Number(process.env.GYM || 9)); await W(2200); await shot('2-gym-bunting');
  await p.context().close();
}
console.log(errs.length ? 'errors ' + errs : 'no errors'); await b.close();
