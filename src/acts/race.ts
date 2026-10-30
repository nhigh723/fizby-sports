// Racing: a go-kart in 3 lanes; tap the left or right side to change lanes. Grab stars, steer around cones. Teaches left/right, counting, colours.
// L0 3 stars - L1 5 stars - L2 stars + cones - L3 count 5 stars with cones - L4 drive through the colour gate Fizby says. 5+: remixes.
import { type Ctx, W } from '../art';
import { star } from '../sports';
import { L, NUM, gateLine } from '../lines';
import type { Activity, Api, Pt } from '../kit';
const LANES = [105, 195, 285], KY = 680, SPEED = 230;
type Thing = { lane: number; y: number; kind: 'star' | 'cone' | 'gate'; col?: string; hit?: boolean };
export function race(api: Api, level: number): Activity {
  const remix = level >= 5, rnd = Math.random, gates = level === 4 || (remix && rnd() < 0.4), cones = level >= 2, need = level === 0 ? 3 : gates ? 3 : 5;
  const COLS = ['#ff3b6b', '#1fb6ff', '#ffd60a'];
  let lane = 1, kx = LANES[1], got = 0, things: Thing[] = [], spawn = 1.6, road = 0, bonk = 0, done = false, want = '';
  const add = () => { if (gates) { const cs = [...COLS].sort(() => rnd() - 0.5); want = cs[0]; cs.forEach((col, i) => things.push({ lane: i, y: -40, kind: 'gate', col })); api.say(gateLine(want)); return; }
    const l = Math.floor(rnd() * 3); things.push({ lane: l, y: -40, kind: 'star' }); if (cones && rnd() < 0.7) things.push({ lane: (l + 1 + Math.floor(rnd() * 2)) % 3, y: -40, kind: 'cone' }); };
  return {
    intro: L.raceGo,
    update(dt) { if (done) return; road += dt * SPEED; kx += (LANES[lane] - kx) * Math.min(1, dt * 10); bonk = Math.max(0, bonk - dt); const sp = SPEED * (bonk ? 0.4 : 1);
      spawn -= dt; if (spawn <= 0 && (!things.some(t => t.y < 300) || spawn < -3)) { add(); spawn = gates ? 2.6 : 1.4; }
      for (const t of things) { t.y += sp * dt; if (!t.hit && t.y > KY - 30 && t.y < KY + 30 && (t.lane === lane || (t.kind === 'star' && Math.abs(kx - LANES[t.lane]) < 45))) { t.hit = true;
        if (t.kind === 'star') { got++; api.sfx.unlock(); api.burst(LANES[t.lane], KY, 14); api.say(NUM[got - 1]); }
        if (t.kind === 'cone') { bonk = 0.8; api.sfx.boing(); api.say(L.cone, false); }
        if (t.kind === 'gate') { things.filter(o => o.kind === 'gate' && Math.abs(o.y - t.y) < 2).forEach(o => o.hit = true); if (t.col === want) { got++; api.sfx.cheer(); api.say(NUM[got - 1]); } else { api.sfx.wrong(); api.say(L.wrongGate); } } } }
      things = things.filter(t => t.y < 900); if (got >= need) { done = true; api.win(L.finish); } },
    draw(c: Ctx) { const t = api.t(); c.fillStyle = '#3ddc4a'; c.fillRect(0, 0, W, 844); c.fillStyle = '#6a6080'; c.fillRect(55, 0, 280, 844);
      for (let y = -60 + (road % 60); y < 844; y += 60) { c.fillStyle = (Math.floor((y - road) / 60) % 2) ? '#ff3b6b' : '#fff'; c.fillRect(45, y, 10, 60); c.fillRect(335, y, 10, 60); c.fillStyle = '#fff'; c.fillRect(148, y, 6, 30); c.fillRect(238, y, 6, 30); }
      for (const o of things) { if (o.hit && o.kind !== 'cone') continue; const x = LANES[o.lane];
        if (o.kind === 'star') star(c, x, o.y, 22 + Math.sin(t * 6) * 2);
        if (o.kind === 'cone') { c.fillStyle = '#ff9f1c'; c.beginPath(); c.moveTo(x, o.y - 26); c.lineTo(x - 18, o.y + 16); c.lineTo(x + 18, o.y + 16); c.fill(); c.fillStyle = '#fff'; c.fillRect(x - 11, o.y - 4, 22, 6); }
        if (o.kind === 'gate') { c.strokeStyle = o.col!; c.lineWidth = 10; c.beginPath(); c.moveTo(x - 38, o.y + 20); c.lineTo(x - 38, o.y - 30); c.lineTo(x + 38, o.y - 30); c.lineTo(x + 38, o.y + 20); c.stroke(); } }
      // kart
      c.save(); c.translate(kx, KY + (bonk ? Math.sin(t * 40) * 3 : 0)); c.fillStyle = '#2b2140'; c.fillRect(-30, -30, 12, 22); c.fillRect(18, -30, 12, 22); c.fillRect(-30, 14, 12, 22); c.fillRect(18, 14, 12, 22);
      c.fillStyle = '#1fb6ff'; c.beginPath(); c.moveTo(-20, -40); c.lineTo(20, -40); c.lineTo(26, 36); c.lineTo(-26, 36); c.closePath(); c.fill(); c.fillStyle = '#f6c6a0'; c.beginPath(); c.arc(0, 4, 14, 0, 6.28); c.fill(); c.fillStyle = '#ff3b6b'; c.beginPath(); c.arc(0, 2, 15, Math.PI, 0); c.fill(); c.restore();
      if (gates && want) { c.fillStyle = want; c.beginPath(); c.arc(W - 40, 130, 20, 0, 6.28); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 4; c.stroke(); }
      for (let i = 0; i < need; i++) star(c, W / 2 + (i - (need - 1) / 2) * 34, 815, 12, i < got ? '#ffd60a' : 'rgba(255,255,255,0.4)');
      const a = Math.sin(t * 4) * 0.2 + 0.4; c.fillStyle = `rgba(255,255,255,${a})`; for (const s of [-1, 1]) { const x = 195 + s * 165; c.beginPath(); c.moveTo(x + s * 14, 760); c.lineTo(x - s * 6, 742); c.lineTo(x - s * 6, 778); c.fill(); } },
    down(p: Pt) { if (done || p.y < 120) return; const s = p.x < 195 ? -1 : 1; const nl = Math.max(0, Math.min(2, lane + s)); if (nl !== lane) { lane = nl; api.sfx.whoosh(); } else api.sfx.tap(); },
    move() { /* */ }, up() { /* */ },
    next() { if (done) return null; const target = things.filter(o => !o.hit && o.y < KY - 40 && (o.kind === 'star' || (o.kind === 'gate' && o.col === want))).sort((a, b) => b.y - a.y)[0];
      let tl = target ? target.lane : lane; if (!target) { const cone = things.find(o => o.kind === 'cone' && !o.hit && o.y < KY - 30 && o.y > KY - 300 && o.lane === lane); if (cone) tl = lane === 1 ? 0 : 1; }
      if (tl === lane) return { type: 'wait', ms: 60 }; return { type: 'tap', x: tl < lane ? 80 : 310, y: 600 }; },
    busy: () => done,
  };
}
