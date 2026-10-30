// 2D cartoon Fizby poses (public/art/fizby-*.webp), shared with Fizby's Fun & Learn (src/nico.ts there).
type Ctx = CanvasRenderingContext2D;
export type Pose2d = 'welcome-point' | 'cheer-jump' | 'think' | 'wave' | 'oops' | 'explain';
const imgs: Record<string, HTMLImageElement> = {};
function img(name: string) { let i = imgs[name]; if (!i) { i = new Image(); i.decoding = 'async'; i.src = `./art/${name}.webp`; imgs[name] = i; } return i; }
const ready = (i: HTMLImageElement) => i.complete && i.naturalWidth > 0;
export function preloadArt(bgs: string[]) {
  (['welcome-point', 'cheer-jump', 'think', 'wave', 'oops', 'explain'] as Pose2d[]).forEach(p => img('fizby-' + p)); void bgs;
  return Promise.all(Object.values(imgs).map(i => i.decode().catch(() => {})));
}
/** Full-body Fizby standing on footY, centered at x, h logical px tall. Gentle bob and squash for life. */
export function fizby(c: Ctx, pose: Pose2d, x: number, footY: number, h: number, t = 0, flip = false, sx = 1, sy = 1) {
  const i = img('fizby-' + pose); if (!ready(i)) return;
  const w = h * i.naturalWidth / i.naturalHeight, bob = pose === 'cheer-jump' ? Math.abs(Math.sin(t * 4)) * h * 0.05 : Math.sin(t * 2.2) * h * 0.008;
  c.save(); c.translate(x, footY - bob); if (flip) c.scale(-1, 1);
  c.globalAlpha *= 0.18; c.fillStyle = '#2b2140'; c.beginPath(); c.ellipse(0, bob, w * 0.36, h * 0.025, 0, 0, 6.28); c.fill(); c.globalAlpha /= 0.18;
  c.scale(sx, sy); c.drawImage(i, -w / 2, -h, w, h); c.restore();
}
/** Round portrait (head and shoulders) at x,y with radius r. */
export function fizbyBust(c: Ctx, pose: Pose2d, x: number, y: number, r: number, ring = '#7b6cf6') {
  const i = img('fizby-' + pose); c.save(); c.beginPath(); c.arc(x, y, r, 0, 6.28); c.fillStyle = '#e9f6ff'; c.fill();
  if (ready(i)) { c.clip(); const iw = i.naturalWidth, ih = i.naturalHeight, sh = ih * 0.3, sw = sh, sx = headX(pose) * iw - sw / 2; c.drawImage(i, sx, 0, sw, sh, x - r, y - r * 0.92, r * 2, r * 2); }
  c.restore(); c.beginPath(); c.arc(x, y, r, 0, 6.28); c.lineWidth = Math.max(3, r * 0.1); c.strokeStyle = ring; c.stroke();
}
const headX = (p: Pose2d) => ({ 'cheer-jump': 0.444, 'welcome-point': 0.332, think: 0.353, wave: 0.625, oops: 0.459, explain: 0.692 })[p]; // from scripts/art2d.py

import { mascot as vecMascot, mascotBust as vecBust, type Pose } from './art';
/** Sports pose names -> the shared 2D poses. 'oops' and 'think' are new contextual moods (a miss, a long pause). */
export type Mood = Pose | 'oops';
const MAP: Record<Mood, Pose2d> = { stand: 'explain', point: 'welcome-point', cheer: 'cheer-jump', think: 'think', wave: 'wave', oops: 'oops' };
/** Same call shape as the old vector mascot; falls back to it until the webp has loaded. Talking adds a little squash. */
export function mascot(c: Ctx, x: number, footY: number, h: number, pose: Mood = 'stand', t = 0, talk = false, flip = false) {
  const i = img('fizby-' + MAP[pose]); if (!ready(i)) { vecMascot(c, x, footY, h, pose === 'oops' ? 'think' : pose, t, talk, flip); return; }
  const q = talk ? Math.sin(t * 18) * 0.015 : 0; fizby(c, MAP[pose], x, footY, h, t, flip, 1 - q, 1 + q);
}
export function mascotBust(c: Ctx, x: number, y: number, r: number, t: number, talk = false, pose: Mood = 'stand') {
  const i = img('fizby-' + MAP[pose]); if (!ready(i)) { vecBust(c, x, y, r, t, talk); return; }
  const s = 1 + (talk ? Math.abs(Math.sin(t * 14)) * 0.05 : Math.sin(t * 2) * 0.01); c.save(); c.translate(x, y); c.scale(s, s); fizbyBust(c, MAP[pose], 0, 0, r, '#ffffff'); c.restore();
}
