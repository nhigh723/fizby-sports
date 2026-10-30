// Basketball: pull the ball back like a slingshot and let go. Teaches force (pull more = goes farther), counting, colours.
// L2 (and some remixes): before each shot, pick the ball colour Fizby names from the rack (listening + colours).
// L0 close low hoop - L1 farther - L2 higher - L3 hoop moves each basket - L4 two colour hoops, Fizby names the colour. 5+: remixes.
import { type Ctx, W, band } from '../art';
import { ball, hoop } from '../sports';
import { L, NUM, hoopLine, colorLine } from '../lines';
import { setKitCtx, ball as kb } from '../fkit';
import type { Activity, Api, Pt } from '../kit';
import { near } from '../kit';
const B = { x: 90, y: 640 }, G = 1400, K = 8, MAXP = 200, BR = 26;
const HOOPS: [number, number][] = [[250, 520], [310, 500], [300, 420], [280, 470], [300, 450]];
export function basket(api: Api, level: number): Activity {
  const remix = level >= 5, rnd = Math.random, two = level === 4 || (remix && rnd() < 0.5), moving = level === 3 || remix, need = 3;
  const COLS = ['#ff3b6b', '#1fb6ff', '#ffd60a', '#3ddc4a'];
  let hs: { x: number; y: number; col: string }[] = [], want = 0; const pickMode = level === 2 || (remix && !two && rnd() < 0.5); let rack: string[] = [], pickC = '', picking = false;
  const setPick = () => { if (!pickMode) return; rack = [...COLS].sort(() => rnd() - 0.5).slice(0, 3); pickC = rack[Math.floor(rnd() * 3)]; picking = true; api.say(colorLine(pickC)); };
  const RK = (i: number) => ({ x: 170 + i * 66, y: 735 });
  const place = () => { if (two) { const c2 = [...COLS].sort(() => rnd() - 0.5); hs = [{ x: 200, y: 440 + rnd() * 60, col: c2[0] }, { x: 315, y: 400 + rnd() * 80, col: c2[1] }]; want = rnd() < 0.5 ? 0 : 1; }
    else { const [x, y] = moving ? [220 + rnd() * 100, 410 + rnd() * 110] : HOOPS[level]; hs = [{ x, y, col: '#ff3b6b' }]; want = 0; } };
  place(); if (two) setTimeout(() => api.say(hoopLine(hs[want].col)), 2600); if (pickMode) setTimeout(() => { if (!rack.length) setPick(); }, 2600);
  let bx = B.x, by = B.y, vx = 0, vy = 0, fly = false, pull: Pt | null = null, cur: Pt | null = null, back = -1, cheer = -1, made = 0, done = false, spin = 0, swish = 0, swishAt = -1, passX = 0;
  const reset = () => { bx = B.x; by = B.y; fly = false; vx = vy = 0; };
  const pullOf = (p: Pt) => { let dx = p.x - (pull?.x ?? B.x), dy = p.y - (pull?.y ?? B.y); const d = Math.hypot(dx, dy); if (d > MAXP) { dx *= MAXP / d; dy *= MAXP / d; } return { dx, dy }; };
  return {
    intro: two ? L.basketGo : L.basketGo,
    update(dt) { swish = Math.max(0, swish - dt);
      if (fly) { const py = by; vy += G * dt; bx += vx * dt; by += vy * dt; spin += dt * 8;
        for (let i = 0; i < hs.length; i++) { const h = hs[i]; if (vy > 0 && py < h.y && by >= h.y) { if (Math.abs(bx - h.x) < 40) {
          if (two && i !== want) { api.sfx.wrong(); api.say(L.wrongHoop); fly = false; back = 0; return; }
          fly = false; bx = h.x; cheer = 0; made++; swish = 1; api.sfx.cheer(); api.burst(h.x, h.y, 26); api.say(NUM[made - 1]); return; } else if (i === (two ? want : 0)) passX = bx; } }
        if (by > 900 || bx > W + 60) { fly = false; back = 0; const h = hs[two ? want : 0]; const far = (passX || bx) > h.x; api.sfx.thud(); api.say(far ? L.tooFar : L.tooShort); passX = 0; } }
      if (back >= 0) { back += dt; if (back > 0.8) { back = -1; reset(); } }
      if (cheer >= 0) { cheer += dt; by += 200 * dt; if (cheer > 1.2) { cheer = -1; reset(); if (made >= need) { done = true; api.win(L.swish); } else { if (moving || two) place(); if (two) api.say(hoopLine(hs[want].col)); setPick(); } } } },
    draw(c: Ctx) { const t = api.t(); c.fillStyle = '#ffb000'; band(c, 0, 844); c.fillStyle = '#e88a00'; for (let i = 0; i < 8; i++) c.fillRect(i * 52, 0, 4, 844); c.fillStyle = '#ffd27a'; band(c, 760, 84);
      c.strokeStyle = '#fff'; c.lineWidth = 5; c.beginPath(); c.arc(W, 780, 200, Math.PI, 1.5 * Math.PI); c.stroke();
      hs.forEach((h, i) => { hoop(c, h.x, h.y, h.col, t, swish); if (two && i === want) { const a = Math.sin(t * 6) * 6; c.fillStyle = h.col; c.beginPath(); c.moveTo(h.x, h.y - 92 + a); c.lineTo(h.x - 14, h.y - 116 + a); c.lineTo(h.x + 14, h.y - 116 + a); c.fill(); } });
      for (let i = 0; i < need; i++) { c.globalAlpha = i < made ? 1 : 0.35; ball(c, 'basket', 260 + i * 40, 805, 15); c.globalAlpha = 1; }
      if (pull && cur && !fly) { const { dx, dy } = pullOf(cur); let x = B.x, y = B.y, ux = -dx * K, uy = -dy * K; c.fillStyle = 'rgba(255,255,255,0.9)';
        for (let i = 0; i < 7; i++) { const s = 0.05; x += ux * s; uy += G * s; y += uy * s; c.beginPath(); c.arc(x, y, 6 - i * 0.6, 0, 6.28); c.fill(); }
        c.strokeStyle = '#7a3a10'; c.lineWidth = 4; c.beginPath(); c.moveTo(B.x, B.y); c.lineTo(B.x + dx, B.y + dy); c.stroke(); ball(c, 'basket', B.x + dx, B.y + dy, BR); return; }
      if (pickMode && rack.length) { setKitCtx(c); c.fillStyle = '#c98a4b'; c.fillRect(130, 758, 210, 10); rack.forEach((col, i) => { const b = RK(i), up = picking ? 0 : col === pickC ? -400 : 0; if (up) return; kb(b.x, b.y, 24, col); c.strokeStyle = 'rgba(43,33,64,0.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(b.x - 24, b.y); c.lineTo(b.x + 24, b.y); c.moveTo(b.x, b.y - 24); c.lineTo(b.x, b.y + 24); c.stroke(); });
        if (picking) { const k = 1 + Math.sin(t * 6) * 0.1; c.fillStyle = pickC; c.beginPath(); c.arc(W - 40, 130, 18 * k, 0, 6.28); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 4; c.stroke(); } }
      if (picking) return;
      ball(c, 'basket', bx, by, BR, spin); if (pickMode && pickC) { c.strokeStyle = pickC; c.lineWidth = 5; c.beginPath(); c.arc(bx, by, BR + 3, 0, 6.28); c.stroke(); } },
    down(p: Pt) { if (fly || back >= 0 || cheer >= 0 || done) return;
      if (picking) { const i = rack.findIndex((_, k) => Math.hypot(p.x - RK(k).x, p.y - RK(k).y) < 36); if (i < 0) return; if (rack[i] === pickC) { picking = false; api.sfx.pick(); api.say(L.yes, false); } else { api.sfx.wrong(); api.say(colorLine(pickC)); } return; } if (!picking && near(p, B.x, B.y, 80)) { pull = { x: p.x, y: p.y }; cur = { x: p.x, y: p.y }; } },
    move(p: Pt) { if (pull) cur = { x: p.x, y: p.y }; },
    up(p: Pt) { if (!pull) return; const { dx, dy } = pullOf(p); pull = cur = null; if (Math.hypot(dx, dy) < 25) return; vx = -dx * K; vy = -dy * K; fly = true; passX = 0; api.sfx.whoosh(); },
    next() { if (fly || back >= 0 || cheer >= 0 || done) return null; if (pickMode && !rack.length) return { type: 'wait', ms: 200 }; if (picking) { const b = RK(rack.indexOf(pickC)); return { type: 'tap', x: b.x, y: b.y }; } const h = hs[two ? want : 0], dx = h.x - B.x, up = B.y - h.y; let best: [number, number] | null = null;
      for (let a = 45; a <= 80; a++) { const th = a * Math.PI / 180, den = 2 * Math.cos(th) ** 2 * (dx * Math.tan(th) - up); if (den <= 0) continue; const v = Math.sqrt(G * dx * dx / den), tt = dx / (v * Math.cos(th)), vyA = -v * Math.sin(th) + G * tt;
        if (vyA > 150 && (!best || v < Math.hypot(best[0], best[1]))) best = [v * Math.cos(th), -v * Math.sin(th)]; }
      if (!best) return null; const px = -best[0] / K, py = -best[1] / K; return { type: 'drag', path: [[B.x, B.y], [B.x + px * 0.5, B.y + py * 0.5], [B.x + px, B.y + py]] }; },
    busy: () => fly || back >= 0 || cheer >= 0 || done,
  };
}
