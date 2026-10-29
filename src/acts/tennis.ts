// Tennis: a friendly pal hits the ball over the net; tap the ball when it reaches your glowing zone to hit it back. Teaches timing, tracking, counting the rally, left/right.
// L0 slow, middle - L1 a bit faster, either side - L2 faster - L3 count a rally of 5 - L4 Fizby says which side it is coming to. 5+: remixes.
import { type Ctx, W } from '../art';
import { ball, keeper } from '../sports';
import { L, NUM } from '../lines';
import type { Activity, Api, Pt } from '../kit';
const ZY0 = 560, ZY1 = 720, NET = 400;
export function tennis(api: Api, level: number): Activity {
  const remix = level >= 5, rnd = Math.random, speed = [300, 360, 430, 360, 380][level] ?? 340 + rnd() * 100, need = level === 3 ? 5 : 3, sides = level >= 1, call = level === 4 || (remix && rnd() < 0.5);
  let bx = 195, by = 200, vx = 0, vy = 0, z = 0, phase: 'wait' | 'in' | 'out' | 'miss' = 'wait', wt = 2.8, hits = 0, done = false, px = 195, swing = 0, tx = 195;
  const serve = () => { tx = sides ? [110, 195, 280][Math.floor(rnd() * 3)] : 195; bx = px; by = 200; const T = (ZY0 + 60 - by) / speed; vx = (tx - bx) / T; vy = speed; phase = 'in'; api.sfx.thud(); if (call && tx !== 195) api.say(tx < 195 ? L.left : L.right); };
  return {
    intro: L.tennisGo,
    update(dt) { const t = api.t(); swing = Math.max(0, swing - dt * 4); px += ((phase === 'out' ? tx : 195) - px) * Math.min(1, dt * 2);
      if (phase === 'wait') { wt -= dt; if (wt <= 0) serve(); }
      else if (phase === 'in' || phase === 'out') { bx += vx * dt; by += vy * dt; z = Math.abs(Math.sin((by - 200) / 520 * Math.PI)) * 60;
        if (phase === 'in' && by > ZY1 + 40) { phase = 'miss'; wt = 1; api.say(L.tennisMiss, false); }
        if (phase === 'out' && by < 210) { phase = 'wait'; wt = 0.5; if (hits >= need) { done = true; api.win(L.rally); } } }
      else if (phase === 'miss') { wt -= dt; if (wt <= 0) { phase = 'wait'; wt = 0.6; } } void t; },
    draw(c: Ctx) { const t = api.t(); c.fillStyle = '#1fb6ff'; c.fillRect(0, 0, W, 844); c.fillStyle = '#3ddc4a'; c.beginPath(); c.moveTo(70, 160); c.lineTo(320, 160); c.lineTo(375, 800); c.lineTo(15, 800); c.fill();
      c.strokeStyle = '#fff'; c.lineWidth = 5; c.beginPath(); c.moveTo(70, 160); c.lineTo(320, 160); c.lineTo(375, 800); c.lineTo(15, 800); c.closePath(); c.moveTo(195, 160); c.lineTo(195, 800); c.stroke();
      keeper(c, px, 175, t, '#ff9f1c');
      c.fillStyle = 'rgba(255,255,255,0.85)'; c.fillRect(30, NET - 4, 330, 26); c.strokeStyle = '#2b2140'; c.lineWidth = 1; for (let x = 30; x < 360; x += 10) { c.beginPath(); c.moveTo(x, NET - 4); c.lineTo(x, NET + 22); c.stroke(); } c.fillStyle = '#fff'; c.fillRect(30, NET - 8, 330, 6);
      const zg = 0.35 + (phase === 'in' && by > ZY0 - 60 ? 0.35 + Math.sin(t * 12) * 0.15 : 0); c.fillStyle = `rgba(255,214,10,${zg})`; c.fillRect(20, ZY0, 350, ZY1 - ZY0);
      if (phase !== 'wait') { const s = 0.7 + (by - 200) / 600; c.fillStyle = 'rgba(0,0,0,0.2)'; c.beginPath(); c.ellipse(bx, by + 4, 12 * s, 5 * s, 0, 0, 6.28); c.fill(); ball(c, 'tennis', bx, by - z, 14 * s, t * 8); }
      c.save(); c.translate(phase === 'out' || swing ? bx : 195, 760); c.rotate(-0.4 + swing * 1.2); c.strokeStyle = '#ff3b6b'; c.lineWidth = 8; c.beginPath(); c.ellipse(0, -40, 26, 32, 0, 0, 6.28); c.stroke(); c.fillStyle = '#2b2140'; c.fillRect(-5, -8, 10, 44); c.restore();
      for (let i = 0; i < need; i++) { c.globalAlpha = i < hits ? 1 : 0.35; ball(c, 'tennis', W / 2 + (i - (need - 1) / 2) * 36, 824, 11); c.globalAlpha = 1; } },
    down(p: Pt) { if (done || phase !== 'in') return; if (by < ZY0 - 40 || Math.hypot(p.x - bx, p.y - (by - z)) > 90) return;
      hits++; swing = 1; phase = 'out'; tx = 90 + rnd() * 210; const T = (by - 200) / (speed * 0.9); vx = (tx - bx) / T; vy = -speed * 0.9; api.sfx.pop(); api.burst(bx, by, 10); api.say(level === 3 ? NUM[hits - 1] : [L.yes, L.great, L.point][hits % 3]); },
    move() { /* */ }, up() { /* */ },
    next() { if (done) return null; if (phase === 'in' && by > ZY0 - 30) return { type: 'tap', x: bx + vx * 0.08, y: by - z + vy * 0.08 }; return { type: 'wait', ms: 30 }; },
    busy: () => done || phase === 'out' || phase === 'miss',
  };
}
