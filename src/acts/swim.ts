// Swimming: tap the arm buttons to swim to the far wall. Teaches left/right and taking turns (alternating), counting strokes.
// L1+: dive start: wait for the whistle light, then tap the swimmer to dive in (impulse control).
// L0 any arm - L1 take turns left/right - L2 longer pool, take turns - L3 Fizby calls "Left!"/"Right!" - L4 count the buoys as you pass. 5+: remixes.
import { type Ctx, W, band } from '../art';
import { L, NUM } from '../lines';
import { setKitCtx, kidHead, ball as kb } from '../fkit';
import type { Activity, Api, Pt } from '../kit';
const LB = { x: 90, y: 760 }, RB = { x: 300, y: 760 }, TOP = 170, BOT = 640;
export function swim(api: Api, level: number): Activity {
  const remix = level >= 5, rnd = Math.random, mode = remix ? 1 + Math.floor(rnd() * 3) : [0, 1, 1, 2, 3][level], strokes = [6, 8, 12, 8, 10][level] ?? 8 + Math.floor(rnd() * 4);
  let n = 0, last = 0, call = rnd() < 0.5 ? -1 : 1, y = BOT, ty = BOT, arm = 0, done = false, buoys = 0, duckY = BOT, laps = 0;
  const diveMode = level >= 1; let dive = diveMode ? 0 : -1, diveGo = 1.8 + rnd() * 1.2, diveFx = 0;
  if (mode === 2) setTimeout(() => api.say(call < 0 ? L.left : L.right), 2600);
  const want = () => mode === 0 ? 0 : mode === 2 ? call : last === 0 ? 0 : -last;
  return {
    intro: mode === 0 ? L.swimGo : mode === 2 ? L.swimGo : L.swimAlt,
    update(dt) { if (dive >= 0) { const d0 = dive; dive += dt; if (d0 < diveGo && dive >= diveGo) { api.sfx.ding(); api.say(L.dive); } } diveFx = Math.max(0, diveFx - dt * 2); y += (ty - y) * Math.min(1, dt * 6); arm = Math.max(0, arm - dt * 3); duckY = Math.max(TOP + 40, duckY - dt * 12); if (!done && n >= strokes && Math.abs(y - ty) < 4) { done = true; api.win(L.splash); } },
    draw(c: Ctx) { const t = api.t(); c.fillStyle = '#e8f6ff'; band(c, 0, 844); c.fillStyle = '#22d3ee'; c.fillRect(40, TOP - 40, W - 80, BOT - TOP + 90);
      for (let i = 0; i < 6; i++) { c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 3; c.beginPath(); for (let x = 40; x < W - 40; x += 10) c.lineTo(x, TOP + i * 90 + Math.sin(x / 20 + t * 3 + i) * 4); c.stroke(); }
      for (const lx of [130, 260]) for (let yy = TOP - 30; yy < BOT + 40; yy += 22) { c.fillStyle = (yy / 22) % 2 < 1 ? '#ff3b6b' : '#fff'; c.beginPath(); c.arc(lx, yy, 7, 0, 6.28); c.fill(); }
      c.fillStyle = '#ffd60a'; c.fillRect(40, TOP - 46, W - 80, 10);
      if (mode === 3) for (let k = 0; k < 3; k++) { const by = BOT - (k + 1) * (BOT - TOP) / 4; c.fillStyle = k < buoys ? '#ffd60a' : '#ff9f1c'; c.beginPath(); c.arc(105, by, 12, 0, 6.28); c.fill(); }
      // duck pal in the next lane
      c.save(); c.translate(320, duckY); c.fillStyle = '#ffd60a'; c.beginPath(); c.ellipse(0, 0, 22, 14, 0, 0, 6.28); c.fill(); c.beginPath(); c.arc(8, -14, 10, 0, 6.28); c.fill(); c.fillStyle = '#ff9f1c'; c.beginPath(); c.moveTo(16, -14); c.lineTo(26, -11); c.lineTo(16, -9); c.fill(); c.fillStyle = '#2b2140'; c.beginPath(); c.arc(10, -17, 2.5, 0, 6.28); c.fill(); c.restore();
      if (dive >= 0) { c.fillStyle = '#ffffff'; c.fillRect(160, BOT + 30, 70, 26); c.strokeStyle = '#2b2140'; c.lineWidth = 3; c.strokeRect(160, BOT + 30, 70, 26); const go = dive >= diveGo; c.fillStyle = go ? '#3ddc4a' : '#ff3b6b'; c.beginPath(); c.arc(W - 70, 150, 26, 0, 6.28); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 5; c.stroke(); if (go) { const k = 1 + Math.sin(t * 10) * 0.15; c.strokeStyle = '#ffd60a'; c.lineWidth = 6; c.beginPath(); c.arc(195, BOT, 46 * k, 0, 6.28); c.stroke(); } }
      if (diveFx > 0) { c.strokeStyle = `rgba(255,255,255,${diveFx})`; c.lineWidth = 5; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(195, BOT - 10, 30 + (1 - diveFx) * 60 + k * 14, 0, 6.28); c.stroke(); } }
      // swimmer (Fizby-team swimmer: cap + goggles)
      c.save(); c.translate(195, y); setKitCtx(c); c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.ellipse(0, 24, 40, 12, 0, 0, 6.28); c.fill();
      const la = last === -1 ? arm : 0, ra = last === 1 ? arm : 0;
      for (const [sx, a] of [[-1, la], [1, ra]] as const) { c.lineCap = 'round'; c.beginPath(); c.moveTo(sx * 20, 10); c.quadraticCurveTo(sx * 44, 4 - a * 30, sx * 34, -10 - a * 40); c.strokeStyle = '#2b2140'; c.lineWidth = 14; c.stroke(); c.strokeStyle = '#f2c29b'; c.lineWidth = 9; c.stroke(); kb(sx * 34, -10 - a * 40, 6, '#f2c29b'); }
      c.save(); c.scale(0.5, 0.5); c.translate(0, 100); kidHead({ skin: '#f2c29b', hair: '#7a4a2a', style: 'spiky', shoes: '#fff', band: '' }); c.beginPath(); c.arc(0, -112, 19, Math.PI * 1.02, Math.PI * 1.98); c.fillStyle = '#ff3b6b'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#2b2140'; c.stroke();
      kb(-7, -106, 6, '#22d3ee'); kb(7, -106, 6, '#22d3ee'); c.fillStyle = '#2b2140'; c.fillRect(-1, -107, 2, 3); c.restore();
      c.fillStyle = 'rgba(255,255,255,0.7)'; for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(-30 + k * 20, 30 + Math.sin(t * 6 + k) * 3, 4, 0, 6.28); c.fill(); } c.restore();
      const w = want(); for (const [b, s] of [[LB, -1], [RB, 1]] as const) { const glow = w === s || w === 0, pulse = glow ? 1 + Math.sin(t * 6) * 0.06 : 1; c.save(); c.translate(b.x, b.y); c.scale(pulse, pulse); c.fillStyle = glow ? (s < 0 ? '#ff5fd2' : '#9b5cff') : '#c8c0d8'; c.beginPath(); c.arc(0, 0, 52, 0, 6.28); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 6; c.stroke();
        c.fillStyle = '#fff'; c.beginPath(); c.moveTo(s * 26, 0); c.lineTo(-s * 12, -22); c.lineTo(-s * 12, 22); c.fill(); c.restore(); }
      for (let i = 0; i < strokes; i++) { c.fillStyle = i < n ? '#ffd60a' : 'rgba(43,33,64,0.15)'; c.beginPath(); c.arc(W / 2 + (i - (strokes - 1) / 2) * 16, 830, 6, 0, 6.28); c.fill(); } void laps; },
    down(p: Pt) { if (done || n >= strokes) return;
      if (dive >= 0) { if (Math.hypot(p.x - 195, p.y - BOT) > 90) return; if (dive < diveGo) { api.sfx.wrong(); api.say(L.waitWhistle, false); dive = 0.6; diveGo = 1.6 + rnd(); } else { dive = -1; diveFx = 1; api.sfx.splash(); api.burst(195, BOT - 20, 20); if (mode === 2) setTimeout(() => api.say(call < 0 ? L.left : L.right), 700); } return; } const s = Math.hypot(p.x - LB.x, p.y - LB.y) < 60 ? -1 : Math.hypot(p.x - RB.x, p.y - RB.y) < 60 ? 1 : 0; if (!s) return; const w = want();
      if (w && s !== w) { api.sfx.wrong(); api.say(mode === 2 ? (call < 0 ? L.left : L.right) : L.otherArm); return; }
      n++; last = s; arm = 1; ty = BOT - (BOT - TOP) * n / strokes; api.sfx.splash();
      if (mode === 3) { const nb = Math.floor(n / strokes * 4 + 0.001); if (nb > buoys && nb <= 3) { buoys = nb; api.say(NUM[buoys - 1]); } }
      if (mode === 2 && n < strokes) { call = rnd() < 0.5 ? -1 : 1; setTimeout(() => api.say(call < 0 ? L.left : L.right), 350); } },
    move() { /* */ }, up() { /* */ },
    next() { if (done || n >= strokes) return null; if (dive >= 0) return dive < diveGo ? { type: 'wait', ms: 120 } : { type: 'tap', x: 195, y: BOT }; const w = want() || -1; const b = w < 0 ? LB : RB; return { type: 'tap', x: b.x, y: b.y }; },
    busy: () => done || n >= strokes,
  };
}
