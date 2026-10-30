// Gymnastics: Fizby's gymnast pal shows a routine of moves; copy it by tapping the moves in the same order. Teaches memory, sequencing, shapes (star, ball, arrow up, split line), counting.
// L0 one move - L1 two - L2 three - L3 three, quicker show - L4 four. 3 routines per level. 5+: remixes (3-5 moves).
import { type Ctx, W, rr, band } from '../art';
import { L } from '../lines';
import { setKitCtx, figure, shadow, starShape, box, type Pose, type KidLook } from '../fkit';
import type { Activity, Api, Pt } from '../kit';
const MOVES = ['star', 'ball', 'arms', 'split', 'flip'] as const; type Move = typeof MOVES[number];
let NM = 4; const BTN = (i: number) => ({ x: NM === 5 ? 43 + i * 76 : 60 + i * 90, y: 750 });
const LOOKS: KidLook[] = [{ skin: '#8d5a3b', hair: '#2b1a12', style: 'puffs', shoes: '#ffffff', band: '#ffd60a' }, { skin: '#f2c29b', hair: '#e0a030', style: 'curly', shoes: '#ffffff', band: '#ff3b6b' }];
const POSE: Record<string, Pose> = { idle: { la: 0.25, ra: 0.25, ll: 0.1, rl: 0.1 }, star: { la: 2.3, ra: 2.3, ll: 0.6, rl: 0.6 }, ball: { la: 1.2, ra: 1.2, ll: 1.9, rl: 1.9, tuck: 1 },
  arms: { la: 2.95, ra: 2.95, ll: 0.05, rl: 0.05 }, split: { la: 1.8, ra: 1.8, ll: 1.57, rl: 1.57 }, flip: { la: 0.15, ra: 0.15, ll: 0.25, rl: 0.25, rot: Math.PI } };
function gymnast(c: Ctx, x: number, y: number, m: Move | null, t: number, col = '#ff5fd2', who = 0) {
  setKitCtx(c); const p = { ...POSE[m || 'idle'] }; let dy = 0;
  if (m === 'ball') { p.rot = t * 5; dy = -30; } if (m === 'split') dy = 36; if (m === 'flip') dy = -50; if (!m) dy = Math.sin(t * 2) * 2;
  if (m === 'ball' || m === 'flip') shadow(x, y + 60, 26, 6);
  figure(x, y + 60 + dy, 1, col, p, LOOKS[who], () => { c.fillStyle = 'rgba(255,255,255,0.75)'; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-10 + i * 10, -54 - (i % 2) * 6, 2.4, 0, 6.28); c.fill(); } });
  if (m === 'star') for (let i = 0; i < 5; i++) starShape(x + Math.cos(i * 1.26 + t * 2) * 80, y - 30 + Math.sin(i * 1.26 + t * 2) * 50, 7, '#ffd60a');
}
function icon(c: Ctx, m: Move, x: number, y: number, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#fff'; c.strokeStyle = '#fff'; c.lineWidth = 8; c.lineCap = 'round';
  if (m === 'star') { c.beginPath(); for (let q = 0; q < 10; q++) { const r = q % 2 ? 9 : 22; c.lineTo(Math.cos(-1.571 + q * 0.628) * r, Math.sin(-1.571 + q * 0.628) * r); } c.fill(); }
  if (m === 'ball') { c.beginPath(); c.arc(0, 0, 18, 0, 6.28); c.fill(); }
  if (m === 'arms') { c.beginPath(); c.moveTo(0, 20); c.lineTo(0, -16); c.moveTo(-14, -2); c.lineTo(0, -20); c.lineTo(14, -2); c.stroke(); }
  if (m === 'split') { c.beginPath(); c.moveTo(-24, 8); c.lineTo(24, 8); c.stroke(); c.beginPath(); c.arc(0, -10, 8, 0, 6.28); c.fill(); }
  if (m === 'flip') { c.beginPath(); c.arc(0, 2, 15, Math.PI * 1.1, Math.PI * 2.4); c.stroke(); c.beginPath(); c.moveTo(4, 18); c.lineTo(14, 8); c.lineTo(-2, 8); c.fill(); c.beginPath(); c.arc(0, -16, 6, 0, 6.28); c.fill(); } c.restore(); }
const COL: Record<Move, string> = { star: '#ffd60a', ball: '#3ddc4a', arms: '#1fb6ff', split: '#ff3b6b', flip: '#9b5cff' };
export function gym(api: Api, level: number): Activity {
  const rnd = Math.random, len = level >= 5 ? 3 + Math.floor(rnd() * 3) : [1, 2, 3, 3, 4][level], gap = level === 3 ? 0.8 : 1.1, need = 3;
  let seq: Move[] = [], show = -1, st = 0, idx = 0, cur: Move | null = null, pose = 0, routines = 0, done = false, wait = 2.6, cheer = -1;
  NM = level >= 2 ? 5 : 4; const make = () => { seq = Array.from({ length: len }, () => MOVES[Math.floor(rnd() * NM)]); show = 0; st = 0; idx = 0; };
  const NAME: Record<Move, string> = { star: L.star, ball: L.ball, arms: L.arms, split: L.split, flip: L.handstand };
  return {
    intro: L.gymGo,
    update(dt) { pose = Math.max(0, pose - dt);
      if (wait > 0) { wait -= dt; if (wait <= 0) make(); return; }
      if (show >= 0) { st += dt; if (st < 0) return; const k = Math.floor(st / gap); if (k < seq.length) { if (k !== show || cur === null) { show = k; cur = seq[k]; api.sfx.pop(); api.say(NAME[cur]); } } else { show = -1; cur = null; api.say(L.gymYour); } }
      if (cheer >= 0) { cheer += dt; if (cheer > 1.4) { cheer = -1; routines++; if (routines >= need) { done = true; api.win(L.bravo); } else make(); } } },
    draw(c: Ctx) { const t = api.t(); setKitCtx(c);
      const g = c.createLinearGradient(0, 0, 0, 470); g.addColorStop(0, '#ffb3e6'); g.addColorStop(1, '#ff7ccf'); c.fillStyle = g; band(c, 0, 470);
      for (let i = -2; i < 9; i++) { c.fillStyle = i % 2 ? 'rgba(255,255,255,0.13)' : 'rgba(155,92,255,0.12)'; c.fillRect(i * 60, 0, 30, 470); }
      for (let i = 0; i < 8; i++) { const px = 10 + i * 54; c.fillStyle = ['#ffd60a', '#1fb6ff', '#3ddc4a', '#ff3b6b'][i % 4]; c.beginPath(); c.moveTo(px, 40); c.lineTo(px + 44, 40); c.lineTo(px + 22, 70); c.fill(); } c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.moveTo(-200, 40); c.lineTo(600, 40); c.stroke();
      c.fillStyle = '#ffd6f4'; band(c, 470, 374); c.fillStyle = '#f7b8e6'; for (let i = -2; i < 10; i++) c.fillRect(i * 50, 470, 2, 374);
      box(30, 618, W - 60, 22, 10, '#1fb6ff'); box(18, 640, W - 36, 14, 6, '#0e8fd0');
      box(70, 360, 250, 14, 7, '#c98a4b'); box(100, 374, 12, 40, 4, '#8a93bb'); box(278, 374, 12, 40, 4, '#8a93bb');
      c.fillStyle = 'rgba(255,255,255,0.85)'; rr(c, 92, 120, 206, 236, 26); c.fill(); c.strokeStyle = '#ff9f1c'; c.lineWidth = 5; c.stroke();
      gymnast(c, 195, 300, show >= 0 ? cur : null, t, '#ff9f1c', 1); // the pal shows on the beam
      gymnast(c, 195, 560, pose > 0 ? cur : cheer >= 0 ? 'star' : null, t, '#ff5fd2', 0); // you copy on the mat
      for (let i = 0; i < seq.length; i++) { const x = W / 2 + (i - (seq.length - 1) / 2) * 50, on = i < idx; c.fillStyle = on ? COL[seq[i]] : 'rgba(255,255,255,0.4)'; c.beginPath(); c.arc(x, 410, 18, 0, 6.28); c.fill(); if (on) icon(c, seq[i], x, 410, 0.6); }
      MOVES.slice(0, NM).forEach((m, i) => { const b = BTN(i), dim = show >= 0 || wait > 0; c.globalAlpha = dim ? 0.5 : 1; c.fillStyle = COL[m]; c.beginPath(); c.arc(b.x, b.y, NM === 5 ? 34 : 38, 0, 6.28); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 5; c.stroke(); icon(c, m, b.x, b.y); c.globalAlpha = 1; });
      for (let i = 0; i < need; i++) { c.fillStyle = i < routines ? '#ffd60a' : 'rgba(255,255,255,0.4)'; c.beginPath(); c.arc(170 + i * 25, 825, 8, 0, 6.28); c.fill(); } },
    down(p: Pt) { if (done || show >= 0 || wait > 0 || cheer >= 0 || !seq.length) return; const i = MOVES.slice(0, NM).findIndex((_, k) => Math.hypot(p.x - BTN(k).x, p.y - BTN(k).y) < (NM === 5 ? 38 : 44)); if (i < 0) return; const m = MOVES[i];
      cur = m; pose = 0.8; if (m === seq[idx]) { idx++; api.sfx.hop(); api.say(NAME[m]); if (idx >= seq.length) { cheer = 0; api.sfx.cheer(); api.burst(195, 520, 24); api.say(L.great); } } else { api.sfx.wrong(); api.say(L.gymOops); idx = 0; show = 0; st = -0.6; } },
    move() { /* */ }, up() { /* */ },
    next() { if (done || show >= 0 || wait > 0 || cheer >= 0 || !seq.length) return null; const b = BTN(MOVES.indexOf(seq[idx])); return { type: 'tap', x: b.x, y: b.y }; },
    busy: () => done || show >= 0 || wait > 0 || cheer >= 0,
  };
}
