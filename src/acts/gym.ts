// Gymnastics: Fizby's gymnast pal shows a routine of moves; copy it by tapping the moves in the same order. Teaches memory, sequencing, shapes (star, ball, arrow up, split line), counting.
// L0 one move - L1 two - L2 three - L3 three, quicker show - L4 four. 3 routines per level. 5+: remixes (3-5 moves).
import { type Ctx, W, rr } from '../art';
import { L } from '../lines';
import type { Activity, Api, Pt } from '../kit';
const MOVES = ['star', 'ball', 'arms', 'split'] as const; type Move = typeof MOVES[number];
const BTN = (i: number) => ({ x: 60 + i * 90, y: 750 });
function gymnast(c: Ctx, x: number, y: number, m: Move | null, t: number, col = '#ff5fd2') {
  c.save(); c.translate(x, y); c.strokeStyle = col; c.lineWidth = 14; c.lineCap = 'round'; c.lineJoin = 'round'; const head = (hx: number, hy: number) => { c.fillStyle = '#f6c6a0'; c.beginPath(); c.arc(hx, hy, 18, 0, 6.28); c.fill(); c.fillStyle = '#7d4420'; c.beginPath(); c.arc(hx, hy - 4, 18, Math.PI, 0); c.fill(); c.fillStyle = '#2b2140'; c.beginPath(); c.arc(hx - 6, hy + 2, 2.5, 0, 6.28); c.arc(hx + 6, hy + 2, 2.5, 0, 6.28); c.fill(); };
  const L2 = (pts: number[][]) => { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) c.lineTo(p[0], p[1]); c.stroke(); };
  if (!m) { L2([[0, -40], [0, 20]]); L2([[-20, -20], [0, -36], [20, -20]]); L2([[-14, 60], [0, 20], [14, 60]]); head(0, -62); }
  if (m === 'star') { L2([[0, -40], [0, 20]]); L2([[-50, -70], [0, -36], [50, -70]]); L2([[-40, 66], [0, 20], [40, 66]]); head(0, -62); }
  if (m === 'ball') { c.translate(0, 20); c.rotate(t * 3); c.beginPath(); c.arc(0, 0, 30, 0, 6.28); c.stroke(); head(0, -6); }
  if (m === 'arms') { L2([[0, -40], [0, 20]]); L2([[-14, -100], [-8, -40]]); L2([[14, -100], [8, -40]]); L2([[-14, 60], [0, 20], [14, 60]]); head(0, -62); }
  if (m === 'split') { L2([[-70, 60], [0, 50], [70, 60]]); L2([[0, 50], [0, -10]]); L2([[-40, -30], [0, -20], [40, -30]]); head(0, -40); }
  c.restore();
}
function icon(c: Ctx, m: Move, x: number, y: number, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#fff'; c.strokeStyle = '#fff'; c.lineWidth = 8; c.lineCap = 'round';
  if (m === 'star') { c.beginPath(); for (let q = 0; q < 10; q++) { const r = q % 2 ? 9 : 22; c.lineTo(Math.cos(-1.571 + q * 0.628) * r, Math.sin(-1.571 + q * 0.628) * r); } c.fill(); }
  if (m === 'ball') { c.beginPath(); c.arc(0, 0, 18, 0, 6.28); c.fill(); }
  if (m === 'arms') { c.beginPath(); c.moveTo(0, 20); c.lineTo(0, -16); c.moveTo(-14, -2); c.lineTo(0, -20); c.lineTo(14, -2); c.stroke(); }
  if (m === 'split') { c.beginPath(); c.moveTo(-24, 8); c.lineTo(24, 8); c.stroke(); c.beginPath(); c.arc(0, -10, 8, 0, 6.28); c.fill(); } c.restore(); }
const COL: Record<Move, string> = { star: '#ffd60a', ball: '#3ddc4a', arms: '#1fb6ff', split: '#ff3b6b' };
export function gym(api: Api, level: number): Activity {
  const rnd = Math.random, len = level >= 5 ? 3 + Math.floor(rnd() * 3) : [1, 2, 3, 3, 4][level], gap = level === 3 ? 0.8 : 1.1, need = 3;
  let seq: Move[] = [], show = -1, st = 0, idx = 0, cur: Move | null = null, pose = 0, routines = 0, done = false, wait = 2.6, cheer = -1;
  const make = () => { seq = Array.from({ length: len }, () => MOVES[Math.floor(rnd() * 4)]); show = 0; st = 0; idx = 0; };
  const NAME: Record<Move, string> = { star: L.star, ball: L.ball, arms: L.arms, split: L.split };
  return {
    intro: L.gymGo,
    update(dt) { pose = Math.max(0, pose - dt);
      if (wait > 0) { wait -= dt; if (wait <= 0) make(); return; }
      if (show >= 0) { st += dt; const k = Math.floor(st / gap); if (k < seq.length) { if (k !== show || cur === null) { show = k; cur = seq[k]; api.sfx.pop(); api.say(NAME[cur]); } } else { show = -1; cur = null; api.say(L.gymYour); } }
      if (cheer >= 0) { cheer += dt; if (cheer > 1.4) { cheer = -1; routines++; if (routines >= need) { done = true; api.win(L.bravo); } else make(); } } },
    draw(c: Ctx) { const t = api.t(); c.fillStyle = '#ff5fd2'; c.fillRect(0, 0, W, 844); c.fillStyle = '#9b5cff'; rr(c, 20, 470, W - 40, 180, 30); c.fill(); c.fillStyle = '#ffd6f4'; c.fillRect(0, 600, W, 40);
      c.fillStyle = '#fff'; rr(c, 90, 140, 210, 230, 24); c.fill(); gymnast(c, 195, 290, show >= 0 ? cur : null, t, '#ff9f1c'); // the pal shows
      gymnast(c, 195, 560, pose > 0 ? cur : cheer >= 0 ? 'star' : null, t, '#ff5fd2'); // you copy
      for (let i = 0; i < seq.length; i++) { const x = W / 2 + (i - (seq.length - 1) / 2) * 50, on = i < idx; c.fillStyle = on ? COL[seq[i]] : 'rgba(255,255,255,0.4)'; c.beginPath(); c.arc(x, 410, 18, 0, 6.28); c.fill(); if (on) icon(c, seq[i], x, 410, 0.6); }
      MOVES.forEach((m, i) => { const b = BTN(i), dim = show >= 0 || wait > 0; c.globalAlpha = dim ? 0.5 : 1; c.fillStyle = COL[m]; c.beginPath(); c.arc(b.x, b.y, 38, 0, 6.28); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 5; c.stroke(); icon(c, m, b.x, b.y); c.globalAlpha = 1; });
      for (let i = 0; i < need; i++) { c.fillStyle = i < routines ? '#ffd60a' : 'rgba(255,255,255,0.4)'; c.beginPath(); c.arc(170 + i * 25, 825, 8, 0, 6.28); c.fill(); } },
    down(p: Pt) { if (done || show >= 0 || wait > 0 || cheer >= 0 || !seq.length) return; const i = MOVES.findIndex((_, k) => Math.hypot(p.x - BTN(k).x, p.y - BTN(k).y) < 44); if (i < 0) return; const m = MOVES[i];
      cur = m; pose = 0.8; if (m === seq[idx]) { idx++; api.sfx.hop(); api.say(NAME[m]); if (idx >= seq.length) { cheer = 0; api.sfx.cheer(); api.burst(195, 520, 24); api.say(L.great); } } else { api.sfx.wrong(); api.say(L.gymOops); idx = 0; show = 0; st = -0.6; } },
    move() { /* */ }, up() { /* */ },
    next() { if (done || show >= 0 || wait > 0 || cheer >= 0 || !seq.length) return null; const b = BTN(MOVES.indexOf(seq[idx])); return { type: 'tap', x: b.x, y: b.y }; },
    busy: () => done || show >= 0 || wait > 0 || cheer >= 0,
  };
}
