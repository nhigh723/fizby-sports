// Side-by-side proof: the same screen in Fizby's Fun & Learn (left, FL_URL, read-only build) and Fizby Sports (right, URL).
// Writes screenshots/parity/NN-name.png (each half 390x844 @2x). Usage: FL_URL=http://localhost:4190/ URL=http://localhost:4182/ node tests/parity-shots.mjs
import { chromium } from 'playwright-core'; import sharp from 'sharp'; import fs from 'node:fs';
const FL = process.env.FL_URL || 'http://localhost:4190/', FS = process.env.URL || 'http://localhost:4182/', OUT = 'screenshots/parity'; fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const errors = [];
async function open(url) { const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage(); p.on('pageerror', e => errors.push(url + ' ' + e.message));
  await p.goto(url); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(1200); return p; }
const fl = await open(FL), fz = await open(FS);
const E = (p, f, a) => p.evaluate(f, a), W = ms => new Promise(r => setTimeout(r, ms));
async function tap(p, x, y) { const q = await E(p, ([x, y]) => window.__snap.toScreen(x, y), [x, y]); await p.mouse.click(q.x, q.y); }
async function play(p, untilWin = true, maxMs = 60000) { const t0 = Date.now(); while (Date.now() - t0 < maxMs) { if (untilWin && (await E(p, () => window.__snap.winT)) >= 0) return true;
  const a = await E(p, () => window.__snap.next()); if (!a || a.type === 'wait') { await W(200); continue; }
  if (a.type === 'tap' || a.type === 'hold') { const q = await E(p, ([x, y]) => window.__snap.toScreen(x, y), [a.x, a.y]); await p.mouse.move(q.x, q.y); await p.mouse.down(); await W(a.ms || 40); await p.mouse.up(); await W(150); continue; }
  const ps = []; for (const [x, y] of a.path) ps.push(await E(p, ([x, y]) => window.__snap.toScreen(x, y), [x, y])); await p.mouse.move(ps[0].x, ps[0].y); await p.mouse.down(); for (const q of ps.slice(1)) await p.mouse.move(q.x, q.y, { steps: 5 }); await p.mouse.up(); await W(250); } return false; }
let n = 0;
async function pair(name, flStep, fzStep) { await flStep(); await fzStep(); const [a, c] = [await fl.screenshot(), await fz.screenshot()]; const f = `${OUT}/${String(++n).padStart(2, '0')}-${name}.png`;
  await sharp({ create: { width: 780 * 2 + 40, height: 1688, channels: 3, background: '#222' } }).composite([{ input: a, left: 0, top: 0 }, { input: c, left: 820, top: 0 }]).png().toFile(f); console.log('wrote', f); }
const flStart = (t, l = 0) => async () => { await E(fl, ([t, l]) => { window.__snap.seeSafety(); window.__snap.start(t, l, true); }, [t, l]); await W(1500); };
const fzStart = (i, l = 0) => async () => { await E(fz, ([i, l]) => window.__snap.start(i, l), [i, l]); await W(1500); };
await pair('title', async () => { await E(fl, () => window.__snap.go('title')); await W(800); }, async () => { await W(300); });
await pair('hub', async () => { await E(fl, () => window.__snap.go('map')); await W(1200); }, async () => { await E(fz, () => { window.__snap.go('hub'); }); await W(2600); }); // FS: first visit shows the onboarding Fizby
await pair('submenu-vs-hub-after-onboarding', async () => { await E(fl, () => { window.__snap.go('map'); }); await W(300); await tap(fl, 195, 300); await W(1200); }, async () => { await tap(fz, 195, 760); await W(400); await E(fz, () => window.__snap.go('hub')); await W(1200); });
await pair('sport-intro', async () => { await E(fl, () => { window.__snap.seeSafety(); window.__snap.start(10, 0); }); await W(1800); }, async () => { await tap(fz, 69, 184); await W(1100); });
await E(fl, () => window.__snap.endIntro && window.__snap.endIntro(true)); await W(400);
await pair('play', flStart(10), fzStart(1));
await pair('hint-hand', async () => { await W(6500); }, async () => { await W(6500 - 1500); });
await pair('hint-pulse-spoken-goal', async () => { await W(10000); }, async () => { await W(1500); });
await pair('help-tutorial', async () => { const h = await E(fl, () => window.__snap.buttons().find(b => /help|tut|\?/.test(b.id))); if (h) await tap(fl, h.x, h.y); await W(1500); }, async () => { await tap(fz, 350, 122); await W(1500); });
await pair('win-celebration', async () => { await flStart(10)(); await play(fl); await W(900); }, async () => { await fzStart(1)(); await play(fz); await W(900); });
await pair('stickers-vs-trophy-room', async () => { await E(fl, () => window.__snap.go('stickers')); await W(1200); }, async () => { await E(fz, () => { const s = window.__snap.save(); s.stickers = [10, 11, 12, 13, 0, 20]; s.trophies = [1, 4]; window.__snap.setSave(s); window.__snap.go('town'); }); await W(1200); });
await pair('parents', async () => { await E(fl, () => window.__snap.go('parents')); await W(1000); }, async () => { await E(fz, () => window.__snap.go('parents')); await W(1000); });
await pair('club', async () => { await E(fl, () => window.__snap.go('club')); await W(1000); }, async () => { await W(10); });
await pair('grown-up-gate', async () => { await E(fl, () => window.__snap.go('map')); await W(600); const g = await E(fl, () => window.__snap.buttons().find(b => /gear|parent|grown/.test(b.id))); if (g) await tap(fl, g.x, g.y); await W(800); },
  async () => { await E(fz, () => window.__snap.go('hub')); await W(600); await tap(fz, 346, 50); await W(800); });
await E(fz, () => window.__snap.closeGate && window.__snap.closeGate()); await tap(fz, 195, 595); await W(400);
await pair('mistake-oops-pose', flStart(10), async () => { await fzStart(9)(); await W(3500); const a = await E(fz, () => window.__snap.next()); const wrong = [60, 150, 240, 330].find(x => !a || Math.abs(x - a.x) > 5); await tap(fz, wrong, 750); await W(500); });
await pair('big-game-last-level', flStart(10, 2), fzStart(0, 4));
const GAMES = [[12, 'soccer'], [10, 'basketball-vs-hoops'], [11, 'bowling-vs-football'], [11, 'teeball-vs-football'], [29, 'swimming-vs-ocean'], [10, 'golf-vs-hoops'], [11, 'tennis-vs-football'], [9, 'racing-vs-trucks'], [12, 'hockey-vs-soccer'], [21, 'gymnastics-vs-stage'], [26, 'paint-vs-lab']];
for (let i = 0; i < 11; i++) await pair('game-' + GAMES[i][1], flStart(GAMES[i][0], 0), fzStart(i, 1));
console.log(errors.length ? 'page errors ' + JSON.stringify(errors) : 'no page errors'); await b.close();
