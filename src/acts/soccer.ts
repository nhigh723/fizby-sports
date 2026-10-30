// Soccer: swipe the ball into the goal. Teaches aim/direction, counting goals, and left/right.
// L0 big goal - L1 smaller goal that moves each round - L2 keeper pal - L3 keeper + count 5 goals - L4 left/right goals. 5+: remixes.
import { type Ctx, W, band } from '../art';
import { ball, field, goal, keeper } from '../sports';
import { L, NUM } from '../lines';
import type { Activity, Api, Pt } from '../kit';
import { near } from '../kit';
const B = { x: 195, y: 700 }, GY = 330, BR = 24, SPEED = 1100;
export function soccer(api: Api, level: number): Activity {
  const remix = level >= 5, rnd = Math.random;
  const useKeeper = level === 2 || level === 3 || (remix && rnd() < 0.6), twoGoals = level === 4 || (remix && !useKeeper && rnd() < 0.6);
  const need = level === 3 ? 5 : remix ? 3 + Math.floor(rnd() * 2) : 3;
  let gw = level === 0 ? 280 : useKeeper ? 240 : 200, gx = 195, side = rnd() < 0.5 ? 0 : 1; // side: 0 left, 1 right (twoGoals)
  const goals = () => twoGoals ? [{ x: 100, w: 150 }, { x: 290, w: 150 }] : [{ x: gx, w: gw }];
  let bx = B.x, by = B.y, vx = 0, vy = 0, fly = false, back = -1, cheer = -1, scored = 0, start: Pt | null = null, kx = 195, done = false, spin = 0;
  const newRound = () => { if (level === 1 || (remix && !useKeeper && !twoGoals)) gx = 110 + rnd() * 170; if (twoGoals) { side = rnd() < 0.5 ? 0 : 1; api.say(side ? L.soccerRight : L.soccerLeft); } };
  if (level === 1) gx = 130 + rnd() * 130; if (twoGoals) setTimeout(() => api.say(side ? L.soccerRight : L.soccerLeft), 2600);
  const reset = () => { bx = B.x; by = B.y; vx = vy = 0; fly = false; };
  return {
    intro: twoGoals ? L.soccerGo : useKeeper ? L.soccerKeeper : level === 3 ? L.soccerCount : L.soccerGo,
    update(dt) { const t = api.t(); if (useKeeper) kx = gx + Math.sin(t * 1.6) * gw * 0.18;
      if (fly) { const py = by; bx += vx * dt; by += vy * dt; spin += dt * 12;
        if (py > GY && by <= GY) { const gs = goals(), hit = gs.findIndex(g => Math.abs(bx - g.x) < g.w / 2 - 14);
          if (hit < 0) { fly = false; back = 0; api.sfx.thud(); api.say(L.soClose); }
          else if (twoGoals && hit !== side) { fly = false; back = 0; api.sfx.wrong(); api.say(L.wrongSide); }
          else if (useKeeper && Math.abs(bx - kx) < 34) { fly = false; back = 0; api.sfx.boing(); api.say(L.saved); }
          else { fly = false; by = GY - 40; cheer = 0; scored++; api.sfx.cheer(); api.burst(bx, GY - 50, 26); api.say(need > 3 || level === 3 ? NUM[scored - 1] : [L.goal, L.yes, L.great][scored % 3]); } }
        if (bx < -40 || bx > W + 40 || by < -40) { fly = false; back = 0; api.say(L.soClose); } }
      if (back >= 0) { back += dt; if (back > 0.9) { back = -1; reset(); } }
      if (cheer >= 0) { cheer += dt; if (cheer > 1.3) { cheer = -1; reset(); if (scored >= need) { done = true; api.win(L.goal); } else newRound(); } } },
    draw(c: Ctx) { const t = api.t(); c.fillStyle = '#7fe3f5'; band(c, 0, 240); field(c, 200, '#3ddc4a');
      c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 5; c.beginPath(); c.arc(195, 760, 90, 0, 6.28); c.stroke(); c.beginPath(); c.moveTo(0, GY + 4); c.lineTo(W, GY + 4); c.stroke();
      goals().forEach((g, i) => goal(c, g.x, GY, g.w, 110, twoGoals ? (i === side ? '#ffd60a' : '#ffffff') : '#ffffff'));
      if (twoGoals) { const g = goals()[side], a = Math.sin(t * 6) * 6; c.fillStyle = '#ffd60a'; c.beginPath(); c.moveTo(g.x, GY - 120 + a); c.lineTo(g.x - 16, GY - 146 + a); c.lineTo(g.x + 16, GY - 146 + a); c.fill(); }
      if (useKeeper) keeper(c, kx, GY - 34, t);
      for (let i = 0; i < need; i++) { const x = W / 2 + (i - (need - 1) / 2) * 44; c.globalAlpha = i < scored ? 1 : 0.35; ball(c, 'soccer', x, 800, 15); c.globalAlpha = 1; }
      if (start && !fly) { c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 6; c.setLineDash([3, 12]); c.beginPath(); c.moveTo(B.x, B.y); c.lineTo(start.x + (B.x - start.x), start.y); c.stroke(); c.setLineDash([]); }
      ball(c, 'soccer', bx, by, BR * (fly ? Math.max(0.6, 0.6 + (by - GY) / (B.y - GY) * 0.4) : 1), spin); },
    down(p: Pt) { if (fly || back >= 0 || cheer >= 0 || done) return; if (near(p, bx, by, 70)) start = { x: p.x, y: p.y }; },
    move() { /* */ },
    up(p: Pt) { if (!start) return; const dx = p.x - start.x, dy = p.y - start.y, d = Math.hypot(dx, dy); start = null;
      if (d < 25 || dy > -10) return; vx = dx / d * SPEED; vy = dy / d * SPEED; fly = true; api.sfx.thud(); },
    next() { if (fly || back >= 0 || cheer >= 0 || done) return null; let ax = goals()[twoGoals ? side : 0].x;
      if (useKeeper) ax = gx + (kx < gx ? 1 : -1) * gw * 0.36;
      const dx = ax - B.x, dy = GY - B.y, d = Math.hypot(dx, dy), k = 130 / d; return { type: 'drag', path: [[B.x, B.y], [B.x + dx * k * 0.5, B.y + dy * k * 0.5], [B.x + dx * k, B.y + dy * k]] }; },
    busy: () => fly || back >= 0 || cheer >= 0 || done,
  };
}
