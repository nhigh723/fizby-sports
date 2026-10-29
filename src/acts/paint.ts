// Sports Day Paint Studio: colour sports pictures. Pick a paint pot, tap a part to fill it. Teaches colour names, matching, fine motor.
// L0 medal (match the dots) - L1 ball - L2 trophy - L3 jersey - L4 flag; Fizby names the colour to find. 5+: remixes (any picture, new colours).
// Each level: when every part matches its dot, the picture is done (2 pictures per level).
import { type Ctx, W, rr } from '../art';
import { L, colorLine } from '../lines';
import type { Activity, Api, Pt } from '../kit';
const PAL = ['#ff3b6b', '#ff9f1c', '#ffd60a', '#3ddc4a', '#1fb6ff', '#9b5cff', '#ff5fd2'];
type Part = { k: 'c' | 'r' | 'tri'; x: number; y: number; w: number; h: number; want: string; got: string | null };
const P = (k: Part['k'], x: number, y: number, w: number, h: number): Part => ({ k, x, y, w, h, want: '', got: null });
const PICS: (() => Part[])[] = [
  () => [P('r', 165, 160, 60, 140), P('c', 195, 380, 100, 100), P('c', 195, 380, 50, 50)], // medal: ribbon, disc, centre
  () => [P('c', 195, 360, 200, 200), P('c', 195, 360, 70, 70), P('r', 60, 560, 270, 40)], // ball on the grass
  () => [P('r', 130, 200, 130, 130), P('r', 175, 330, 40, 70), P('r', 130, 400, 130, 50), P('c', 195, 230, 50, 50)], // trophy
  () => [P('r', 120, 200, 150, 220), P('r', 60, 200, 60, 80), P('r', 270, 200, 60, 80), P('c', 195, 250, 60, 60)], // jersey + number badge
  () => [P('r', 100, 150, 20, 420), P('r', 120, 150, 180, 60), P('r', 120, 210, 180, 60), P('r', 120, 270, 180, 60), P('c', 330, 600, 60, 60)], // flag on a pole
];
export function paint(api: Api, level: number): Activity {
  const rnd = Math.random, need = 2; let pic = 0, parts: Part[] = [], sel = -1, made = 0, done = false, cheer = -1;
  const make = () => { pic = level >= 5 ? Math.floor(rnd() * PICS.length) : (level + made) % PICS.length; parts = PICS[pic](); const cs = [...PAL].sort(() => rnd() - 0.5); parts.forEach((p, i) => p.want = cs[i % cs.length]); if (level === 4 || level >= 5) api.say(colorLine(parts[0].want)); };
  make();
  const hit = (p: Part, q: Pt) => p.k === 'c' ? Math.hypot(q.x - p.x, q.y - p.y) < p.w / 2 : q.x > p.x && q.x < p.x + p.w && q.y > p.y && q.y < p.y + p.h;
  const center = (p: Part) => p.k === 'c' ? { x: p.x, y: p.y + p.h * 0.3 } : { x: p.x + p.w / 2, y: p.y + p.h / 2 };
  const pot = (i: number) => ({ x: 38 + i * 52, y: 760 });
  return {
    intro: level === 0 ? L.paintMatch : L.paintGo,
    update(dt) { if (cheer >= 0) { cheer += dt; if (cheer > 1.6) { cheer = -1; made++; if (made >= need) { done = true; api.win(L.paintDone); } else make(); } } },
    draw(c: Ctx) { const t = api.t(); c.fillStyle = '#fff6d6'; c.fillRect(0, 0, W, 844); c.fillStyle = '#fff'; rr(c, 30, 130, W - 60, 540, 24); c.fill(); c.strokeStyle = '#ffd27a'; c.lineWidth = 6; c.stroke();
      for (const p of parts) { c.fillStyle = p.got || '#ffffff'; c.strokeStyle = '#2b2140'; c.lineWidth = 6; c.beginPath(); if (p.k === 'c') c.arc(p.x, p.y, p.w / 2, 0, 6.28); else rr(c, p.x, p.y, p.w, p.h, 8); c.fill(); c.stroke();
        if (p.got !== p.want) { const q = center(p); c.fillStyle = p.want; c.beginPath(); c.arc(q.x, q.y, 11 + Math.sin(t * 4) * 1.5, 0, 6.28); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 3; c.stroke(); } }
      PAL.forEach((col, i) => { const b = pot(i), up = sel === i ? -14 : 0; c.fillStyle = '#b8b0c8'; rr(c, b.x - 22, b.y - 6 + up, 44, 40, 10); c.fill(); c.fillStyle = col; c.beginPath(); c.ellipse(b.x, b.y - 6 + up, 22, 12, 0, 0, 6.28); c.fill(); if (sel === i) { c.strokeStyle = '#2b2140'; c.lineWidth = 4; c.stroke(); } });
      for (let i = 0; i < need; i++) { c.fillStyle = i < made ? '#ffd60a' : 'rgba(43,33,64,0.15)'; c.beginPath(); c.arc(180 + i * 30, 825, 9, 0, 6.28); c.fill(); }
      if (sel >= 0) { c.fillStyle = PAL[sel]; c.beginPath(); c.arc(W - 40, 130, 16, 0, 6.28); c.fill(); } },
    down(q: Pt) { if (done || cheer >= 0) return; const pi = PAL.findIndex((_, i) => Math.hypot(q.x - pot(i).x, q.y - pot(i).y) < 28); if (pi >= 0) { sel = pi; api.sfx.pick(); return; }
      if (sel < 0) return; const ps = [...parts].reverse().find(p => hit(p, q)); if (!ps) return;
      ps.got = PAL[sel]; api.sfx.splash(); if (ps.got !== ps.want) { api.say(L.paintWrong, false); return; }
      if (parts.every(p => p.got === p.want)) { cheer = 0; api.sfx.cheer(); api.burst(195, 400, 40); } else { const nx = parts.find(p => p.got !== p.want); if (nx && (level === 4 || level >= 5)) api.say(colorLine(nx.want)); } },
    move() { /* */ }, up() { /* */ },
    next() { if (done || cheer >= 0) return null; const p = parts.find(p => p.got !== p.want); if (!p) return null; const i = PAL.indexOf(p.want); if (sel !== i) { const b = pot(i); return { type: 'tap', x: b.x, y: b.y }; } const q = center(p); return { type: 'tap', x: q.x, y: q.y }; },
    busy: () => done || cheer >= 0,
  };
}
