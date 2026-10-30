// Shared drawing kit from Fizby's Fun & Learn (src/games/kit.ts there): soft-shaded vector shapes and the kid() cartoon child.
import { INK } from './art';
let c: CanvasRenderingContext2D; export function setKitCtx(x: CanvasRenderingContext2D) { c = x; }
export const K = { lw: 1 }; // outline multiplier (icons drawn small bump this up)
const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
export function mix(hex: string, to: string, k: number) {
  if (typeof hex !== 'string' || hex[0] !== '#') return hex; // paint patterns (Truck Town finishes) pass through
  const a = parseInt(hex.slice(1), 16), b = parseInt(to.slice(1), 16);
  const r = ((a >> 16) & 255) * (1 - k) + ((b >> 16) & 255) * k, g = ((a >> 8) & 255) * (1 - k) + ((b >> 8) & 255) * k, bl = (a & 255) * (1 - k) + (b & 255) * k;
  return '#' + ((1 << 24) + (clamp(r) << 16) + (clamp(g) << 8) + clamp(bl)).toString(16).slice(1);
}
export const light = (h: string, k = 0.3) => mix(h, '#ffffff', k), dark = (h: string, k = 0.2) => mix(h, '#1d1427', k);
export function path(r: number, x: number, y: number, w: number, h: number) {
  r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
export function stroke(w = 3.5) { c.lineWidth = w * K.lw; c.strokeStyle = INK; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); }
/** Vertical gradient fill: lighter top, darker bottom, for a gentle "3D" look without textures. */
export function shade(col: string, y0: number, y1: number): string | CanvasGradient { if (col[0] !== '#') return col; const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, light(col, 0.28)); g.addColorStop(0.55, col); g.addColorStop(1, dark(col, 0.18)); return g; }
export function box(x: number, y: number, w: number, h: number, r: number, col: string, outline = true) { path(r, x, y, w, h); c.fillStyle = shade(col, y, y + h); c.fill(); if (outline) stroke(); }
export function shape(pts: number[], col: string, y0?: number, y1?: number, outline = true) {
  c.beginPath(); c.moveTo(pts[0], pts[1]); let lo = pts[1], hi = pts[1];
  for (let i = 2; i < pts.length; i += 2) { c.lineTo(pts[i], pts[i + 1]); lo = Math.min(lo, pts[i + 1]); hi = Math.max(hi, pts[i + 1]); }
  c.closePath(); c.fillStyle = shade(col, y0 ?? lo, y1 ?? hi); c.fill(); if (outline) stroke();
}
export function ball(x: number, y: number, r: number, col: string, outline = true) {
  if (typeof col !== 'string') { c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fillStyle = col; c.fill(); if (outline) stroke(); return; } // paint finish pattern
  const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); g.addColorStop(0, light(col, 0.45)); g.addColorStop(0.6, col); g.addColorStop(1, dark(col, 0.22));
  c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fillStyle = g; c.fill(); if (outline) stroke();
}
export function shadow(x: number, y: number, rx: number, ry = rx * 0.22, a = 0.18) { c.save(); c.globalAlpha *= a; c.fillStyle = INK; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 6.283); c.fill(); c.restore(); }
export function glass(x: number, y: number, w: number, h: number, r = 6) {
  path(r, x, y, w, h); const g = c.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#e9f8ff'); g.addColorStop(1, '#8fd3f4'); c.fillStyle = g; c.fill(); stroke(3);
  c.save(); path(r, x, y, w, h); c.clip(); c.globalAlpha *= 0.6; c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x + w * 0.15, y + h); c.lineTo(x + w * 0.45, y); c.lineTo(x + w * 0.62, y); c.lineTo(x + w * 0.32, y + h); c.fill(); c.restore();
}
export function wheel(x: number, y: number, r: number, rot = 0, hub = '#cad1e9') {
  // tyre: rubber with soft sidewall shading, chunky tread blocks, metallic rim with shine
  const tg = c.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.2, x, y, r); tg.addColorStop(0, '#4a4580'); tg.addColorStop(1, '#221e4d');
  c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fillStyle = tg; c.fill(); stroke(3);
  c.save(); c.translate(x, y); c.rotate(rot);
  c.fillStyle = '#16133a'; for (let i = 0; i < 12; i++) { c.rotate(Math.PI / 6); c.fillRect(r - Math.max(3, r * 0.16), -r * 0.09, Math.max(3, r * 0.16), r * 0.18); }
  const rg = c.createLinearGradient(-r * 0.5, -r * 0.5, r * 0.5, r * 0.5); rg.addColorStop(0, '#ffffff'); rg.addColorStop(0.45, hub); rg.addColorStop(1, '#7c86ad');
  c.beginPath(); c.arc(0, 0, r * 0.55, 0, 6.283); c.fillStyle = rg; c.fill(); stroke(2.5);
  c.strokeStyle = '#8a93bb'; c.lineWidth = Math.max(1.5, r * 0.06); for (let i = 0; i < 5; i++) { c.rotate(Math.PI * 2 / 5); c.beginPath(); c.moveTo(r * 0.12, 0); c.lineTo(r * 0.5, 0); c.stroke(); }
  c.beginPath(); c.arc(0, 0, r * 0.14, 0, 6.283); c.fillStyle = '#5d6796'; c.fill();
  c.restore();
  c.save(); c.globalAlpha *= 0.55; c.strokeStyle = '#fff'; c.lineWidth = Math.max(1.5, r * 0.08); c.lineCap = 'round'; c.beginPath(); c.arc(x, y, r * 0.42, 3.6, 4.6); c.stroke(); c.restore();
}
export function label(s: string, x: number, y: number, size: number, col = INK, weight = 900, outline = '') {
  c.font = `${weight} ${size}px "Avenir Next Rounded","Avenir Next","Nunito","Trebuchet MS",system-ui,sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
  if (outline) { c.lineWidth = size * 0.22; c.strokeStyle = outline; c.lineJoin = 'round'; c.strokeText(s, x, y); } c.fillStyle = col; c.fillText(s, x, y);
}
export function starShape(x: number, y: number, r: number, col: string, rot = 0) {
  c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + rot + i * Math.PI / 5, rr = i % 2 ? r * 0.48 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fillStyle = col; c.fill(); stroke(Math.max(2, r * 0.12));
}
export function heart(x: number, y: number, s: number, col: string) {
  c.beginPath(); c.moveTo(x, y + s * 0.8); c.bezierCurveTo(x - s * 1.4, y - s * 0.1, x - s * 0.6, y - s * 1.1, x, y - s * 0.35); c.bezierCurveTo(x + s * 0.6, y - s * 1.1, x + s * 1.4, y - s * 0.1, x, y + s * 0.8); c.fillStyle = col; c.fill(); stroke(2.5);
}
export function bolt(x: number, y: number, s: number, col: string) { shape([x + s * 0.2, y - s, x - s * 0.6, y + s * 0.15, x - s * 0.05, y + s * 0.15, x - s * 0.25, y + s, x + s * 0.6, y - s * 0.2, x + s * 0.05, y - s * 0.2], col); }
export function flameShape(x: number, y: number, s: number, t = 0) { // layered flame: soft glow, red outer with flickering tongues, orange body, yellow-white core
  const w = Math.sin(t * 9) * 0.12 * s, w2 = Math.sin(t * 13 + 1) * 0.1 * s, fl = 1 + Math.sin(t * 17) * 0.06;
  c.save(); const g = c.createRadialGradient(x, y + s * 0.2, 0, x, y + s * 0.2, s * 1.4); g.addColorStop(0, 'rgba(255,190,60,0.35)'); g.addColorStop(1, 'rgba(255,120,40,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y + s * 0.2, s * 1.4, 0, 6.283); c.fill(); c.restore();
  const layer = (k: number, col: string, out: boolean) => { const h = s * k * fl; c.beginPath(); c.moveTo(x + w * k, y - h); c.bezierCurveTo(x + s * 0.3 * k, y - h * 0.55, x + s * 0.55 * k + w2, y - h * 0.45, x + s * 0.5 * k, y - h * 0.2); c.bezierCurveTo(x + s * 0.85 * k, y + s * 0.15, x + s * 0.6 * k, y + s * 0.7 * k, x, y + s * 0.7 * k);
    c.bezierCurveTo(x - s * 0.6 * k, y + s * 0.7 * k, x - s * 0.85 * k, y + s * 0.1, x - s * 0.55 * k - w2, y - h * 0.3); c.bezierCurveTo(x - s * 0.5 * k, y - h * 0.5, x - s * 0.25 * k, y - h * 0.6, x + w * k, y - h); c.fillStyle = col; c.fill(); if (out) stroke(2.5); };
  layer(1, '#ff5a2a', true); layer(0.78, '#ff9a2f', false); layer(0.52, '#ffd23f', false); c.beginPath(); c.ellipse(x, y + s * 0.38, s * 0.16, s * 0.24, 0, 0, 6.283); c.fillStyle = '#fff6c8'; c.fill(); }
/** Big round control button with an icon callback, drawn at x,y. Returns nothing; hit-testing is the mode's job. */
export function pad(x: number, y: number, r: number, col: string, down: boolean, icon?: () => void) {
  c.save(); c.translate(x, y + (down ? 3 : 0)); if (!down) { c.beginPath(); c.arc(0, 5, r, 0, 6.283); c.fillStyle = 'rgba(74,58,168,0.2)'; c.fill(); }
  ball(0, 0, r, col); if (icon) icon(); c.restore();
}
/** Simple kid figure (teammates, goalie): jersey color, skin, hair. Pose: arms 0 = down, 1 = up. */
/** optional look for kid(): skin, hair color + style, shoe color, headband color ('' = none), shorts color */
export type KidLook = { skin: string; hair: string; style: string; shoes: string; band: string; shorts?: string };
export const KID_DEFAULT: KidLook = { skin: '#f2c29b', hair: '#7a4a2a', style: 'short', shoes: '#ffffff', band: '' };
export function kid(x: number, y: number, s: number, jersey: string, arms = 0, t = 0, run = 0, num = '', look: KidLook = KID_DEFAULT) {
  c.save(); c.translate(x, y); c.scale(s, s); const leg = Math.sin(t * 12) * 10 * run;
  shadow(0, 0, 26, 6);
  c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = 11; c.beginPath(); c.moveTo(-8, -40); c.lineTo(-10 - leg * 0.5, -4); c.moveTo(8, -40); c.lineTo(10 + leg * 0.5, -4); c.stroke();
  c.strokeStyle = look.skin; c.lineWidth = 7; c.beginPath(); c.moveTo(-8, -40); c.lineTo(-10 - leg * 0.5, -4); c.moveTo(8, -40); c.lineTo(10 + leg * 0.5, -4); c.stroke();
  box(-14, -6, 14, 7, 3, look.shoes); box(2, -6, 14, 7, 3, look.shoes); box(-17, -48, 34, 16, 5, look.shorts || '#3d4a7a');
  const ay = -84 - arms * 30; c.lineWidth = 10; c.strokeStyle = INK; c.beginPath(); c.moveTo(-18, -78); c.lineTo(-32, ay + 30 - arms * 10); c.moveTo(18, -78); c.lineTo(32, ay + 30 - arms * 10); c.stroke();
  c.lineWidth = 6.5; c.strokeStyle = look.skin; c.stroke();
  box(-20, -88, 40, 46, 12, jersey); if (num) label(num, 0, -66, 18, '#fff', 900, INK);
  if (look.style === 'puffs') { ball(-17, -122, 9, look.hair); ball(17, -122, 9, look.hair); }
  if (look.style === 'curly') for (let i = 0; i < 7; i++) ball(Math.cos(Math.PI + i * Math.PI / 6) * 16, -110 + Math.sin(Math.PI + i * Math.PI / 6) * 16, 7, look.hair);
  ball(0, -106, 17, look.skin); c.beginPath(); c.arc(0, -110, 17, Math.PI * 1.05, Math.PI * 1.95); c.fillStyle = look.hair; c.fill(); stroke(3);
  if (look.style === 'spiky') shape([-15, -116, -12, -133, -5, -122, 0, -138, 5, -122, 12, -133, 15, -116], look.hair);
  if (look.band) { c.fillStyle = look.band; c.fillRect(-17, -117, 34, 6); c.lineWidth = 2; c.strokeStyle = INK; c.strokeRect(-17, -117, 34, 6); }
  c.fillStyle = INK; c.beginPath(); c.arc(-6, -104, 2.4, 0, 6.283); c.arc(6, -104, 2.4, 0, 6.283); c.fill(); c.beginPath(); c.arc(0, -99, 5, 0.2, Math.PI - 0.2); c.lineWidth = 2; c.stroke();
  c.restore();
}

/** Club padlock badge (free taste: the rest of a free-play world needs Nico Club; a kid tapping it hears "Ask a grown-up!") */
// Picture words for pre-readers: an ear ("listen") and a check mark ("done").
export function ear(x: number, y: number, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(-8, 14); c.bezierCurveTo(-16, 4, -14, -16, 0, -16); c.bezierCurveTo(14, -16, 16, 0, 8, 6); c.bezierCurveTo(2, 10, 4, 18, -4, 18); c.closePath(); c.fillStyle = '#ffd2b0'; c.fill(); stroke(3);
  c.beginPath(); c.arc(0, -3, 6, Math.PI * 0.9, Math.PI * 2.2); c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke(); c.restore(); }
export function check(x: number, y: number, s = 1, col = '#ffffff') { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(-12, 0); c.lineTo(-3, 9); c.lineTo(13, -9); c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 9; c.strokeStyle = INK; c.stroke(); c.lineWidth = 5; c.strokeStyle = col; c.stroke(); c.restore(); }
export function padlock(x: number, y: number, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); ball(0, 0, 17, '#ffffff'); c.beginPath(); c.arc(0, -4, 6, Math.PI, 0); c.lineWidth = 3.5; c.strokeStyle = INK; c.stroke(); box(-8, -4, 16, 13, 3, '#ffb703'); c.restore(); }

/** Head + hair + face of the kid() cartoon at (0,-106) in kid space, split out so posed figures share it. */
export function kidHead(look: KidLook = KID_DEFAULT) {
  if (look.style === 'puffs') { ball(-17, -122, 9, look.hair); ball(17, -122, 9, look.hair); }
  if (look.style === 'curly') for (let i = 0; i < 7; i++) ball(Math.cos(Math.PI + i * Math.PI / 6) * 16, -110 + Math.sin(Math.PI + i * Math.PI / 6) * 16, 7, look.hair);
  ball(0, -106, 17, look.skin); c.beginPath(); c.arc(0, -110, 17, Math.PI * 1.05, Math.PI * 1.95); c.fillStyle = look.hair; c.fill(); stroke(3);
  if (look.style === 'spiky') shape([-15, -116, -12, -133, -5, -122, 0, -138, 5, -122, 12, -133, 15, -116], look.hair);
  if (look.band) { c.fillStyle = look.band; c.fillRect(-17, -117, 34, 6); c.lineWidth = 2; c.strokeStyle = INK; c.strokeRect(-17, -117, 34, 6); }
  ball(-11, -99, 3.5, '#ff9bb0', false); ball(11, -99, 3.5, '#ff9bb0', false);
  c.fillStyle = INK; c.beginPath(); c.arc(-6, -104, 2.4, 0, 6.283); c.arc(6, -104, 2.4, 0, 6.283); c.fill(); c.beginPath(); c.arc(0, -99, 5, 0.2, Math.PI - 0.2); c.lineWidth = 2; c.stroke();
}
function limb(x: number, y: number, a: number, len: number, skin: string, w: number, end?: string) {
  const ex = x + Math.sin(a) * len, ey = y + Math.cos(a) * len;
  c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.lineTo(ex, ey); c.strokeStyle = INK; c.lineWidth = w + 4; c.stroke(); c.strokeStyle = skin; c.lineWidth = w; c.stroke();
  if (end) { c.save(); c.translate(ex, ey); c.rotate(-a); box(-7, -3, 14, 7, 3, end); c.restore(); } else ball(ex, ey, w * 0.62, skin, true);
}
/** Posed cartoon kid (same look as kid()): limb angles in radians from straight down (0 = down, PI = up), whole-body spin `rot`
 * around the tummy. Used for gymnasts (star jumps, tucks, splits, handstands) and other action poses. */
export type Pose = { la: number; ra: number; ll: number; rl: number; rot?: number; tuck?: number };
export function figure(x: number, y: number, s: number, jersey: string, p: Pose, look: KidLook = KID_DEFAULT, extra?: () => void) {
  c.save(); c.translate(x, y); c.scale(s, s); if (!p.rot) shadow(0, 0, 26, 6);
  c.translate(0, -66); c.rotate(p.rot || 0); c.translate(0, 66);
  const legL = 40 - (p.tuck || 0) * 18;
  limb(-8, -44, -p.ll, legL, look.skin, 7, look.shoes); limb(8, -44, p.rl, legL, look.skin, 7, look.shoes);
  box(-17, -50, 34, 14, 5, look.shorts || dark(jersey, 0.25));
  limb(-18, -80, -p.la, 34, look.skin, 6.5); limb(18, -80, p.ra, 34, look.skin, 6.5);
  box(-20, -90, 40, 46, 12, jersey); c.fillStyle = light(jersey, 0.5); c.beginPath(); c.arc(0, -66, 6, 0, 6.283); c.fill();
  kidHead(look); if (extra) extra(); c.restore();
}
/** Illustrated go-kart seen from the side: shaded body with number disc, spoiler, steering wheel, driver in a helmet. */
export function kart(x: number, y: number, s: number, col: string, t = 0, num = '1', helmet = '#ffffff', look: KidLook = KID_DEFAULT) {
  c.save(); c.translate(x, y); c.scale(s, s); shadow(0, 2, 62, 7);
  box(-58, -30, 18, 10, 3, '#3d4a7a'); box(-62, -44, 8, 22, 3, dark(col, 0.2)); box(-70, -48, 26, 8, 3, col);
  shape([-54, -10, -48, -34, 18, -36, 48, -26, 60, -14, 56, -4, -50, -4], col);
  c.save(); c.globalAlpha *= 0.5; c.fillStyle = '#fff'; c.beginPath(); c.ellipse(-6, -30, 30, 3, 0, 0, 6.283); c.fill(); c.restore();
  ball(10, -20, 11, '#ffffff'); label(num, 10, -19, 13, INK);
  box(40, -10, 24, 8, 4, '#3d4a7a');
  c.lineWidth = 6; c.strokeStyle = INK; c.beginPath(); c.moveTo(-6, -36); c.lineTo(10, -56); c.stroke();
  c.save(); c.scale(0.55, 0.55); c.translate(-30, 20); kidHead(look); c.restore();
  c.beginPath(); c.arc(-16.5, -40, 11.5, Math.PI * 1.02, Math.PI * 2.05); c.fillStyle = shade(helmet, -52, -40) as any; c.fill(); stroke(3);
  c.fillStyle = col; c.fillRect(-27, -45, 21, 3);
  ball(14, -58, 6, '#3d4a7a'); c.lineWidth = 4; c.strokeStyle = INK; c.beginPath(); c.moveTo(-8, -42); c.lineTo(12, -56); c.stroke();
  wheel(-40, -4, 15, t * 12); wheel(42, -4, 15, t * 12);
  c.restore();
}
/** Hockey puck: flat black disc with a top face, side band and shine. */
export function puck(x: number, y: number, r: number) {
  c.fillStyle = '#0d0b18'; c.beginPath(); c.ellipse(x, y + r * 0.22, r, r * 0.42, 0, 0, 6.283); c.fill(); c.fillRect(x - r, y - r * 0.05, r * 2, r * 0.27);
  c.beginPath(); c.ellipse(x, y, r, r * 0.42, 0, 0, 6.283); c.fillStyle = '#2b2740'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#000'; c.stroke();
  c.save(); c.globalAlpha *= 0.5; c.strokeStyle = '#fff'; c.lineWidth = Math.max(1.5, r * 0.12); c.beginPath(); c.ellipse(x - r * 0.15, y - r * 0.05, r * 0.55, r * 0.2, 0, 3.6, 4.9); c.stroke(); c.restore();
}
/** Hockey kid: helmet, jersey, gloves and a stick whose blade swings by `swing` (0 rest .. 1 follow-through). */
export function hockeyKid(x: number, y: number, s: number, jersey: string, swing = 0, look: KidLook = KID_DEFAULT) {
  const a = -0.5 + swing * 1.3;
  figure(x, y, s, jersey, { la: 0.7 + swing * 0.6, ra: -0.2 + swing * 0.6, ll: 0.25, rl: 0.25 }, look, () => {
    c.beginPath(); c.arc(0, -110, 19, Math.PI * 1.0, Math.PI * 2.0); c.fillStyle = shade('#1fb6ff', -130, -110) as any; c.fill(); stroke(3); c.fillStyle = '#fff'; c.fillRect(-19, -112, 38, 4);
    c.save(); c.translate(20, -60); c.rotate(a); box(-3, 0, 7, 64, 3, '#c98a4b'); box(-3, 58, 26, 9, 4, '#1d1427'); box(-6, -4, 14, 14, 5, jersey); c.restore();
  });
}
