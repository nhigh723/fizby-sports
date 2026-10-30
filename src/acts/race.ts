// Racing: a go-kart in 3 lanes; tap the left or right side to change lanes. Grab stars, steer around cones. Teaches left/right, counting, colours.
// L0 3 stars - L1 5 stars - L2 stars + cones - L3 count 5 stars with cones - L4 drive through the colour gate Fizby says. 5+: remixes.
import { type Ctx, W, band } from '../art';
import { star } from '../sports';
import { L, NUM, gateLine } from '../lines';
import { setKitCtx, box, ball as kb, shape, label, shadow } from '../fkit';
import type { Activity, Api, Pt } from '../kit';
const LANES = [105, 195, 285], KY = 680, SPEED = 230;
type Thing = { lane: number; y: number; kind: 'star' | 'cone' | 'gate' | 'boost'; col?: string; hit?: boolean };
export function race(api: Api, level: number): Activity {
  const remix = level >= 5, rnd = Math.random, gates = level === 4 || (remix && rnd() < 0.4), cones = level >= 2, need = level === 0 ? 3 : gates ? 3 : 5;
  const COLS = ['#ff3b6b', '#1fb6ff', '#ffd60a'];
  let boost = 0, lane = 1, kx = LANES[1], got = 0, things: Thing[] = [], spawn = 1.6, road = 0, bonk = 0, done = false, want = '';
  const add = () => { if (gates) { const cs = [...COLS].sort(() => rnd() - 0.5); want = cs[0]; cs.forEach((col, i) => things.push({ lane: i, y: -40, kind: 'gate', col })); api.say(gateLine(want)); return; }
    const l = Math.floor(rnd() * 3); things.push({ lane: l, y: -40, kind: 'star' }); const o = (l + 1 + Math.floor(rnd() * 2)) % 3; if (cones && rnd() < 0.7) things.push({ lane: o, y: -40, kind: 'cone' }); else if (level >= 1 && rnd() < 0.5) things.push({ lane: o, y: -40, kind: 'boost' }); };
  return {
    intro: L.raceGo,
    update(dt) { if (done) return; road += dt * SPEED * (boost ? 1.6 : 1); kx += (LANES[lane] - kx) * Math.min(1, dt * 10); bonk = Math.max(0, bonk - dt); boost = Math.max(0, boost - dt); const sp = SPEED * (bonk ? 0.4 : boost ? 1.6 : 1);
      spawn -= dt; if (spawn <= 0 && (!things.some(t => t.y < 300) || spawn < -3)) { add(); spawn = gates ? 2.6 : 1.4; }
      for (const t of things) { t.y += sp * dt; if (!t.hit && t.y > KY - 30 && t.y < KY + 30 && (t.lane === lane || (t.kind === 'star' && Math.abs(kx - LANES[t.lane]) < 45))) { t.hit = true;
        if (t.kind === 'star') { got++; api.sfx.unlock(); api.burst(LANES[t.lane], KY, 14); api.say(NUM[got - 1]); }
        if (t.kind === 'boost') { boost = 1.2; api.sfx.whoosh(); api.burst(LANES[t.lane], KY, 8); }
        if (t.kind === 'cone') { bonk = 0.8; api.sfx.boing(); api.say(L.cone, false); }
        if (t.kind === 'gate') { things.filter(o => o.kind === 'gate' && Math.abs(o.y - t.y) < 2).forEach(o => o.hit = true); if (t.col === want) { got++; api.sfx.cheer(); api.say(NUM[got - 1]); } else { api.sfx.wrong(); api.say(L.wrongGate); } } } }
      things = things.filter(t => t.y < 900); if (got >= need) { done = true; api.win(L.finish); } },
    draw(c: Ctx) { const t = api.t(); setKitCtx(c); c.fillStyle = '#3ddc4a'; band(c, 0, 844);
      for (let y = -120 + (road % 120); y < 900; y += 120) for (const sx of [-60, 20, 370, 450]) { const ty = y + (sx % 3) * 20; if (sx < 0 || sx > 400) { kb(sx, ty, 26, '#2fb53c'); continue; } c.fillStyle = '#7a4a2a'; c.fillRect(sx - 3, ty, 6, 14); kb(sx, ty - 6, 15, '#29a83a'); kb(sx - 6, ty - 12, 8, '#4fe35c', false); }
      c.fillStyle = '#6a6080'; c.fillRect(55, 0, 280, 844); c.fillStyle = 'rgba(255,255,255,0.05)'; for (let y = (road * 1.0) % 40 - 40; y < 844; y += 40) c.fillRect(60, y, 270, 2);
      for (let y = -60 + (road % 60); y < 844; y += 60) { c.fillStyle = (Math.floor((y - road) / 60) % 2) ? '#ff3b6b' : '#fff'; c.fillRect(45, y, 10, 60); c.fillRect(335, y, 10, 60); c.fillStyle = '#fff'; c.fillRect(148, y, 6, 30); c.fillRect(238, y, 6, 30); }
      for (const o of things) { if (o.hit && o.kind !== 'cone') continue; const x = LANES[o.lane];
        if (o.kind === 'star') { shadow(x, o.y + 22, 16, 4); star(c, x, o.y, 22 + Math.sin(t * 6) * 2); }
        if (o.kind === 'boost') { box(x - 34, o.y - 26, 68, 52, 10, '#22d3ee'); for (let k = 0; k < 2; k++) shape([x - 18, o.y + 8 - k * 18, x, o.y - 8 - k * 18, x + 18, o.y + 8 - k * 18, x + 18, o.y + 14 - k * 18, x, o.y - 2 - k * 18, x - 18, o.y + 14 - k * 18], '#ffffff', undefined, undefined, false); }
        if (o.kind === 'cone') { shadow(x, o.y + 16, 22, 5); box(x - 22, o.y + 10, 44, 9, 3, '#ff6a1a'); shape([x - 4, o.y - 28, x + 4, o.y - 28, x + 18, o.y + 12, x - 18, o.y + 12], '#ff9f1c'); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x - 9, o.y - 8); c.lineTo(x + 9, o.y - 8); c.lineTo(x + 11, o.y - 1); c.lineTo(x - 11, o.y - 1); c.fill(); }
        if (o.kind === 'gate') { box(x - 44, o.y - 34, 12, 56, 4, o.col!); box(x + 32, o.y - 34, 12, 56, 4, o.col!); box(x - 46, o.y - 44, 92, 18, 8, o.col!); for (let k = 0; k < 4; k++) kb(x - 30 + k * 20, o.y - 35, 4, '#ffffff', false); } }
      // kart (top-down, illustrated): fat tyres, shaded body with nose and side pods, number, spoiler, driver helmet with visor
      c.save(); c.translate(kx, KY + (bonk ? Math.sin(t * 40) * 3 : 0)); c.rotate((LANES[lane] - kx) * 0.004); shadow(0, 40, 36, 8, 0.25);
      if (boost) { c.globalAlpha = 0.7; for (let k = 0; k < 3; k++) { c.fillStyle = ['#ffd60a', '#ff9f1c', '#ff3b6b'][k]; c.beginPath(); c.ellipse(-10 + k * 10, 50 + Math.sin(t * 40 + k) * 4, 4, 12, 0, 0, 6.28); c.fill(); } c.globalAlpha = 1; }
      const roll = (road % 16) / 16; for (const [wx, wy] of [[-31, -26], [31, -26], [-33, 22], [33, 22]]) { box(wx - 9, wy - 13, 18, 26, 6, '#2b2747'); c.fillStyle = '#16133a'; for (let k = 0; k < 3; k++) c.fillRect(wx - 8, wy - 12 + ((k * 9 + roll * 9) % 26), 16, 3); }
      box(-34, 30, 68, 12, 5, '#ff3b6b'); shape([-14, -48, 14, -48, 24, -20, 28, 30, -28, 30, -24, -20], '#1fb6ff'); box(-30, -6, 12, 30, 6, '#0e8fd0'); box(18, -6, 12, 30, 6, '#0e8fd0');
      kb(0, -32, 9, '#ffffff'); label('7', 0, -31, 11, '#1d1427');
      kb(0, 8, 15, '#ff3b6b'); c.fillStyle = '#1d1427'; c.beginPath(); c.ellipse(0, -2, 10, 5, 0, Math.PI, 0); c.fill(); c.fillStyle = '#fff'; c.fillRect(-3, 0, 6, 20); c.globalAlpha = 0.5; kb(-5, 3, 4, '#ffffff', false); c.globalAlpha = 1;
      c.restore();
      if (gates && want) { c.fillStyle = want; c.beginPath(); c.arc(W - 40, 130, 20, 0, 6.28); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 4; c.stroke(); }
      for (let i = 0; i < need; i++) star(c, W / 2 + (i - (need - 1) / 2) * 34, 815, 12, i < got ? '#ffd60a' : 'rgba(255,255,255,0.4)');
      const a = Math.sin(t * 4) * 0.2 + 0.4; c.fillStyle = `rgba(255,255,255,${a})`; for (const s of [-1, 1]) { const x = 195 + s * 165; c.beginPath(); c.moveTo(x + s * 14, 760); c.lineTo(x - s * 6, 742); c.lineTo(x - s * 6, 778); c.fill(); } },
    down(p: Pt) { if (done || p.y < 120) return; const s = p.x < 195 ? -1 : 1; const nl = Math.max(0, Math.min(2, lane + s)); if (nl !== lane) { lane = nl; api.sfx.whoosh(); } else api.sfx.tap(); },
    move() { /* */ }, up() { /* */ },
    next() { if (done) return null; const target = things.filter(o => !o.hit && o.y < KY - 40 && o.kind !== 'boost' && (o.kind === 'star' || (o.kind === 'gate' && o.col === want))).sort((a, b) => b.y - a.y)[0];
      let tl = target ? target.lane : lane; if (!target) { const cone = things.find(o => o.kind === 'cone' && !o.hit && o.y < KY - 30 && o.y > KY - 300 && o.lane === lane); if (cone) tl = lane === 1 ? 0 : 1; }
      if (tl === lane) return { type: 'wait', ms: 60 }; return { type: 'tap', x: tl < lane ? 80 : 310, y: 600 }; },
    busy: () => done,
  };
}
