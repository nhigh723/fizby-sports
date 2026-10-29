// Bowling: swipe the ball up the lane. Fizby counts every pin that falls. Teaches counting (to 10), aim, left/right.
// L0 3 pins - L1 6 pins - L2 10 pins - L3 10 pins, narrow lane - L4 pins sit left or right. Each level: 2 racks. 5+: remixes.
import { type Ctx, W } from '../art';
import { ball, pin } from '../sports';
import { L, NUM } from '../lines';
import type { Activity, Api, Pt } from '../kit';
import { near } from '../kit';
const B = { x: 195, y: 740 }, BR = 24, PR = 13, SPEED = 800;
type Pin = { x: number; y: number; down: boolean; rot: number; vx: number; vy: number; counted: boolean };
function rack(n: number, cx: number): Pin[] { const ps: Pin[] = []; let row = 0; while (ps.length < n) { for (let k = 0; k <= row && ps.length < n; k++) ps.push({ x: cx + (k - row / 2) * 36, y: 280 - row * 34, down: false, rot: 0, vx: 0, vy: 0, counted: false }); row++; } return ps; }
export function bowl(api: Api, level: number): Activity {
  const remix = level >= 5, rnd = Math.random, sides = level === 4 || (remix && rnd() < 0.5);
  const N = remix ? [3, 6, 10][Math.floor(rnd() * 3)] : [3, 6, 10, 10, 6][level], LW = level === 3 ? 150 : 200, racks = 2;
  let side = 0, pins: Pin[] = [];
  const newRack = () => { side = rnd() < 0.5 ? -1 : 1; pins = rack(N, sides ? 195 + side * 45 : 195); if (sides) api.say(side < 0 ? L.bowlLeft : L.bowlRight); };
  let bx = B.x, by = B.y, vx = 0, vy = 0, roll = false, start: Pt | null = null, countQ: number[] = [], countT = 0, after = -1, cleared = 0, done = false, spin = 0, gutter = false;
  side = rnd() < 0.5 ? -1 : 1; pins = rack(N, sides ? 195 + side * 45 : 195); if (sides) setTimeout(() => api.say(side < 0 ? L.bowlLeft : L.bowlRight), 2600);
  const lx0 = 195 - LW / 2, lx1 = 195 + LW / 2;
  const reset = () => { bx = B.x; by = B.y; vx = vy = 0; roll = false; gutter = false; };
  return {
    intro: L.bowlGo,
    update(dt) { spin += dt * (roll ? 10 : 0);
      if (roll) { bx += vx * dt; by += vy * dt; if (!gutter && (bx < lx0 + 6 || bx > lx1 - 6)) { gutter = true; vx = 0; bx = bx < 195 ? lx0 - 14 : lx1 + 14; api.sfx.thud(); }
        for (const p of pins) if (!p.down && !gutter && Math.hypot(p.x - bx, p.y - by) < BR + PR) { p.down = true; p.vx = (p.x - bx) * 6 + vx * 0.3; p.vy = -260; api.sfx.crash(); }
        if (by < 150) { roll = false; after = 0; countQ = []; pins.forEach((p, i) => { if (p.down && !p.counted) { p.counted = true; countQ.push(i); } }); if (!countQ.length) api.say(L.gutter); countT = 0.2; } }
      for (const p of pins) if (p.down) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.92; p.vy *= 0.9; p.rot = Math.min(1.5, p.rot + dt * 8);
        for (const q of pins) if (!q.down && Math.hypot(q.x - p.x, q.y - p.y) < 2 * PR + 4) { q.down = true; q.vx = (q.x - p.x) * 5; q.vy = -200; } }
      if (after >= 0) { after += dt; countT -= dt;
        if (countT <= 0 && countQ.length) { const done2 = pins.filter(p => p.counted).length - countQ.length + 1; countQ.shift(); api.say(NUM[Math.min(9, done2 - 1)]); api.sfx.pop(); countT = 0.6; }
        if (!countQ.length && countT <= -0.4) { after = -1; reset(); if (pins.every(p => p.down)) { cleared++; api.burst(195, 260, 30); if (cleared >= racks) { done = true; api.win(L.allDown); } else { api.say(L.allDown); api.sfx.cheer(); if (sides) newRack(); else pins = rack(N, 195); } } } } },
    draw(c: Ctx) { c.fillStyle = '#9b5cff'; c.fillRect(0, 0, W, 844); c.fillStyle = '#6b2fd6'; c.fillRect(lx0 - 30, 100, LW + 60, 744);
      const g = c.createLinearGradient(0, 100, 0, 844); g.addColorStop(0, '#ffd99a'); g.addColorStop(1, '#ffb35a'); c.fillStyle = g; c.fillRect(lx0, 100, LW, 744);
      c.strokeStyle = 'rgba(160,90,30,0.3)'; c.lineWidth = 2; for (let x = lx0 + 20; x < lx1; x += 20) { c.beginPath(); c.moveTo(x, 100); c.lineTo(x, 844); c.stroke(); }
      for (let k = -2; k <= 2; k++) { c.fillStyle = '#ff3b6b'; c.beginPath(); c.moveTo(195 + k * 28, 560); c.lineTo(189 + k * 28, 575); c.lineTo(201 + k * 28, 575); c.fill(); }
      if (sides && pins.length) { const a = api.t() % 1 < 0.5 ? 1 : 0.5; c.globalAlpha = a; c.fillStyle = '#ffd60a'; const ax = 195 + side * 90; c.beginPath(); c.moveTo(ax + side * 26, 420); c.lineTo(ax - side * 6, 400); c.lineTo(ax - side * 6, 440); c.fill(); c.globalAlpha = 1; }
      const ps = [...pins].sort((a, b) => a.y - b.y); for (const p of ps) pin(c, p.x, p.y, 1, p.down ? p.rot * Math.sign(p.vx || 1) : 0, p.counted ? '#ffd60a' : '#ff3b6b');
      for (let i = 0; i < racks; i++) { c.globalAlpha = i < cleared ? 1 : 0.35; pin(c, 30 + i * 30, 820, 0.6); c.globalAlpha = 1; }
      ball(c, 'bowl', bx, by, BR * (roll ? Math.max(0.6, 0.6 + (by - 150) / (B.y - 150) * 0.4) : 1), spin); },
    down(p: Pt) { if (roll || after >= 0 || done) return; if (near(p, bx, by, 70)) start = { x: p.x, y: p.y }; },
    move() { /* */ },
    up(p: Pt) { if (!start) return; const dx = p.x - start.x, dy = p.y - start.y, d = Math.hypot(dx, dy); start = null; if (d < 25 || dy > -10) return; vx = dx / d * SPEED; vy = dy / d * SPEED; roll = true; api.sfx.roll(); },
    next() { if (roll || after >= 0 || done) return null; const up = pins.filter(p => !p.down); if (!up.length) return null; const t = up.sort((a, b) => b.y - a.y)[0];
      const dx = t.x - B.x, dy = t.y - B.y, d = Math.hypot(dx, dy), k = 130 / d; return { type: 'drag', path: [[B.x, B.y], [B.x + dx * k * 0.5, B.y + dy * k * 0.5], [B.x + dx * k, B.y + dy * k]] }; },
    busy: () => roll || after >= 0 || done,
  };
}
