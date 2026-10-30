// Fizby Sports art, all drawn in code (original designs): balls, goal, hoop, pins, the keeper pal, trophies, stickers, fields.
import { kid, setKitCtx, type KidLook } from './fkit';
import { type Ctx, rr, shade, W } from './art';
export type BallKind = 'soccer' | 'basket' | 'bowl' | 'tee' | 'swim' | 'golf' | 'tennis' | 'race' | 'hockey' | 'gym' | 'paint';
/** hub order: the icon for each sport (stickers and trophies use it too) */
export const KINDS: BallKind[] = ['soccer', 'basket', 'bowl', 'tee', 'swim', 'golf', 'tennis', 'race', 'hockey', 'gym', 'paint'];
export const SPORT_COLS = ['#3ddc4a', '#ff9f1c', '#9b5cff', '#1fb6ff', '#ff3b6b', '#ffd60a', '#ff5fd2', '#22d3ee', '#7c5cff', '#ff6a1a', '#00c2a8'];
export function ball(c: Ctx, kind: BallKind, x: number, y: number, r: number, rot = 0) {
  c.save(); c.translate(x, y); c.fillStyle = 'rgba(0,0,0,0.18)'; c.beginPath(); c.ellipse(r * 0.15, r * 0.95, r * 0.9, r * 0.25, 0, 0, 6.28); c.fill(); c.rotate(rot);
  if (kind === 'soccer') { c.fillStyle = '#fff'; c.beginPath(); c.arc(0, 0, r, 0, 6.28); c.fill(); c.fillStyle = '#2b2140';
    const pent = (px: number, py: number, s: number) => { c.beginPath(); for (let i = 0; i < 5; i++) { const a = -1.571 + i * 1.2566; c.lineTo(px + Math.cos(a) * s, py + Math.sin(a) * s); } c.fill(); };
    pent(0, 0, r * 0.36); for (let i = 0; i < 5; i++) { const a = -1.571 + i * 1.2566; c.save(); c.beginPath(); c.arc(0, 0, r, 0, 6.28); c.clip(); pent(Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9, r * 0.3); c.restore(); }
    c.lineWidth = r * 0.08; c.strokeStyle = '#2b2140'; c.beginPath(); c.arc(0, 0, r, 0, 6.28); c.stroke(); }
  if (kind === 'basket') { c.fillStyle = '#ff8a1c'; c.beginPath(); c.arc(0, 0, r, 0, 6.28); c.fill(); c.strokeStyle = '#7a3a10'; c.lineWidth = r * 0.09; c.beginPath(); c.arc(0, 0, r, 0, 6.28); c.moveTo(-r, 0); c.lineTo(r, 0); c.moveTo(0, -r); c.lineTo(0, r); c.stroke();
    c.beginPath(); c.arc(-r * 1.25, 0, r * 0.85, -0.9, 0.9); c.stroke(); c.beginPath(); c.arc(r * 1.25, 0, r * 0.85, Math.PI - 0.9, Math.PI + 0.9); c.stroke(); }
  if (kind === 'bowl') { const g = c.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r); g.addColorStop(0, '#d9b8ff'); g.addColorStop(1, '#6b2fd6'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, 6.28); c.fill();
    c.fillStyle = '#2b1a55'; for (const [hx, hy] of [[-0.25, -0.3], [0.12, -0.38], [-0.05, -0.05]]) { c.beginPath(); c.arc(hx * r, hy * r, r * 0.12, 0, 6.28); c.fill(); } }
  if (kind === 'tee') { c.fillStyle = '#fff'; c.beginPath(); c.arc(0, 0, r, 0, 6.28); c.fill(); c.strokeStyle = '#ff3b6b'; c.lineWidth = r * 0.08; c.setLineDash([r * 0.12, r * 0.1]); c.beginPath(); c.arc(-r * 1.3, 0, r * 0.95, -0.8, 0.8); c.stroke(); c.beginPath(); c.arc(r * 1.3, 0, r * 0.95, Math.PI - 0.8, Math.PI + 0.8); c.stroke(); c.setLineDash([]); c.strokeStyle = '#d8d0e8'; c.lineWidth = r * 0.06; c.beginPath(); c.arc(0, 0, r, 0, 6.28); c.stroke(); }
  if (kind === 'swim') { c.lineWidth = r * 0.42; for (let k = 0; k < 4; k++) { c.strokeStyle = k % 2 ? '#fff' : '#ff3b6b'; c.beginPath(); c.arc(0, 0, r * 0.75, k * 1.571, (k + 1) * 1.571); c.stroke(); } }
  if (kind === 'golf') { c.fillStyle = '#fff'; c.beginPath(); c.arc(0, 0, r, 0, 6.28); c.fill(); c.fillStyle = '#dcd6ea'; for (let k = 0; k < 9; k++) { c.beginPath(); c.arc(Math.cos(k * 0.7) * r * 0.55 * (k % 3) / 2, Math.sin(k * 0.7) * r * 0.55 * (k % 3) / 2, r * 0.1, 0, 6.28); c.fill(); } c.strokeStyle = '#cfc8e0'; c.lineWidth = r * 0.06; c.beginPath(); c.arc(0, 0, r, 0, 6.28); c.stroke(); }
  if (kind === 'tennis') { c.fillStyle = '#d4f53c'; c.beginPath(); c.arc(0, 0, r, 0, 6.28); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = r * 0.12; c.beginPath(); c.arc(-r * 1.2, 0, r * 0.9, -0.9, 0.9); c.stroke(); c.beginPath(); c.arc(r * 1.2, 0, r * 0.9, Math.PI - 0.9, Math.PI + 0.9); c.stroke(); }
  if (kind === 'race') { c.fillStyle = '#2b2140'; c.beginPath(); c.arc(0, 0, r, 0, 6.28); c.fill(); c.fillStyle = '#c8c8d8'; c.beginPath(); c.arc(0, 0, r * 0.55, 0, 6.28); c.fill(); c.strokeStyle = '#8a8aa0'; c.lineWidth = r * 0.12; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(k * 1.2566) * r * 0.5, Math.sin(k * 1.2566) * r * 0.5); c.stroke(); } c.fillStyle = '#ff3b6b'; c.beginPath(); c.arc(0, 0, r * 0.16, 0, 6.28); c.fill(); }
  if (kind === 'hockey') { c.scale(1, 0.55); c.fillStyle = '#2b2140'; c.beginPath(); c.arc(0, 0, r, 0, 6.28); c.fill(); c.fillStyle = '#4a3d6a'; c.beginPath(); c.arc(0, -r * 0.2, r * 0.8, 0, 6.28); c.fill(); }
  if (kind === 'gym') { c.fillStyle = '#ff5fd2'; c.beginPath(); c.arc(0, 0, r, 0, 6.28); c.fill(); star(c, 0, 0, r * 0.7, '#ffd60a'); }
  if (kind === 'paint') { c.fillStyle = '#ffe0b0'; c.beginPath(); c.ellipse(0, 0, r, r * 0.82, 0, 0, 6.28); c.fill(); ['#ff3b6b', '#1fb6ff', '#3ddc4a', '#ffd60a'].forEach((col, k) => { c.fillStyle = col; c.beginPath(); c.arc(Math.cos(-2.4 + k * 0.9) * r * 0.55, Math.sin(-2.4 + k * 0.9) * r * 0.5, r * 0.2, 0, 6.28); c.fill(); }); c.fillStyle = '#fff'; c.beginPath(); c.arc(r * 0.35, r * 0.3, r * 0.17, 0, 6.28); c.fill(); }
  c.fillStyle = 'rgba(255,255,255,0.45)'; c.beginPath(); c.ellipse(-r * 0.38, -r * 0.45, r * 0.25, r * 0.14, -0.6, 0, 6.28); c.fill(); c.restore();
}
export function field(c: Ctx, top: number, col = '#3ddc4a') { for (let i = 0; i * 60 < 900; i++) { c.fillStyle = i % 2 ? col : shade(col, -0.08); c.fillRect(0, top + i * 60, W, 60); } }
export function goal(c: Ctx, x: number, y: number, w: number, h = 110, col = '#ffffff') {
  c.save(); c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(x - w / 2, y - h, w, h); c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 2;
  for (let gx = x - w / 2; gx <= x + w / 2; gx += 16) { c.beginPath(); c.moveTo(gx, y - h); c.lineTo(gx, y); c.stroke(); } for (let gy = y - h; gy <= y; gy += 16) { c.beginPath(); c.moveTo(x - w / 2, gy); c.lineTo(x + w / 2, gy); c.stroke(); }
  c.strokeStyle = col; c.lineWidth = 12; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x - w / 2, y - h); c.lineTo(x + w / 2, y - h); c.lineTo(x + w / 2, y); c.stroke(); c.restore();
}
/** the keeper pal: a round fluffy original critter with big gloves */
const LOOKS: KidLook[] = [{ skin: '#f2c29b', hair: '#7a4a2a', style: 'spiky', shoes: '#ffffff', band: '#ffd60a' }, { skin: '#8d5a3b', hair: '#2b1a12', style: 'puffs', shoes: '#ff3b6b', band: '' },
  { skin: '#e0ac69', hair: '#1d1427', style: 'curly', shoes: '#1fb6ff', band: '' }, { skin: '#ffdbb5', hair: '#e8a33d', style: 'short', shoes: '#3ddc4a', band: '#ff5fd2' }];
/** A team pal: the shared kid() cartoon child (F&L kit), jersey in the team colour, gloves up and bouncing. Centre at x,y like the old keeper. */
export function keeper(c: Ctx, x: number, y: number, t: number, col = '#ff5fd2', look = -1) {
  setKitCtx(c); const L = LOOKS[look >= 0 ? look % 4 : Math.abs(Math.round(x * 7 + col.charCodeAt(2))) % 4], b = Math.abs(Math.sin(t * 6)) * 4;
  kid(x, y + 40 - b, 0.58, col, 0.6 + Math.sin(t * 6) * 0.4, t, 0, '', L);
}
export function hoop(c: Ctx, x: number, y: number, col = '#ff3b6b', t = 0, swish = 0) {
  c.save(); c.fillStyle = '#fff'; rr(c, x - 52, y - 82, 104, 72, 10); c.fill(); c.strokeStyle = col; c.lineWidth = 6; c.stroke(); c.strokeStyle = col; c.lineWidth = 4; c.strokeRect(x - 20, y - 50, 40, 32);
  c.fillStyle = '#8a8f99'; c.fillRect(x - 4, y - 12, 8, 14);
  c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineWidth = 3; const sw = Math.sin(t * 20) * swish * 6;
  for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(x + k * 11, y); c.lineTo(x + k * 7 + sw, y + 46); c.stroke(); } for (let r = 1; r <= 3; r++) { c.beginPath(); c.moveTo(x - 36 + r * 4, y + r * 14); c.lineTo(x + 36 - r * 4 + sw, y + r * 14); c.stroke(); }
  c.strokeStyle = col; c.lineWidth = 8; c.beginPath(); c.ellipse(x, y, 38, 9, 0, 0, 6.28); c.stroke(); c.restore();
}
export function pin(c: Ctx, x: number, y: number, s = 1, rot = 0, col = '#ff3b6b') {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.fillStyle = 'rgba(0,0,0,0.15)'; if (!rot) { c.beginPath(); c.ellipse(0, 2, 13, 5, 0, 0, 6.28); c.fill(); }
  c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-6, 0); c.quadraticCurveTo(-15, -22, -6, -36); c.quadraticCurveTo(-3, -42, -6, -50); c.arc(0, -52, 7, Math.PI, 0); c.quadraticCurveTo(3, -42, 6, -36); c.quadraticCurveTo(15, -22, 6, 0); c.closePath(); c.fill();
  c.strokeStyle = '#d8d0e8'; c.lineWidth = 1.5; c.stroke(); c.fillStyle = col; c.fillRect(-5.5, -41, 11, 4); c.fillRect(-5, -35, 10, 3); c.restore();
}
export function trophy(c: Ctx, x: number, y: number, s: number, sport: number, got: boolean, t = 0) {
  c.save(); c.translate(x, y); c.scale(s, s); const gold = got ? '#ffc61a' : 'rgba(255,255,255,0.35)', dk = got ? '#d99a00' : 'rgba(0,0,0,0.12)';
  c.fillStyle = dk; rr(c, -26, 30, 52, 14, 4); c.fill(); c.fillStyle = gold; c.fillRect(-7, 6, 14, 26); c.beginPath(); c.moveTo(-30, -34); c.lineTo(30, -34); c.quadraticCurveTo(30, 12, 0, 12); c.quadraticCurveTo(-30, 12, -30, -34); c.fill();
  c.strokeStyle = gold; c.lineWidth = 6; c.beginPath(); c.arc(-30, -18, 11, 1.4, 4.9); c.stroke(); c.beginPath(); c.arc(30, -18, 11, -1.7, 1.7); c.stroke();
  if (got) { ball(c, KINDS[sport % KINDS.length], 0, -14, 12, t); c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(-22, -30, 5, 26); } c.restore();
}
/** a sticker: a die-cut round badge with the sport's ball and a colour variant ring + star */
export function sticker(c: Ctx, x: number, y: number, r: number, sport: number, v: number, t = 0) {
  const col = SPORT_COLS[(sport * 3 + v) % SPORT_COLS.length]; c.save(); c.translate(x, y); c.rotate(Math.sin(t * 2 + v) * 0.08);
  c.fillStyle = 'rgba(0,0,0,0.15)'; c.beginPath(); c.arc(2, 4, r, 0, 6.28); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(0, 0, r, 0, 6.28); c.fill(); c.fillStyle = col; c.beginPath(); c.arc(0, 0, r * 0.86, 0, 6.28); c.fill();
  ball(c, KINDS[sport % KINDS.length], 0, 0, r * 0.5, v);
  c.fillStyle = '#ffd60a'; c.beginPath(); for (let q = 0; q < 10; q++) { const rr2 = q % 2 ? r * 0.1 : r * 0.24; c.lineTo(r * 0.6 + Math.cos(-1.571 + q * 0.628) * rr2, -r * 0.6 + Math.sin(-1.571 + q * 0.628) * rr2); } c.fill(); c.restore();
}
export function star(c: Ctx, x: number, y: number, r: number, col = '#ffd60a') { c.fillStyle = col; c.beginPath(); for (let q = 0; q < 10; q++) { const rr2 = q % 2 ? r * 0.42 : r; c.lineTo(x + Math.cos(-1.571 + q * 0.628) * rr2, y + Math.sin(-1.571 + q * 0.628) * rr2); } c.fill(); }
