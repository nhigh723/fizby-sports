// Tee-ball: a ring pulses around the ball on the tee; tap when it hugs the ball to hit. Teaches timing, counting bases, left/right.
// L0 slow ring - L1 faster - L2 fastest - L3 hit, then tap bases 1-2-3-home - L4 Fizby says left or right: tap that side of the ball. 5+: remixes.
import { type Ctx, W } from '../art';
import { ball, field } from '../sports';
import { L, NUM } from '../lines';
import type { Activity, Api, Pt } from '../kit';
const BX = 195, BY = 600, BR = 22, GOOD = 60;
const BASES: [number, number][] = [[300, 470], [195, 360], [90, 470], [195, 640]];
export function tee(api: Api, level: number): Activity {
  const remix = level >= 5, rnd = Math.random, sp = [1.4, 2, 2.6, 1.8, 1.6][level] ?? 1.5 + rnd(), runs = level === 3 || (remix && rnd() < 0.4), lr = level === 4 || (remix && !runs && rnd() < 0.6), need = 3;
  let ph = 0, hits = 0, fly = -1, fx = 0, fy = 0, fvx = 0, fvy = 0, base = -1, done = false, side = rnd() < 0.5 ? -1 : 1, early = 0, runnerT = 0;
  const ringR = () => BR + 8 + 70 * (0.5 + 0.5 * Math.cos(ph));
  const sayDir = () => api.say(side < 0 ? L.teeLeft : L.teeRight);
  if (lr) setTimeout(sayDir, 2600);
  const round = () => { if (hits >= need) { done = true; api.win(L.homeRun); return; } side = rnd() < 0.5 ? -1 : 1; if (lr) sayDir(); };
  return {
    intro: L.teeGo,
    update(dt) { if (fly < 0 && base < 0) ph += dt * sp * 2; early = Math.max(0, early - dt); runnerT += dt;
      if (fly >= 0) { fly += dt; fx += fvx * dt; fy += fvy * dt; fvy += 300 * dt; if (fly > 1.4) { fly = -1; if (runs) { base = 0; api.say(L.runBases); } else round(); } } },
    draw(c: Ctx) { const t = api.t(); c.fillStyle = '#7fe3f5'; c.fillRect(0, 0, W, 300); field(c, 260, '#3ddc4a');
      c.fillStyle = '#e0a060'; c.beginPath(); c.moveTo(195, 680); c.lineTo(330, 470); c.lineTo(195, 330); c.lineTo(60, 470); c.closePath(); c.fill(); c.fillStyle = '#3ddc4a'; c.beginPath(); c.moveTo(195, 610); c.lineTo(280, 470); c.lineTo(195, 390); c.lineTo(110, 470); c.closePath(); c.fill();
      BASES.forEach(([x, y], i) => { c.fillStyle = base > i ? '#ffd60a' : '#fff'; c.save(); c.translate(x, y); c.rotate(0.785); c.fillRect(-16, -16, 32, 32); c.restore(); if (base === i) { c.strokeStyle = '#ffd60a'; c.lineWidth = 5; c.beginPath(); c.arc(x, y, 30 + Math.sin(t * 8) * 4, 0, 6.28); c.stroke(); } });
      if (lr && fly < 0 && base < 0) { const ax = BX + side * 110, a = Math.sin(t * 6) * 6; c.fillStyle = '#ffd60a'; c.beginPath(); c.moveTo(ax + side * (24 + a), BY); c.lineTo(ax - side * 4, BY - 22); c.lineTo(ax - side * 4, BY + 22); c.fill(); }
      c.fillStyle = '#ff9f1c'; c.fillRect(BX - 5, BY + 10, 10, 60); c.fillStyle = '#e07b00'; c.fillRect(BX - 16, BY + 66, 32, 8);
      if (fly < 0 && base < 0) { const r = ringR(), ok = r < GOOD; c.strokeStyle = ok ? '#ffd60a' : '#fff'; c.lineWidth = ok ? 10 : 6; c.beginPath(); c.arc(BX, BY, r, 0, 6.28); c.stroke(); ball(c, 'tee', BX + (early ? Math.sin(t * 40) * 3 : 0), BY, BR); }
      if (fly >= 0) ball(c, 'tee', fx, fy, BR * Math.max(0.4, 1 - fly * 0.4), fly * 10);
      for (let i = 0; i < need; i++) { c.globalAlpha = i < hits ? 1 : 0.35; ball(c, 'tee', 150 + i * 45, 800, 14); c.globalAlpha = 1; } void runnerT; },
    down(p: Pt) { if (done || fly >= 0) return;
      if (base >= 0) { const [x, y] = BASES[base]; if (Math.hypot(p.x - x, p.y - y) < 50) { api.sfx.hop(); api.say(base < 3 ? NUM[base] : L.homeRun); base++; if (base > 3) { base = -1; round(); } } return; }
      if (Math.hypot(p.x - BX, p.y - BY) > 150) return;
      if (ringR() >= GOOD) { early = 0.4; api.sfx.wrong(); api.say(L.teeEarly, false); return; }
      if (lr && Math.sign(p.x - BX || 1) !== side) { api.sfx.wrong(); api.say(side < 0 ? L.teeLeft : L.teeRight); return; }
      hits++; fly = 0; fx = BX; fy = BY; fvx = lr ? side * 220 : (rnd() - 0.5) * 200; fvy = -520; api.sfx.thud(); api.sfx.cheer(); api.burst(BX, BY, 18); api.say(runs ? L.great : NUM[hits - 1]); },
    move() { /* */ }, up() { /* */ },
    next() { if (done || fly >= 0) return null; if (base >= 0) { const [x, y] = BASES[base]; return { type: 'tap', x, y }; }
      const r = ringR(), shrinking = Math.sin(ph) > 0 && Math.cos(ph) < 0.2; if (r < GOOD - 14 || (shrinking && r < GOOD + 4)) return { type: 'tap', x: BX + (lr ? side * 40 : 0), y: BY }; return { type: 'wait', ms: 30 }; },
    busy: () => done || fly >= 0,
  };
}
