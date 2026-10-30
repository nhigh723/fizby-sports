// Mini-golf (top-down): pull back and let go to putt. Teaches force (pull more = rolls farther) and angles (bank shots off walls).
// L1 (and some remixes): a sliding gate patrols across the course; wait for the gap, then putt (timing + planning).
// L0 short straight - L1 long diagonal - L2 block in the middle: bounce off the right wall - L3 bounce off the left wall - L4 small far hole + block. 2 holes per level. 5+: remixes.
import { type Ctx, W, rr, band } from '../art';
import { ball } from '../sports';
import { L } from '../lines';
import type { Activity, Api, Pt } from '../kit';
const X0 = 40, X1 = 350, Y0 = 150, Y1 = 790, FR = 520, K = 5.2, MAXP = 200, BR = 12;
type Course = { b: [number, number]; h: [number, number]; bar: [number, number, number] | null; bank: 0 | 1 | -1; hr: number };
function course(lv: number, rnd: () => number): Course {
  if (lv === 0) return { b: [195, 680], h: [195, 420], bar: null, bank: 0, hr: 26 };
  if (lv === 1) return { b: [110, 700], h: [290, 260], bar: null, bank: 0, hr: 24 };
  if (lv === 2) return { b: [195, 700], h: [195, 230], bar: [110, 280, 430], bank: 1, hr: 24 };
  if (lv === 3) return { b: [195, 700], h: [195, 230], bar: [110, 280, 430], bank: -1, hr: 24 };
  if (lv === 4) return { b: [140, 720], h: [250, 200], bar: [50, 230, 450], bank: 1, hr: 20 };
  return course(Math.floor(rnd() * 5), rnd);
}
export function golf(api: Api, level: number, hockey = false): Activity {
  const rnd = Math.random; let C = course(level, rnd), holes = 0; const need = 2;
  let bx = C.b[0], by = C.b[1], vx = 0, vy = 0, roll = false, pull: Pt | null = null, cur: Pt | null = null, sink = -1, done = false, tries = 0, minD = 1e9;
  const gateMode = !hockey && (level === 1 || (level >= 5 && rnd() < 0.5)); let gT = 0; const gate = () => { if (!gateMode || C.bar) return null; const gy = (C.b[1] + C.h[1]) / 2; return { x: 195 + Math.sin(gT * 1.3) * 120, y: gy }; };
  const reset = () => { bx = C.b[0]; by = C.b[1]; vx = vy = 0; roll = false; };
  const pullOf = (p: Pt) => { let dx = p.x - pull!.x, dy = p.y - pull!.y; const d = Math.hypot(dx, dy); if (d > MAXP) { dx *= MAXP / d; dy *= MAXP / d; } return { dx, dy }; };
  return {
    intro: C.bank ? L.golfBank : L.golfGo,
    update(dt) { gT += dt; if (sink >= 0) { sink += dt; if (sink > 1.2) { sink = -1; holes++; if (holes >= need) { done = true; api.win(hockey ? L.goal : L.holeIn); } else { C = course(level >= 5 ? 9 : level, rnd); tries = 0; reset(); } } return; }
      if (!roll) return; const steps = 4; for (let s = 0; s < steps; s++) { const h = dt / steps, sp = Math.hypot(vx, vy); if (sp < 8) { roll = false; break; } const dec = Math.min(sp, FR * h); vx -= vx / sp * dec; vy -= vy / sp * dec; bx += vx * h; by += vy * h;
        if (bx < X0 + BR) { bx = X0 + BR; vx = Math.abs(vx); api.sfx.tap(); } if (bx > X1 - BR) { bx = X1 - BR; vx = -Math.abs(vx); api.sfx.tap(); } if (by < Y0 + BR) { by = Y0 + BR; vy = Math.abs(vy); api.sfx.tap(); } if (by > Y1 - BR) { by = Y1 - BR; vy = -Math.abs(vy); }
        if (C.bar) { const [a, b, y] = C.bar; if (bx > a - BR && bx < b + BR && Math.abs(by - y) < 10 + BR) { if (Math.abs(by - y) > 10) { vy = -vy; by = y + Math.sign(by - y) * (10 + BR); } else { vx = -vx; } api.sfx.thud(); } }
        { const g = gate(); if (g && bx > g.x - 34 - BR && bx < g.x + 34 + BR && Math.abs(by - g.y) < 12 + BR) { vy = -vy; by = g.y + Math.sign(by - g.y || 1) * (12 + BR); api.sfx.boing(); } }
        const d = Math.hypot(bx - C.h[0], by - C.h[1]); minD = Math.min(minD, d); if (d < C.hr - 4 + (hockey ? 10 : 0) + Math.min(18, tries * 6) && (hockey || Math.hypot(vx, vy) < 700)) { roll = false; sink = 0; bx = C.h[0]; by = C.h[1]; api.sfx.pop(); api.sfx.cheer(); api.burst(bx, by, 24); api.say(hockey ? L.goal : L.holeIn); return; } }
      if (!roll && sink < 0) { tries++; const far = Math.hypot(bx - C.b[0], by - C.b[1]) > Math.hypot(C.h[0] - C.b[0], C.h[1] - C.b[1]) + 40; api.say(far ? L.golfLess : minD < 80 ? L.golfMore : (C.bank ? L.golfBank : L.golfMore)); setTimeout(() => { if (!roll && sink < 0) reset(); }, 700); } },
    draw(c: Ctx) { const t = api.t(); c.fillStyle = hockey ? '#1fb6ff' : '#ff9f1c'; band(c, 0, 844); c.fillStyle = hockey ? '#e8f6ff' : '#5fd83a'; rr(c, X0, Y0, X1 - X0, Y1 - Y0, 20); c.fill();
      c.strokeStyle = hockey ? '#ff3b6b' : '#fff'; c.lineWidth = 8; rr(c, X0, Y0, X1 - X0, Y1 - Y0, 20); c.stroke();
      if (C.bar) { const [a, b, y] = C.bar; c.fillStyle = hockey ? '#9b5cff' : '#b07a3a'; rr(c, a, y - 10, b - a, 20, 8); c.fill(); }
      if (C.bank && !roll && sink < 0) { const wx = C.bank > 0 ? X1 - 14 : X0 + 14, a = Math.sin(t * 5) * 0.5 + 0.5; c.globalAlpha = a; c.fillStyle = '#ffd60a'; c.beginPath(); c.arc(wx, (C.b[1] + C.h[1]) / 2 + 10, 12, 0, 6.28); c.fill(); c.globalAlpha = 1; }
      if (hockey) { const [hx, hy] = C.h; c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(hx - 34, hy - 30, 68, 34); c.strokeStyle = '#ff3b6b'; c.lineWidth = 7; c.beginPath(); c.moveTo(hx - 34, hy + 6); c.lineTo(hx - 34, hy - 30); c.lineTo(hx + 34, hy - 30); c.lineTo(hx + 34, hy + 6); c.stroke(); c.strokeStyle = 'rgba(255,59,107,0.4)'; c.lineWidth = 2; for (let k = -30; k <= 30; k += 10) { c.beginPath(); c.moveTo(hx + k, hy - 30); c.lineTo(hx + k, hy + 4); c.stroke(); } } else { c.fillStyle = '#2b2140'; c.beginPath(); c.arc(C.h[0], C.h[1], C.hr, 0, 6.28); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.moveTo(C.h[0], C.h[1]); c.lineTo(C.h[0], C.h[1] - 70); c.stroke(); c.fillStyle = '#ff3b6b'; c.beginPath(); c.moveTo(C.h[0], C.h[1] - 70); c.lineTo(C.h[0] + 34 + Math.sin(t * 4) * 3, C.h[1] - 60); c.lineTo(C.h[0], C.h[1] - 50); c.fill(); }
      { const g = gate(); if (g) { c.fillStyle = '#ff3b6b'; rr(c, g.x - 34, g.y - 12, 68, 24, 10); c.fill(); c.fillStyle = '#fff'; for (let k = -2; k <= 2; k++) c.fillRect(g.x + k * 13 - 3, g.y - 12, 6, 24); c.strokeStyle = '#2b2140'; c.lineWidth = 3; rr(c, g.x - 34, g.y - 12, 68, 24, 10); c.stroke(); c.fillStyle = '#8a93bb'; c.fillRect(X0, g.y - 2, X1 - X0, 4); } }
      if (pull && cur) { const { dx, dy } = pullOf(cur); c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 6; c.setLineDash([3, 12]); c.beginPath(); c.moveTo(bx, by); c.lineTo(bx - dx * 1.6, by - dy * 1.6); c.stroke(); c.setLineDash([]); }
      for (let i = 0; i < need; i++) { c.fillStyle = i < holes ? '#ffd60a' : 'rgba(255,255,255,0.5)'; c.beginPath(); c.arc(170 + i * 50, 815, 10, 0, 6.28); c.fill(); }
      if (sink < 0 || sink < 0.3) ball(c, hockey ? 'hockey' : 'golf', bx, by, BR * (sink > 0 ? 1 - sink * 2 : 1) * (hockey ? 1.6 : 1), 0); void tries; },
    down(p: Pt) { if (roll || sink >= 0 || done) return; if (Math.hypot(p.x - bx, p.y - by) < 70) { pull = { x: p.x, y: p.y }; cur = { ...pull }; } },
    move(p: Pt) { if (pull) cur = { x: p.x, y: p.y }; },
    up(p: Pt) { if (!pull) return; const { dx, dy } = pullOf(p); pull = cur = null; if (Math.hypot(dx, dy) < 15) return; vx = -dx * K; vy = -dy * K; roll = true; minD = 1e9; api.sfx.thud(); },
    next() { if (roll || sink >= 0 || done) return null; let tx = C.h[0]; const ty = C.h[1];
      if (C.bank > 0) tx = 2 * (X1 - BR) - tx; if (C.bank < 0) tx = 2 * (X0 + BR) - tx;
      const dx = tx - bx, dy = ty - by, d = Math.hypot(dx, dy), v = Math.sqrt(2 * FR * d) + 60, pl = Math.min(MAXP, v / K);
      { const g = gate(); if (g) { const u = (g.y - by) / (ty - by), lx = bx + (tx - bx) * u, tArr = Math.abs(g.y - by) / Math.max(200, v * 0.8), fx = 195 + Math.sin((gT + tArr + 0.25) * 1.3) * 120, nx = 195 + Math.sin((gT + 0.25) * 1.3) * 120; if (Math.abs(fx - lx) < 75 || Math.abs(nx - lx) < 60) return { type: 'wait', ms: 120 }; } }
      return { type: 'drag', path: [[bx, by], [bx - dx / d * pl * 0.5, by - dy / d * pl * 0.5], [bx - dx / d * pl, by - dy / d * pl]] }; },
    busy: () => roll || sink >= 0 || done,
  };
}
