// Hockey (ice rink): flick the puck into the net. Ice is slippery and the boards bounce. Teaches aim, passing then shooting (sequencing), bank angles, counting.
// L0 big net - L1 goalie pal - L2 faster goalie - L3 pass to your teammate, then shoot - L4 a big snowman blocks the middle: bounce it off the boards. 3 goals. 5+: remixes.
import { type Ctx, W, rr } from '../art';
import { ball, keeper } from '../sports';
import { L, NUM } from '../lines';
import type { Activity, Api, Pt } from '../kit';
import { near } from '../kit';
const X0 = 30, X1 = 360, NY = 230, SP = 950, PR = 16, START = { x: 195, y: 700 };
export function hockey(api: Api, level: number): Activity {
  const rnd = Math.random, remix = level >= 5, mode = remix ? 1 + Math.floor(rnd() * 4) : level, need = 3;
  const goalie = mode === 1 || mode === 2 || mode === 3, gsp = mode === 2 ? 2.2 : 1.4, block = mode === 4, pass = mode === 3, nw = mode === 0 ? 170 : 130;
  let px = START.x, py = START.y, vx = 0, vy = 0, slide = false, gx = 195, goals = 0, done = false, cheer = -1, back = -1, start: Pt | null = null, mate = { x: rnd() < 0.5 ? 90 : 300, y: 520 }, hasPass = false, spin = 0;
  const home = () => pass && hasPass ? { x: mate.x, y: mate.y - 30 } : START;
  const reset = () => { const h = pass && !hasPass ? START : home(); px = h.x; py = h.y; vx = vy = 0; slide = false; };
  return {
    intro: pass ? L.hockeyPass : block ? L.hockeyBank : L.hockeyGo,
    update(dt) { const t = api.t(); if (goalie) gx = 195 + Math.sin(t * gsp) * nw * 0.2;
      if (cheer >= 0) { cheer += dt; if (cheer > 1.3) { cheer = -1; hasPass = false; mate.x = rnd() < 0.5 ? 90 : 300; reset(); if (goals >= need) { done = true; api.win(L.goal); } } return; }
      if (back >= 0) { back += dt; if (back > 0.8) { back = -1; reset(); } return; }
      if (!slide) return; const ppy = py; px += vx * dt; py += vy * dt; spin += dt * 9; vx *= 0.995; vy *= 0.995;
      if (px < X0 + PR) { px = X0 + PR; vx = Math.abs(vx); api.sfx.tap(); } if (px > X1 - PR) { px = X1 - PR; vx = -Math.abs(vx); api.sfx.tap(); }
      if (block && Math.hypot(px - 195, py - 420) < 50 + PR) { slide = false; back = 0; api.sfx.boing(); api.say(L.hockeyBank); return; }
      if (pass && !hasPass && Math.hypot(px - mate.x, py - mate.y) < 50) { slide = false; hasPass = true; api.sfx.snap(); api.say(L.hockeyShoot); px = mate.x; py = mate.y - 30; return; }
      if (ppy > NY && py <= NY) { if (pass && !hasPass) { slide = false; back = 0; api.say(L.hockeyPass); return; }
        if (Math.abs(px - 195) < nw / 2 - 8 && !(goalie && Math.abs(px - gx) < 34)) { slide = false; cheer = 0; goals++; py = NY - 20; api.sfx.cheer(); api.burst(px, NY - 20, 26); api.say(NUM[goals - 1]); }
        else { slide = false; back = 0; api.sfx.thud(); api.say(goalie && Math.abs(px - gx) < 34 ? L.saved : L.soClose); } }
      if (py > 860 || py < 100) { slide = false; back = 0; } },
    draw(c: Ctx) { const t = api.t(); c.fillStyle = '#1f7ae0'; c.fillRect(0, 0, W, 844); const g = c.createLinearGradient(0, 120, 0, 800); g.addColorStop(0, '#f4fbff'); g.addColorStop(1, '#d6efff'); c.fillStyle = g; rr(c, X0, 120, X1 - X0, 680, 60); c.fill();
      c.strokeStyle = '#ffd60a'; c.lineWidth = 8; rr(c, X0, 120, X1 - X0, 680, 60); c.stroke();
      c.strokeStyle = 'rgba(255,59,107,0.6)'; c.lineWidth = 5; c.beginPath(); c.moveTo(X0, 460); c.lineTo(X1, 460); c.stroke(); c.strokeStyle = 'rgba(31,182,255,0.6)'; c.beginPath(); c.arc(195, 460, 60, 0, 6.28); c.stroke();
      for (let i = 0; i < 8; i++) { c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 2; const sx = (i * 53 + t * 10) % 330 + X0, sy = 150 + (i * 97) % 620; c.beginPath(); c.moveTo(sx - 8, sy); c.lineTo(sx + 8, sy - 3); c.stroke(); }
      c.fillStyle = 'rgba(255,59,107,0.15)'; c.fillRect(195 - nw / 2, NY - 50, nw, 50); c.strokeStyle = '#ff3b6b'; c.lineWidth = 8; c.beginPath(); c.moveTo(195 - nw / 2, NY); c.lineTo(195 - nw / 2, NY - 50); c.lineTo(195 + nw / 2, NY - 50); c.lineTo(195 + nw / 2, NY); c.stroke();
      c.strokeStyle = 'rgba(255,59,107,0.35)'; c.lineWidth = 2; for (let k = -nw / 2 + 12; k < nw / 2; k += 12) { c.beginPath(); c.moveTo(195 + k, NY - 50); c.lineTo(195 + k, NY); c.stroke(); }
      if (goalie) keeper(c, gx, NY - 6, t, '#9b5cff');
      if (block) { c.fillStyle = '#fff'; c.beginPath(); c.arc(195, 440, 40, 0, 6.28); c.arc(195, 385, 28, 0, 6.28); c.fill(); c.strokeStyle = '#cfe6f7'; c.lineWidth = 3; c.stroke(); c.fillStyle = '#2b2140'; c.beginPath(); c.arc(186, 380, 3.5, 0, 6.28); c.arc(204, 380, 3.5, 0, 6.28); c.fill(); c.fillStyle = '#ff9f1c'; c.beginPath(); c.moveTo(195, 386); c.lineTo(214, 390); c.lineTo(195, 394); c.fill(); c.fillStyle = '#ff3b6b'; c.fillRect(170, 408, 50, 8);
        const a = Math.sin(t * 5) * 0.4 + 0.6; c.globalAlpha = a; c.fillStyle = '#ffd60a'; for (const wx of [X0 + 8, X1 - 8]) { c.beginPath(); c.arc(wx, 480, 10, 0, 6.28); c.fill(); } c.globalAlpha = 1; }
      if (pass) { c.save(); c.translate(mate.x, mate.y); c.fillStyle = hasPass ? '#ffd60a' : '#3ddc4a'; c.beginPath(); c.arc(0, 0, 30, 0, 6.28); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(-9, -6, 7, 0, 6.28); c.arc(9, -6, 7, 0, 6.28); c.fill(); c.fillStyle = '#2b2140'; c.beginPath(); c.arc(-8, -5, 3, 0, 6.28); c.arc(10, -5, 3, 0, 6.28); c.fill(); c.strokeStyle = '#8a5a2a'; c.lineWidth = 6; c.beginPath(); c.moveTo(22, -10); c.lineTo(30, 30); c.lineTo(44, 30); c.stroke(); c.restore();
        if (!hasPass && !slide) { c.strokeStyle = 'rgba(61,220,74,0.8)'; c.lineWidth = 5; c.setLineDash([3, 12]); c.beginPath(); c.moveTo(START.x, START.y); c.lineTo(mate.x, mate.y); c.stroke(); c.setLineDash([]); } }
      for (let i = 0; i < need; i++) { c.globalAlpha = i < goals ? 1 : 0.35; ball(c, 'hockey', W / 2 + (i - 1) * 44, 822, 14); c.globalAlpha = 1; }
      ball(c, 'hockey', px, py, PR * 1.5, spin); },
    down(p: Pt) { if (slide || cheer >= 0 || back >= 0 || done) return; if (near(p, px, py, 70)) start = { x: p.x, y: p.y }; },
    move() { /* */ },
    up(p: Pt) { if (!start) return; const dx = p.x - start.x, dy = p.y - start.y, d = Math.hypot(dx, dy); start = null; if (d < 25 || dy > -5) return; vx = dx / d * SP; vy = dy / d * SP; slide = true; api.sfx.whoosh(); },
    next() { if (slide || cheer >= 0 || back >= 0 || done) return null; let tx = 195, ty = NY;
      if (pass && !hasPass) { tx = mate.x; ty = mate.y; }
      else if (block) { tx = 2 * (X1 - PR) - 195; } else if (goalie) tx = 195 + (gx < 195 ? 1 : -1) * nw * 0.32;
      const dx = tx - px, dy = ty - py, d = Math.hypot(dx, dy), k = 120 / d; return { type: 'drag', path: [[px, py], [px + dx * k * 0.5, py + dy * k * 0.5], [px + dx * k, py + dy * k]] }; },
    busy: () => slide || cheer >= 0 || back >= 0 || done,
  };
}
