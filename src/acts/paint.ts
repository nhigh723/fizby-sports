// Sports Day Paint Studio: colour sports pictures. Pick a paint pot, tap a part to fill it. Teaches colour names, matching, fine motor.
// L0 medal (match the dots) - L1 ball - L2 trophy - L3 jersey - L4 flag; Fizby names the colour to find. 5+: remixes (any picture, new colours).
// Each level: when every part matches its dot, the picture is done (2 pictures per level).
import { type Ctx, W, rr, band } from '../art';
import { L, colorLine } from '../lines';
import type { Activity, Api, Pt } from '../kit';
const PAL = ['#ff3b6b', '#ff9f1c', '#ffd60a', '#3ddc4a', '#1fb6ff', '#9b5cff', '#ff5fd2'];
type Part = { path: Path2D; d: Pt; want: string; got: string | null };
type Pic = { parts: Part[]; deco: (c: Ctx, t: number) => void };
const pth = (f: (p: Path2D) => void) => { const p = new Path2D(); f(p); return p; };
const circ = (x: number, y: number, r: number) => pth(p => p.arc(x, y, r, 0, 6.283));
const poly = (...v: number[]) => pth(p => { p.moveTo(v[0], v[1]); for (let i = 2; i < v.length; i += 2) p.lineTo(v[i], v[i + 1]); p.closePath(); });
const rrp = (x: number, y: number, w: number, h: number, r: number) => pth(p => { p.moveTo(x + r, y); p.arcTo(x + w, y, x + w, y + h, r); p.arcTo(x + w, y + h, x, y + h, r); p.arcTo(x, y + h, x, y, r); p.arcTo(x, y, x + w, y, r); p.closePath(); });
const starP = (x: number, y: number, r: number) => { const v: number[] = []; for (let q = 0; q < 10; q++) { const rr2 = q % 2 ? r * 0.45 : r; v.push(x + Math.cos(-1.571 + q * 0.628) * rr2, y + Math.sin(-1.571 + q * 0.628) * rr2); } return poly(...v); };
const P = (path: Path2D, dx: number, dy: number): Part => ({ path, d: { x: dx, y: dy }, want: '', got: null });
const INKC = '#2b2140', line = (c: Ctx, w: number, f: () => void) => { c.strokeStyle = INKC; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); f(); c.stroke(); };
const PICS: (() => Pic)[] = [
  () => ({ parts: [P(poly(140, 150, 185, 150, 215, 330, 175, 340), 168, 220), P(poly(250, 150, 205, 150, 175, 330, 215, 340), 224, 220), P(circ(195, 420, 95), 195, 485), P(starP(195, 420, 52), 195, 420)],
    deco: (c, t) => { line(c, 4, () => { c.arc(195, 420, 72, 0, 6.28); }); c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.ellipse(150, 370, 18, 9, -0.6, 0, 6.28); c.fill(); for (let i = 0; i < 4; i++) { const a = t * 1.5 + i * 1.57; c.fillStyle = '#ffd60a'; c.beginPath(); c.arc(195 + Math.cos(a) * 125, 420 + Math.sin(a) * 125, 5, 0, 6.28); c.fill(); } } }), // medal
  () => ({ parts: [P(pth(p => { p.moveTo(30, 560); p.quadraticCurveTo(195, 470, 360, 560); p.lineTo(360, 670); p.lineTo(30, 670); p.closePath(); }), 80, 620), P(circ(300, 200, 45), 300, 200), P(circ(185, 400, 115), 120, 420), P(poly(185, 360, 222, 387, 208, 430, 162, 430, 148, 387), 185, 400)],
    deco: (c) => { line(c, 4, () => { for (const [x1, y1, x2, y2] of [[185, 360, 185, 288], [222, 387, 290, 365], [208, 430, 245, 495], [162, 430, 125, 495], [148, 387, 80, 365]]) { c.moveTo(x1, y1); c.lineTo(x2, y2); } }); line(c, 4, () => { for (let i = 0; i < 8; i++) { const a = i * 0.785; c.moveTo(300 + Math.cos(a) * 55, 200 + Math.sin(a) * 55); c.lineTo(300 + Math.cos(a) * 72, 200 + Math.sin(a) * 72); } });
      c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.ellipse(130, 335, 22, 10, -0.7, 0, 6.28); c.fill(); for (let i = 0; i < 9; i++) line(c, 3, () => { const x = 50 + i * 36; c.moveTo(x, 600); c.lineTo(x + 6, 585); }); } }), // ball on a sunny hill
  () => ({ parts: [P(pth(p => { p.moveTo(120, 180); p.lineTo(270, 180); p.quadraticCurveTo(270, 330, 195, 340); p.quadraticCurveTo(120, 330, 120, 180); p.closePath(); }), 195, 300), P(pth(p => { p.moveTo(122, 200); p.bezierCurveTo(60, 200, 60, 290, 140, 290); p.lineTo(144, 270); p.bezierCurveTo(88, 268, 88, 222, 124, 222); p.closePath(); }), 84, 240),
    P(pth(p => { p.moveTo(268, 200); p.bezierCurveTo(330, 200, 330, 290, 250, 290); p.lineTo(246, 270); p.bezierCurveTo(302, 268, 302, 222, 266, 222); p.closePath(); }), 306, 240), P(poly(178, 338, 212, 338, 222, 420, 168, 420), 195, 385), P(rrp(125, 420, 140, 60, 14), 195, 460), P(starP(195, 245, 34), 195, 247)],
    deco: (c) => { c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.ellipse(150, 230, 10, 34, 0.1, 0, 6.28); c.fill(); line(c, 4, () => { c.moveTo(140, 440); c.lineTo(250, 440); }); } }), // trophy
  () => ({ parts: [P(poly(130, 180, 170, 165, 220, 165, 260, 180, 330, 230, 300, 290, 265, 270, 265, 470, 125, 470, 125, 270, 90, 290, 60, 230), 150, 420), P(pth(p => { p.moveTo(170, 165); p.quadraticCurveTo(195, 205, 220, 165); p.closePath(); }), 195, 175),
    P(circ(195, 330, 50), 195, 330), P(rrp(125, 440, 140, 30, 6), 195, 455)],
    deco: (c) => { c.fillStyle = INKC; c.font = '900 56px ui-rounded, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('5', 195, 333); line(c, 3, () => { c.moveTo(103, 255); c.lineTo(120, 270); c.moveTo(287, 255); c.lineTo(270, 270); }); c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.ellipse(150, 230, 8, 30, 0, 0, 6.28); c.fill(); } }), // jersey
  () => ({ parts: [P(circ(300, 590, 40), 300, 590), P(pth(p => { p.moveTo(110, 170); p.bezierCurveTo(170, 140, 220, 210, 310, 175); p.lineTo(310, 285); p.bezierCurveTo(220, 320, 170, 250, 110, 280); p.closePath(); }), 150, 215), P(rrp(96, 160, 16, 470, 7), 104, 520),
    P(circ(104, 150, 16), 104, 150), P(pth(p => { p.moveTo(30, 630); p.lineTo(360, 630); p.lineTo(360, 670); p.lineTo(30, 670); p.closePath(); }), 220, 650)],
    deco: (c, t) => { c.save(); c.clip(PICS_FLAG); for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) if ((r + k) % 2) { c.fillStyle = 'rgba(43,33,64,0.16)'; c.fillRect(112 + k * 33, 165 + r * 32, 33, 32); } c.restore(); line(c, 3, () => { c.moveTo(270, 580); c.quadraticCurveTo(300, 610, 330, 580); }); c.fillStyle = INKC; c.beginPath(); c.arc(287, 578, 4, 0, 6.28); c.arc(313, 578, 4, 0, 6.28); c.fill(); void t; } }), // finish flag + happy sun
];
const PICS_FLAG = pth(p => { p.moveTo(110, 170); p.bezierCurveTo(170, 140, 220, 210, 310, 175); p.lineTo(310, 285); p.bezierCurveTo(220, 320, 170, 250, 110, 280); p.closePath(); });
let hc: CanvasRenderingContext2D | null = null;
export function paint(api: Api, level: number): Activity {
  const rnd = Math.random, need = 2; let pic = 0, deco: Pic['deco'] = () => {}, parts: Part[] = [], sel = -1, made = 0, done = false, cheer = -1;
  const make = () => { pic = level >= 5 ? Math.floor(rnd() * PICS.length) : (level + made) % PICS.length; const pc = PICS[pic](); parts = pc.parts; deco = pc.deco; const cs = [...PAL].sort(() => rnd() - 0.5); parts.forEach((p, i) => p.want = cs[i % cs.length]); if (level === 4 || level >= 5) api.say(colorLine(parts[0].want)); };
  make();
  const hit = (p: Part, q: Pt) => { hc = hc || document.createElement('canvas').getContext('2d'); return !!hc && hc.isPointInPath(p.path, q.x, q.y); };
  /** a point that really paints part p: inside it and not covered by a part drawn on top (also where the colour dot goes) */
  const spot = (p: Part): Pt => { const c0 = center(p), top = (q: Pt) => [...parts].reverse().find(o => hit(o, q)) === p; if (top(c0)) return c0;
    for (let k = 1; k < 60; k++) { const a = k * 2.4, r = 4 + k * 2.2, q = { x: c0.x + Math.cos(a) * r, y: c0.y + Math.sin(a) * r }; if (top(q)) return q; } return c0; };
  const center = (p: Part) => p.d;
  const pot = (i: number) => ({ x: 38 + i * 52, y: 760 });
  return {
    intro: level === 0 ? L.paintMatch : L.paintGo,
    update(dt) { if (cheer >= 0) { cheer += dt; if (cheer > 1.6) { cheer = -1; made++; if (made >= need) { done = true; api.win(L.paintDone); } else make(); } } },
    draw(c: Ctx) { const t = api.t(); c.fillStyle = '#fff6d6'; band(c, 0, 844); c.fillStyle = '#ffe9a8'; band(c, 690, 154); for (let i = 0; i < 9; i++) { c.fillStyle = PAL[i % 7]; c.globalAlpha = 0.25; c.beginPath(); c.arc(20 + i * 46, 100 + (i % 2) * 14, 10, 0, 6.28); c.fill(); c.globalAlpha = 1; } c.fillStyle = '#c98a4b'; c.fillRect(60, 650, 14, 70); c.fillRect(316, 650, 14, 70); c.fillStyle = '#fff'; rr(c, 30, 130, W - 60, 540, 24); c.fill(); c.strokeStyle = '#ffd27a'; c.lineWidth = 6; c.stroke();
      for (const p of parts) { c.fillStyle = p.got || '#ffffff'; c.fill(p.path); if (p.got) { c.save(); c.clip(p.path); const g = c.createLinearGradient(0, 130, 0, 670); g.addColorStop(0, 'rgba(255,255,255,0.28)'); g.addColorStop(1, 'rgba(43,33,64,0.18)'); c.fillStyle = g; c.fillRect(0, 130, W, 540); c.restore(); }
        c.strokeStyle = INKC; c.lineWidth = 6; c.lineJoin = 'round'; c.stroke(p.path); }
      deco(c, t);
      for (const p of parts) if (p.got !== p.want) { const q = spot(p); c.fillStyle = p.want; c.beginPath(); c.arc(q.x, q.y, 11 + Math.sin(t * 4) * 1.5, 0, 6.28); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 3; c.stroke(); }
      PAL.forEach((col, i) => { const b = pot(i), up = sel === i ? -14 : 0; const pg = c.createLinearGradient(b.x - 22, 0, b.x + 22, 0); pg.addColorStop(0, '#e9e4f2'); pg.addColorStop(1, '#a9a0bd'); c.fillStyle = pg; rr(c, b.x - 22, b.y - 6 + up, 44, 40, 10); c.fill(); c.strokeStyle = INKC; c.lineWidth = 3; c.stroke(); c.fillStyle = col; c.beginPath(); c.ellipse(b.x, b.y - 6 + up, 22, 12, 0, 0, 6.28); c.fill(); c.stroke(); c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.ellipse(b.x - 7, b.y - 9 + up, 7, 3, 0, 0, 6.28); c.fill(); c.fillStyle = col; c.beginPath(); c.ellipse(b.x + 12, b.y + 6 + up, 4, 9, 0, 0, 6.28); c.fill(); if (sel === i) { c.strokeStyle = '#2b2140'; c.lineWidth = 4; c.stroke(); } });
      for (let i = 0; i < need; i++) { c.fillStyle = i < made ? '#ffd60a' : 'rgba(43,33,64,0.15)'; c.beginPath(); c.arc(180 + i * 30, 825, 9, 0, 6.28); c.fill(); }
      if (sel >= 0) { c.fillStyle = PAL[sel]; c.beginPath(); c.arc(W - 40, 130, 16, 0, 6.28); c.fill(); } },
    down(q: Pt) { if (done || cheer >= 0) return; const pi = PAL.findIndex((_, i) => Math.hypot(q.x - pot(i).x, q.y - pot(i).y) < 28); if (pi >= 0) { sel = pi; api.sfx.pick(); return; }
      if (sel < 0) return; const ps = [...parts].reverse().find(p => hit(p, q)); if (!ps) return;
      ps.got = PAL[sel]; api.sfx.splash(); if (ps.got !== ps.want) { api.say(L.paintWrong, false); return; }
      if (parts.every(p => p.got === p.want)) { cheer = 0; api.sfx.cheer(); api.burst(195, 400, 40); } else { const nx = parts.find(p => p.got !== p.want); if (nx && (level === 4 || level >= 5)) api.say(colorLine(nx.want)); } },
    move() { /* */ }, up() { /* */ },
    next() { if (done || cheer >= 0) return null; const p = parts.find(p => p.got !== p.want); if (!p) return null; const i = PAL.indexOf(p.want); if (sel !== i) { const b = pot(i); return { type: 'tap', x: b.x, y: b.y }; } const q = spot(p); return { type: 'tap', x: q.x, y: q.y }; },
    busy: () => done || cheer >= 0,
  };
}
