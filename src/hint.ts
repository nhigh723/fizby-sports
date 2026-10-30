// Universal hint hand (Bimi-Boo-style guidance without reading): after 5 s with no touch, a cartoon hand
// acts out the next move the level wants (from the mode's own next()), looping every 3 s until the kid touches.
// The target pulses and Fizby says the goal out loud. Shared with Fizby's Fun & Learn (src/hint.ts there).
import type { Action } from './kit';
import { INK } from './art';
import { sfx } from './audio';
let c: CanvasRenderingContext2D; export function setHintCtx(x: CanvasRenderingContext2D) { c = x; }
type Pt = [number, number];
export const HINT_LOOP = 3, HINT_VOICE = 5, HINT_REVOICE = 15; /* the spoken nudge comes with the hand at ~5 s, then every 15 s while idle */ export const hintCfg = { delay: 5 };
export const hint = { active: false, act: null as Action | null, t: 0, cyc: 0, voiced: false, revoice: 0, shown: 0, cued: false };
export function resetHint() { hint.active = false; hint.act = null; hint.t = 0; hint.cyc = 0; hint.voiced = false; hint.cued = false; }
const ease = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
function along(path: Pt[], k: number): Pt { if (path.length === 1) return path[0]; const segs = path.length - 1, f = Math.min(segs - 1e-6, k * segs), i = Math.floor(f), r = f - i; const a = path[i], b = path[i + 1]; return [a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r]; }
/** idle = seconds since the last touch. ask() returns the mode's next move (or null). say() speaks the goal. */
export function stepHint(dt: number, idle: number, ask: () => Action | null, say: () => void) {
  if (idle < hintCfg.delay) { if (hint.active || hint.act) resetHint(); return; }
  hint.t += dt;
  if (!hint.act || hint.cyc <= 0) { const a = ask(); hint.cyc = HINT_LOOP; hint.t = 0; hint.act = a && a.type !== 'wait' ? a : null; if (hint.act) { hint.active = true; hint.shown++; if (!hint.cued) { hint.cued = true; sfx.hint(); } } }
  hint.cyc -= dt;
  if (idle >= HINT_VOICE && !hint.voiced) { hint.voiced = true; hint.revoice = idle + HINT_REVOICE; say(); }
  else if (hint.voiced && idle >= (hint.revoice ?? 1e9)) { hint.revoice = idle + HINT_REVOICE; say(); }
}
// A picture cue instead of words: the hand taps (x, y) in a slow loop, so pre-readers see what to do.
export function tapCue(x: number, y: number, T: number, a = 1) { const k = T % 1.6; if (k > 1.1) return; hand(x, y, Math.max(0, Math.sin(k / 1.1 * Math.PI * 2)), a * Math.min(1, k * 6, (1.1 - k) * 6)); }
// A fat arrow pictogram pointing (dx, dy) — "go this way" without text.
export function arrowCue(x: number, y: number, dx: number, dy: number, T: number, col = '#ffffff') { const a = Math.atan2(dy, dx), b = Math.sin(T * 5) * 6;
  c.save(); c.translate(x + Math.cos(a) * b, y + Math.sin(a) * b); c.rotate(a); c.beginPath(); c.moveTo(-26, -9); c.lineTo(4, -9); c.lineTo(4, -20); c.lineTo(28, 0); c.lineTo(4, 20); c.lineTo(4, 9); c.lineTo(-26, 9); c.closePath();
  c.fillStyle = col; c.fill(); c.lineWidth = 3.5; c.lineJoin = 'round'; c.strokeStyle = INK; c.stroke(); c.restore(); }
export function hand(x: number, y: number, press: number, a = 1) {
  c.save(); c.globalAlpha *= a; c.translate(x, y); c.rotate(-0.25); c.scale(1.25 - press * 0.15, 1.25 - press * 0.15);
  c.beginPath(); c.ellipse(14, 38, 23, 27, 0, 0, 6.28); c.fillStyle = '#ffe2c4'; c.fill(); c.lineWidth = 3.5; c.strokeStyle = INK; c.stroke();
  c.beginPath(); c.moveTo(-6, 32); c.lineTo(-6, 0); c.arc(0, 0, 6, Math.PI, 0); c.lineTo(6, 28); c.fillStyle = '#ffe2c4'; c.fill(); c.stroke();
  c.beginPath(); c.ellipse(0, -1, 3, 2.4, 0, 0, 6.28); c.fillStyle = '#ffffff'; c.fill(); c.restore();
}
export function drawHint(T: number, idle: number) {
  const a = hint.act; if (!hint.active || !a) return; const t = hint.t, fade = Math.min(1, t * 4), glow = idle >= HINT_VOICE;
  c.save();
  if (a.type === 'drag') { const k = Math.max(0, Math.min(1, (t - 0.35) / 1.6)), path = a.path as Pt[];
    c.save(); c.globalAlpha = fade; c.setLineDash([10, 12]); c.lineDashOffset = -T * 40; c.lineWidth = 7; c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineCap = 'round'; c.beginPath(); path.forEach((p, j) => j ? c.lineTo(...p) : c.moveTo(...p)); c.stroke();
    c.lineWidth = 3.5; c.strokeStyle = '#ffb703'; c.stroke(); c.restore();
    const e = path[path.length - 1]; ring(e[0], e[1], T, glow); const [x, y] = along(path, ease(k)); hand(x, y, k > 0 && k < 1 ? 1 : 0, fade * (t > 2.4 ? Math.max(0, 1 - (t - 2.4) * 2) : 1)); }
  else if (a.type === 'tap') { const ph = (t * 1.4) % 1, pr = ph > 0.45 && ph < 0.65 ? 1 : 0, dy = ph < 0.45 ? (0.45 - ph) * 50 : 0; ring(a.x, a.y, T, glow); if (pr || ph > 0.65) { c.beginPath(); c.arc(a.x, a.y, 14 + ((ph - 0.45) / 0.55) * 46, 0, 6.28); c.lineWidth = 4; c.strokeStyle = `rgba(255,183,3,${Math.max(0, 1 - (ph - 0.45) * 1.8)})`; c.stroke(); } hand(a.x, a.y + dy, pr, fade); }
  c.restore();
}
function ring(x: number, y: number, T: number, glow: boolean) { const r = (glow ? 34 : 26) + Math.sin(T * 6) * (glow ? 8 : 4); c.save(); c.beginPath(); c.arc(x, y, r, 0, 6.28); c.fillStyle = glow ? 'rgba(255,240,140,0.55)' : 'rgba(255,255,255,0.35)'; c.fill(); c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,0.9)'; c.stroke(); c.restore(); }
