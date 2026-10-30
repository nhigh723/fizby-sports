// Fizby Sports: app shell. Screens, input routing, save, stickers/trophies, hint hand, Trophy Room, grown-ups area + parental gate.
import { CLUB_NAME, GAME_TITLE } from './brand';
import { mascot, mascotBust, preloadArt, type Mood } from './fizby2d';
import { stepHint, drawHint, resetHint, hint, hintCfg, setHintCtx } from './hint';
import { bleed, W, H, INK, COLORS, hand, sky, confettiDraw, rr, shade, type Ctx, type Pose, band } from './art';
import { initAudio, sfx, say as voiceSay, isSpeaking, missing, musicScene, stopVoice } from './audio';
import { L, allLines } from './lines';
import type { Activity, Action, Api, Pt } from './kit';
import { ball, field, sticker, trophy, star, keeper, pin, hoop, goal, type BallKind } from './sports';
import { soccer } from './acts/soccer'; import { basket } from './acts/basket'; import { bowl } from './acts/bowl'; import { tee } from './acts/tee'; import { swim } from './acts/swim';
import { golf } from './acts/golf'; import { hockey } from './acts/hockey'; import { tennis } from './acts/tennis'; import { race } from './acts/race'; import { gym } from './acts/gym'; import { paint } from './acts/paint';
import { SPORT_NAME, FACT } from './lines';
import { store, hasClub, levelFree, buy, restore, manage, initStore, PRODUCTS, TERMS_URL, PRIVACY_URL, openLink, storeTest, type Plan } from './store';
import { lineId } from './voice';
import { hasProfiles, saveFirst, profiles, current, addProfile, setBand, setFace, rename, switchTo, tuning, type Band } from './profiles';
import { tune } from './kit';
import { kid, setKitCtx, figure, kidHead, kart, hockeyKid, puck, box, starShape, ball as ballK, type KidLook } from './fkit';
import { settings, cycleVol, applySettings, audioStats } from './audio';
const cv = document.getElementById('c') as HTMLCanvasElement, c = cv.getContext('2d')!; setHintCtx(c); void preloadArt([]); musicScene('hub');
let scale = 1, ox = 0, oy = 0, dpr = 1;
function resize() { dpr = Math.min(devicePixelRatio || 1, 3); cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr); scale = Math.min(cv.width / W, cv.height / H); ox = (cv.width - W * scale) / 2; oy = (cv.height - H * scale) / 2; bleed.x = ox / scale; bleed.y = oy / scale; }
addEventListener('resize', resize); resize();
// ---- save ----
const ACTS = [
  { id: 'soccer', make: soccer, levels: 5, bg: ['#3ddc4a', '#c9ffb8'], ball: 'soccer' as BallKind }, { id: 'basket', make: basket, levels: 5, bg: ['#ff9f1c', '#ffe0a8'], ball: 'basket' as BallKind },
  { id: 'bowl', make: bowl, levels: 6, bg: ['#9b5cff', '#e6dcff'], ball: 'bowl' as BallKind }, { id: 'tee', make: tee, levels: 5, bg: ['#ffd60a', '#fff4b0'], ball: 'tee' as BallKind },
  { id: 'swim', make: swim, levels: 5, bg: ['#22d3ee', '#c8f7ff'], ball: 'swim' as BallKind }, { id: 'golf', make: (a: Api, l: number) => golf(a, l), levels: 5, bg: ['#5fd83a', '#d8ffd6'], ball: 'golf' as BallKind },
  { id: 'tennis', make: tennis, levels: 5, bg: ['#1fb6ff', '#cde9ff'], ball: 'tennis' as BallKind }, { id: 'race', make: race, levels: 5, bg: ['#ff3b6b', '#ffd6e0'], ball: 'race' as BallKind },
  { id: 'hockey', make: hockey, levels: 5, bg: ['#7c5cff', '#e2dcff'], ball: 'hockey' as BallKind }, { id: 'gym', make: gym, levels: 5, bg: ['#ff5fd2', '#ffd6f4'], ball: 'gym' as BallKind },
  { id: 'paint', make: paint, levels: 5, bg: ['#ff9f1c', '#ffe0a8'], ball: 'paint' as BallKind },
];
type Save = { lv: number[]; wins: number; seen: number; skills: Record<string, number>; stickers: number[]; trophies: number[]; stars?: Record<string, number> };
const KEY = 'fs5~save', fresh = (): Save => ({ lv: ACTS.map(() => 0), wins: 0, seen: 0, skills: {}, stickers: [], trophies: [] });
function load(): Save { const d = fresh(); try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && Array.isArray(s.lv)) { const m = { ...d, ...s }; while (m.lv.length < ACTS.length) m.lv.push(0); return m; } } catch { /* */ } return d; }
let save = load();
function applyTuning() { const t = tuning(); hintCfg.delay = t.hint; tune.slack = t.slack; }
applyTuning();
const SK = 'fs5~settings'; try { Object.assign(settings, JSON.parse(localStorage.getItem(SK) || '{}')); } catch { /* */ }
const saveSettings = () => { applySettings(); try { localStorage.setItem(SK, JSON.stringify(settings)); } catch { /* */ } };
function pickChild(i: number) { if (switchTo(i)) { save = load(); applyTuning(); sfx.pop(); } } const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch { /* full */ } };
const SKILLS: Record<string, string[]> = { soccer: ['Aiming (direction)', 'Counting', 'Left and right'], basket: ['Force (how hard)', 'Counting', 'Colors'], bowl: ['Counting to 10', 'Aiming (direction)', 'Left and right'], tee: ['Timing', 'Counting', 'Left and right'], swim: ['Left and right', 'Taking turns', 'Counting'],
  golf: ['Force (how hard)', 'Angles (bank shots)'], tennis: ['Timing', 'Tracking a moving ball', 'Counting'], race: ['Left and right', 'Counting', 'Colors'], hockey: ['Aiming (direction)', 'Angles (bank shots)', 'Force (how hard)'],
  gym: ['Memory and sequences', 'Shapes', 'Body moves'], paint: ['Colors', 'Matching', 'Fine motor'] };
// ---- state ----
type Screen = 'title' | 'setup' | 'hub' | 'play' | 'town' | 'parents';
let newSticker = -1, freeRemix = false;
let screen: Screen = 'title', T = 0, actI = 0, level = 0, act: Activity | null = null, winT = -1, winLine = '', idle = 0, demo: { a: Action; t: number } | null = null, demoShown = new Set<string>();
let modal: null | { kind: 'gate' } | { kind: 'unlock'; sport: number; t: number } = null, shake = 0, mascotPose: Mood = 'stand', mascotPoseT = 0, lockWiggle = -1, lockT = 0, townX = 0, townDrag: { x: number; sx: number; moved: boolean } | null = null;
const parts: { x: number; y: number; vx: number; vy: number; r: number; col: string; life: number }[] = [];
function burst(x: number, y: number, n = 20, cols: string[] = COLORS) { for (let i = 0; i < n && parts.length < 400; i++) { const a = Math.random() * 6.28, s = 120 + Math.random() * 380; parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 200, r: 4 + Math.random() * 5, col: cols[i % cols.length], life: 1.2 + Math.random() * 0.6 }); } }
/** force: a fresh line drops whatever is queued (the current sentence still finishes); otherwise it is skipped while Fizby talks */
function say(text: string, force = true) { if (!text) return; if (!force && isSpeaking()) return; if (force) stopVoice(false); voiceSay(text); }
let misses = 0, winStars = 0; const pops: { x: number; y: number; t: number }[] = [];
const sfxApi = { ...sfx, wrong: () => { sfx.wrong(); misses++; mascotPose = 'oops'; mascotPoseT = 1.4; } };
const api: Api = {
  say, sfx: sfxApi, burst: (x: number, y: number, n?: number, cols?: string[]) => { burst(x, y, n, cols); if (winT < 0 && pops.length < 6) pops.push({ x, y, t: 0 }); }, t: () => T, shake: (a) => { shake = Math.max(shake, a); },
  win(line: string) { if (winT >= 0 || !act) return; winT = 0; winLine = line; winStars = misses === 0 ? 3 : misses <= 2 ? 2 : 1; { const k = actI + ':' + level, st = save.stars || (save.stars = {}); st[k] = Math.max(st[k] || 0, winStars); } sfx.cheer(); burst(195, 300, 60); say(line); voiceSay(FACT[actI]); if (isBig()) { sfx.crowd(); burst(100, 200, 40, ['#ffd60a', '#fff']); burst(290, 200, 40, ['#ffd60a', '#fff']); } mascotPose = 'cheer'; mascotPoseT = 3; credit(); },
};
function credit() { save.wins++; for (const s of SKILLS[ACTS[actI].id]) save.skills[s] = (save.skills[s] || 0) + 1; if (!freeRemix && level >= save.lv[actI]) save.lv[actI] = level + 1;
  newSticker = actI * 10 + (save.stickers.filter(x => Math.floor(x / 10) === actI).length % 10); save.stickers.push(newSticker); if (save.lv[actI] >= ACTS[actI].levels && !save.trophies.includes(actI)) { save.trophies.push(actI); pendingTrophy = actI; } persist(); }
let pendingTrophy = -1;
function checkUnlock() { if (pendingTrophy >= 0) { modal = { kind: 'unlock', sport: pendingTrophy, t: 0 }; pendingTrophy = -1; sfx.unlock(); say(L.trophy); return true; } return false; }
const isBig = () => ACTS[actI].levels > 0 && level === ACTS[actI].levels - 1 && !freeRemix;
const clubLocked = (l: number) => !hasClub() && !levelFree(l);
function start(i: number, lv = save.lv[i], withIntro = false) {
  misses = 0; pops.length = 0; modal = null; fadeT = 0; tut = -1; intro = withIntro ? { t: 0 } : null; onboard = -1;
  actI = i; level = lv; freeRemix = clubLocked(lv); act = ACTS[i].make(api, freeRemix ? lv % 2 : lv); newSticker = -1; screen = 'play'; musicScene(ACTS[i].id === 'paint' ? 'paint' : 'sports'); resetHint(); winT = -1; idle = 0; demo = null; mascotPose = 'point'; mascotPoseT = 2;
  const big = ACTS[i].levels > 0 && lv === ACTS[i].levels - 1 && !freeRemix;
  if (intro) { say(SPORT_NAME[i]); if (big) voiceSay(L.bigGame); if (act.intro) voiceSay(act.intro); } else if (big) { say(L.bigGame); if (act.intro) voiceSay(act.intro); } else if (act.intro) say(act.intro);
  if (big) sfx.crowd();
  const key = ACTS[i].id + ':' + Math.min(lv, 1); if (!demoShown.has(key)) { demoShown.add(key); idle = 4.6; } // show the hand demo ~1.4 s in
}
let busyT = 0, heals = 0, screenAt = 0, fadeT = 1, intro: { t: number } | null = null, tut = -1, onboard = -1, poke: { i: number; t: number } | null = null;
function go(s: Screen) { modal = null; fadeT = 0; intro = null; tut = -1; if (s === 'hub' && !save.seen) { save.seen = 1; persist(); onboard = 0; } screen = s; musicScene(s === 'play' ? (ACTS[actI]?.id === 'paint' ? 'paint' : 'sports') : 'hub'); resetHint(); screenAt = performance.now(); act = null; demo = null; winT = -1; idle = 0; if (s === 'hub') say(L.hub, false); if (s === 'setup') say(L.who); if (s === 'town') { bookPage = -1; say(save.stickers.length ? L.shelfHi : L.shelfEmpty); townX = 0; }
  if (s === 'play' && freeRemix) say(L.locked, false); }
// ---- buttons (registered while drawing; hit-tested on the next pointer down) ----
type Btn = { id: string; x: number; y: number; w: number; h: number; fn: () => void };
let btns: Btn[] = [], frameBtns: Btn[] = [];
function btn(id: string, x: number, y: number, w: number, h: number, fn: () => void) { frameBtns.push({ id, x, y, w, h, fn }); }
function roundBtn(id: string, x: number, y: number, r: number, col: string, icon: (c: Ctx) => void, fn: () => void) {
  c.save(); c.translate(x, y); c.fillStyle = 'rgba(0,0,0,0.15)'; c.beginPath(); c.arc(0, 4, r, 0, 6.28); c.fill(); c.fillStyle = col; c.beginPath(); c.arc(0, 0, r, 0, 6.28); c.fill(); c.lineWidth = 5; c.strokeStyle = '#fff'; c.stroke(); icon(c); c.restore(); btn(id, x - r, y - r, r * 2, r * 2, fn);
}
const backIcon = (c: Ctx) => { c.strokeStyle = '#fff'; c.lineWidth = 8; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(7, -14); c.lineTo(-9, 0); c.lineTo(7, 14); c.stroke(); };
function backBtn(to: () => void) { roundBtn('back', 50 - bleed.x, 62 - Math.min(bleed.y, 20), 34, '#1fb6ff', backIcon, () => { sfx.tap(); to(); }); }
function text(s: string, x: number, y: number, size: number, col = INK, align: CanvasTextAlign = 'center', weight = 800) { c.font = `${weight} ${size}px ui-rounded, "SF Pro Rounded", system-ui, sans-serif`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function lock(x: number, y: number, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = '#fff'; c.lineWidth = 7; c.beginPath(); c.arc(0, -8, 12, Math.PI, 0); c.stroke(); c.fillStyle = '#ffd60a'; rr(c, -18, -8, 36, 28, 7); c.fill(); c.strokeStyle = shade('#ffd60a', -0.4); c.lineWidth = 3; c.stroke(); c.fillStyle = INK; c.beginPath(); c.arc(0, 4, 4, 0, 6.28); c.fill(); c.restore(); }
// ---- hub card art ----
/** Illustrated hub-card vignettes: a little scene per sport with a kid player, props and the ball (drawn with the shared F&L kit). */
const CL: KidLook[] = [{ skin: '#f2c29b', hair: '#7a4a2a', style: 'spiky', shoes: '#ffffff', band: '' }, { skin: '#8d5a3b', hair: '#2b1a12', style: 'puffs', shoes: '#ff3b6b', band: '' }, { skin: '#e0ac69', hair: '#1d1427', style: 'curly', shoes: '#1fb6ff', band: '#ffd60a' }];
function cardArt(i: number, x: number, y: number, w: number, h: number) { const b = Math.abs(Math.sin(T * 3 + i)) * 6, k = w / 112;
  c.save(); c.translate(x + w / 2, y + h / 2 - 6); c.scale(k, k); setKitCtx(c); c.beginPath(); c.rect(-56, -56, 112, 100); c.clip();
  const grass = (col = '#3ddc4a') => { c.fillStyle = col; c.beginPath(); c.ellipse(0, 44, 70, 22, 0, 0, 6.28); c.fill(); };
  if (i === 0) { grass(); goal(c, 18, 22, 64, 40); kid(-26, 34, 0.36, '#ff3b6b', 0, T, 1, '9', CL[0]); ball(c, 'soccer', 2 + b, 26 - b * 2, 9, T * 4); }
  if (i === 1) { c.fillStyle = '#e8a25a'; c.fillRect(-56, 26, 112, 30); c.save(); c.translate(22, -14); c.scale(0.46, 0.46); hoop(c, 0, 0, '#ff3b6b', T); c.restore(); kid(-24, 38, 0.36, '#1fb6ff', 1, T, 0, '3', CL[1]); ball(c, 'basket', -6 + b * 2, -30 - b * 2, 10, T * 3); }
  if (i === 2) { c.fillStyle = '#e0a868'; c.beginPath(); c.moveTo(-18, -40); c.lineTo(18, -40); c.lineTo(44, 44); c.lineTo(-44, 44); c.fill(); c.strokeStyle = '#c98a4b'; c.lineWidth = 2; for (const q of [-0.5, 0, 0.5]) { c.beginPath(); c.moveTo(q * 36, -40); c.lineTo(q * 88, 44); c.stroke(); }
    for (let r2 = 0; r2 < 3; r2++) for (let q = 0; q <= r2; q++) pin(c, (q - r2 / 2) * 14, -20 + r2 * 8, 0.32); ball(c, 'bowl', 4, 24 - b, 14, T * 2); }
  if (i === 3) { grass('#c9874a'); figure(-12, 40, 0.34, '#ffd60a', { la: 2.2, ra: 1.9, ll: 0.3, rl: 0.3 }, CL[2], () => { c.save(); c.translate(26, -110); c.rotate(-0.9 + Math.sin(T * 3) * 0.3); box(-5, -6, 10, 70, 5, '#c98a4b'); c.restore(); c.beginPath(); c.arc(0, -112, 19, Math.PI, 0); c.fillStyle = '#1fb6ff'; c.fill(); });
    c.fillStyle = '#ff9f1c'; c.fillRect(26, 6, 6, 28); ball(c, 'tee', 29, -2, 9, 0); }
  if (i === 4) { c.fillStyle = '#1fb6ff'; c.fillRect(-56, 0, 112, 56); c.fillStyle = 'rgba(255,255,255,0.5)'; for (let q = 0; q < 6; q++) { c.beginPath(); c.arc(-50 + q * 22 + (T * 10) % 22, 2, 11, Math.PI, 0); c.fill(); }
    c.save(); c.translate(-10, 70); c.scale(0.5, 0.5); kidHead(CL[0]); c.fillStyle = '#ff3b6b'; c.fillRect(-18, -110, 36, 8); ball2(-8, -105, '#22d3ee'); ball2(8, -105, '#22d3ee'); c.restore();
    c.save(); c.translate(20, -2 + Math.sin(T * 6) * 3); c.lineWidth = 7; c.strokeStyle = '#2b2140'; c.beginPath(); c.moveTo(-14, 10); c.quadraticCurveTo(0, -24, 14, -14); c.stroke(); c.strokeStyle = '#f2c29b'; c.lineWidth = 4; c.stroke(); c.restore();
    ballK(34, 16, 10, '#ffd60a'); ballK(42, 8, 6, '#ffd60a'); c.fillStyle = '#ff9f1c'; c.beginPath(); c.moveTo(47, 8); c.lineTo(54, 10); c.lineTo(47, 12); c.fill(); c.fillStyle = '#2b2140'; c.beginPath(); c.arc(43, 6, 1.5, 0, 6.28); c.fill(); }
  if (i === 5) { c.fillStyle = '#2fc23c'; c.beginPath(); c.ellipse(0, 40, 80, 34, 0, 0, 6.28); c.fill(); c.fillStyle = '#5fe35a'; c.beginPath(); c.ellipse(10, 28, 40, 12, 0, 0, 6.28); c.fill();
    c.fillStyle = '#2b2140'; c.beginPath(); c.ellipse(20, 28, 8, 3, 0, 0, 6.28); c.fill(); c.fillStyle = '#fff'; c.fillRect(19, -36, 3, 64); c.fillStyle = '#ff3b6b'; c.beginPath(); c.moveTo(22, -36); c.quadraticCurveTo(34, -32 + Math.sin(T * 5) * 3, 44, -28); c.lineTo(22, -20); c.fill();
    figure(-30, 40, 0.3, '#ffd60a', { la: 0.4, ra: 0.2, ll: 0.15, rl: 0.15 }, CL[1], () => { c.save(); c.translate(10, -50); c.rotate(-0.5 + Math.sin(T * 2) * 0.3); box(-2, 0, 5, 50, 2, '#8a93bb'); box(-2, 46, 16, 8, 3, '#5d6796'); c.restore(); }); ball(c, 'golf', -6 + b, 34, 6, 0); }
  if (i === 6) { c.fillStyle = '#1fb6ff'; c.fillRect(-56, 12, 112, 44); c.strokeStyle = '#fff'; c.lineWidth = 3; c.strokeRect(-46, 16, 92, 40); c.fillStyle = '#fff'; c.fillRect(-56, 6, 112, 4); c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1; for (let q = -54; q < 56; q += 6) { c.beginPath(); c.moveTo(q, 10); c.lineTo(q, 24); c.stroke(); }
    c.save(); c.translate(-14, -6); c.rotate(-0.5 + Math.sin(T * 3) * 0.2); box(-3, 10, 7, 30, 3, '#2b2140'); c.beginPath(); c.ellipse(0, -10, 16, 21, 0, 0, 6.28); c.fillStyle = '#ff5fd2'; c.fill(); c.lineWidth = 3.5; c.strokeStyle = '#2b2140'; c.stroke(); c.save(); c.clip(); c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 1.2; for (let q = -14; q < 16; q += 5) { c.beginPath(); c.moveTo(q, -32); c.lineTo(q, 12); c.moveTo(-16, q - 10); c.lineTo(16, q - 10); c.stroke(); } c.restore(); c.restore();
    ball(c, 'tennis', 24, -24 + b * 2, 11, T * 3); }
  if (i === 7) { c.fillStyle = '#6a6080'; c.fillRect(-56, 22, 112, 34); c.fillStyle = '#fff'; for (let q = -56; q < 56; q += 24) c.fillRect(q + ((T * 60) % 24), 36, 12, 3);
    for (let r2 = 0; r2 < 3; r2++) for (let q = 0; q < 4; q++) { c.fillStyle = (r2 + q) % 2 ? '#2b2140' : '#fff'; c.fillRect(18 + q * 8, -46 + r2 * 8 + Math.sin(T * 5 + q) * 1.5, 8, 8); } c.fillStyle = '#c0c0c8'; c.fillRect(16, -46, 3, 40);
    kart(-4, 36 - b * 0.3, 0.48, '#ff3b6b', T, '1', '#ffd60a', CL[0]); }
  if (i === 8) { c.fillStyle = '#e9f7ff'; c.beginPath(); c.ellipse(0, 36, 70, 22, 0, 0, 6.28); c.fill(); c.strokeStyle = '#ff3b6b'; c.lineWidth = 2; c.beginPath(); c.moveTo(-56, 36); c.lineTo(56, 36); c.stroke();
    c.strokeStyle = '#ff3b6b'; c.lineWidth = 4; c.beginPath(); c.moveTo(30, 30); c.lineTo(30, 6); c.lineTo(56, 6); c.stroke(); c.strokeStyle = 'rgba(255,59,107,0.4)'; c.lineWidth = 1; for (let q = 34; q < 56; q += 5) { c.beginPath(); c.moveTo(q, 6); c.lineTo(q, 30); c.stroke(); }
    hockeyKid(-24, 42, 0.34, '#22d3ee', (Math.sin(T * 3) + 1) / 2, CL[2]); puck(10 + b, 38, 7); }
  if (i === 9) { box(-46, 30, 92, 12, 6, '#1fb6ff'); figure(0, 32, 0.34, '#ff5fd2', { la: 2.4, ra: 2.4, ll: 0.55, rl: 0.55 }, CL[1]);
    c.strokeStyle = '#ffd60a'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); for (let q = 0; q < 30; q++) { const u = q / 29; c.lineTo(28 + Math.sin(u * 9 + T * 4) * 12, -44 + u * 60); } c.stroke(); for (let q = 0; q < 3; q++) starShape(-38 + q * 10, -40 + q * 12, 4, '#fff'); }
  if (i === 10) { c.fillStyle = '#c98a4b'; c.fillRect(-26, -20, 5, 64); c.fillRect(21, -20, 5, 64); c.fillRect(-3, -30, 6, 74); box(-32, -42, 64, 50, 4, '#ffffff');
    const RB = ['#ff3b6b', '#ff9f1c', '#ffd60a', '#3ddc4a', '#1fb6ff', '#9b5cff']; c.save(); c.beginPath(); c.rect(-30, -40, 60, 46); c.clip(); RB.forEach((col, q) => { c.strokeStyle = col; c.lineWidth = 4; c.beginPath(); c.arc(0, 8, 34 - q * 4, Math.PI, 0); c.stroke(); }); c.fillStyle = '#ffd60a'; c.beginPath(); c.arc(20, -28, 6, 0, 6.28); c.fill(); c.restore();
    c.save(); c.translate(-30, 30); c.fillStyle = '#e0a868'; c.beginPath(); c.ellipse(0, 0, 22, 14, -0.2, 0, 6.28); c.fill(); c.strokeStyle = '#2b2140'; c.lineWidth = 2.5; c.stroke(); RB.slice(0, 4).forEach((col, q) => { c.fillStyle = col; c.beginPath(); c.arc(-12 + q * 7, -4 + (q % 2) * 6, 3.5, 0, 6.28); c.fill(); }); c.restore();
    c.save(); c.translate(36, 14); c.rotate(0.6 + Math.sin(T * 3) * 0.2); box(-3, -26, 6, 34, 3, '#ff9f1c'); box(-4, -34, 8, 10, 3, '#9b5cff'); c.restore(); }
  c.restore(); }
function ball2(x: number, y: number, col: string) { c.beginPath(); c.arc(x, y, 6, 0, 6.28); c.fillStyle = col; c.fill(); c.lineWidth = 2; c.strokeStyle = '#2b2140'; c.stroke(); }
// ---- drawing per screen ----
/** A sagging string of pennants from (x0,y0) to (x1,y1), swaying a little. */
function bunting(x0: number, y0: number, x1: number, y1: number, k0: number) { const COL = ['#ff3b6b', '#ffd60a', '#1fb6ff', '#ff9f1c', '#9b5cff', '#ff5fd2'], n = Math.max(4, Math.round((x1 - x0) / 46)), sag = 34 + Math.sin(T * 1.5 + k0) * 3;
  const at = (u: number) => ({ x: x0 + (x1 - x0) * u, y: y0 + (y1 - y0) * u + Math.sin(u * Math.PI) * sag });
  c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 3; c.beginPath(); for (let i = 0; i <= 24; i++) { const p = at(i / 24); i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y); } c.stroke();
  for (let i = 0; i < n; i++) { const a = at((i + 0.15) / n), b = at((i + 0.85) / n), m = at((i + 0.5) / n), sw = Math.sin(T * 3 + i + k0) * 3; c.fillStyle = COL[(i + k0) % 6]; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.lineTo(m.x + sw, m.y + 40); c.closePath(); c.fill(); c.lineWidth = 2.5; c.strokeStyle = '#ffffff'; c.stroke(); } }
/** Title logo: "Fizby" on a ribbon over a bouncy "SPORTS!" in bubble letters (brand only; nothing to read for play). */
function logo(x: number, y: number) { const COL = ['#ff3b6b', '#ff9f1c', '#ffd60a', '#3ddc4a', '#1fb6ff', '#9b5cff', '#ff5fd2'];
  c.save(); c.translate(x, y); c.fillStyle = '#1fb6ff'; rr(c, -70, -80, 140, 40, 20); c.fill(); c.lineWidth = 4; c.strokeStyle = '#fff'; c.stroke(); text('Fizby’s', 0, -59, 26, '#fff', 'center', 900);
  const word = 'SPORTS!'; c.font = '900 64px ui-rounded, "SF Pro Rounded", system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  for (let i = 0; i < word.length; i++) { const lx = (i - 3) * 44, ly = Math.sin(T * 4 + i * 0.7) * 6, r = Math.sin(T * 2 + i) * 0.08; c.save(); c.translate(lx, 10 + ly); c.rotate(r);
    c.lineWidth = 14; c.strokeStyle = '#2b2140'; c.strokeText(word[i], 0, 0); c.lineWidth = 8; c.strokeStyle = '#fff'; c.strokeText(word[i], 0, 0); c.fillStyle = COL[i]; c.fillText(word[i], 0, 0); c.restore(); }
  c.restore(); }
function drawTitle() {
  sky(c, '#22d3ee', '#c8f7ff', T, 520, '#3ddc4a', '#2fc23c'); field(c, 520, '#3ddc4a');
  bunting(-bleed.x - 10, 70, W / 2, 128, 0); bunting(W / 2, 128, W + bleed.x + 10, 70, 3);
  ball(c, 'soccer', 300, 600 - Math.abs(Math.sin(T * 3)) * 90, 30, T * 3); ball(c, 'basket', 70, 640 - Math.abs(Math.sin(T * 3 + 1.5)) * 70, 28, T * 2); keeper(c, 320, 500, T, '#1fb6ff');
  logo(195, 225);
  mascot(c, 170, 600, 300, 'wave', T, isSpeaking());
  const p = 1 + Math.sin(T * 4) * 0.06; c.save(); c.translate(195, 760); c.scale(p, p); c.fillStyle = 'rgba(0,0,0,0.18)'; c.beginPath(); c.arc(0, 6, 58, 0, 6.28); c.fill(); c.fillStyle = '#ff2d55'; c.beginPath(); c.arc(0, 0, 58, 0, 6.28); c.fill(); c.lineWidth = 7; c.strokeStyle = '#fff'; c.stroke();
  c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-18, -28); c.lineTo(30, 0); c.lineTo(-18, 28); c.closePath(); c.fill(); c.restore();
  btn('play', 195 - 66, 694, 132, 132, () => { initAudio(); sfx.snap(); go(hasProfiles() ? 'hub' : 'setup'); });
}
/** Sticker art: 10 different die-cut designs for every sport (ball, trophy, team pal, medal, star, the sport's scene, Fizby,
 * number-one badge, heart, pennant), each in that sport's colours, so no two stickers in the book are the same picture. */
const PAL_LOOK = [{ skin: '#f2c29b', hair: '#7a4a2a', style: 'spiky', shoes: '#ffffff', band: '#ffd60a' }, { skin: '#8d5a3b', hair: '#2b1a12', style: 'puffs', shoes: '#ff3b6b', band: '' }, { skin: '#e0ac69', hair: '#1d1427', style: 'curly', shoes: '#1fb6ff', band: '' }];
function stickerArt(x: number, y: number, r: number, sp: number, v: number, t = 0) { const A = ACTS[sp], col = A.bg[0], k = r / 30;
  c.save(); c.translate(x, y); c.rotate(Math.sin(t * 2 + v) * 0.06);
  c.fillStyle = 'rgba(0,0,0,0.16)'; c.beginPath(); c.arc(2, 4, r + 3, 0, 6.28); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(0, 0, r + 3, 0, 6.28); c.fill();
  const g = c.createLinearGradient(0, -r, 0, r); g.addColorStop(0, A.bg[1]); g.addColorStop(1, col); c.fillStyle = g; c.beginPath(); c.arc(0, 0, r - 1, 0, 6.28); c.fill();
  c.save(); c.beginPath(); c.arc(0, 0, r - 1, 0, 6.28); c.clip(); c.scale(k, k);
  if (v === 0) { ball(c, A.ball, 0, 0, 17, 0.3); for (let i = 0; i < 6; i++) star(c, Math.cos(i * 1.05) * 24, Math.sin(i * 1.05) * 24, 3.5, '#fff'); }
  if (v === 1) { trophy(c, 0, 4, 0.62, sp, true, 0); }
  if (v === 2) { setKitCtx(c); kid(0, 26, 0.36, col, 1, 0, 0, String(sp + 1), PAL_LOOK[sp % 3] as KidLook); }
  if (v === 3) { c.fillStyle = '#ff3b6b'; c.beginPath(); c.moveTo(-12, -28); c.lineTo(-2, -6); c.lineTo(2, -6); c.lineTo(12, -28); c.fill(); c.fillStyle = '#ffd60a'; c.beginPath(); c.arc(0, 6, 15, 0, 6.28); c.fill(); c.strokeStyle = '#e0a800'; c.lineWidth = 3; c.stroke(); ball(c, A.ball, 0, 6, 9, 0); }
  if (v === 4) { star(c, 0, 0, 24, '#ffd60a'); ball(c, A.ball, 0, 2, 9, 0); }
  if (v === 5) { c.save(); c.scale(0.5, 0.5); c.translate(-56, -46); cardArt(sp, 0, 0, 112, 112); c.restore(); }
  if (v === 6) { c.restore(); c.save(); mascotBust(c, 0, 2, (r - 4), 0, false, 'cheer'); c.beginPath(); c.arc(0, 0, r - 1, 0, 6.28); c.clip(); c.scale(k, k); }
  if (v === 7) { c.fillStyle = '#fff'; c.beginPath(); for (let q = 0; q < 16; q++) { const rr2 = q % 2 ? 19 : 24; c.lineTo(Math.cos(q * 0.3927) * rr2, Math.sin(q * 0.3927) * rr2); } c.fill(); c.fillStyle = col; c.font = '900 22px ui-rounded, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('1', -5, 1); ball(c, A.ball, 9, 9, 6, 0); }
  if (v === 8) { c.fillStyle = '#ff3b6b'; c.beginPath(); c.moveTo(0, 20); c.bezierCurveTo(-30, 0, -18, -24, 0, -10); c.bezierCurveTo(18, -24, 30, 0, 0, 20); c.fill(); c.lineWidth = 3; c.strokeStyle = '#fff'; c.stroke(); ball(c, A.ball, 0, -2, 8, 0); }
  if (v === 9) { c.fillStyle = '#fff'; c.fillRect(-16, -24, 4, 48); c.fillStyle = col; c.beginPath(); c.moveTo(-12, -24); c.lineTo(22, -14); c.lineTo(-12, -2); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2.5; c.stroke(); ball(c, A.ball, 4, -13, 5, 0); for (let i = 0; i < 3; i++) star(c, -2 + i * 9, 14, 4, '#ffd60a'); }
  c.restore(); c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,0.9)'; c.beginPath(); c.arc(0, 0, r - 1, 0, 6.28); c.stroke(); c.restore(); }
function bookIcon(x: number, y: number, k = 1) { c.save(); c.translate(x, y); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,0.18)'; rr(c, -26, -20, 56, 46, 8); c.fill(); c.fillStyle = '#9b5cff'; rr(c, -28, -24, 56, 46, 8); c.fill(); c.fillStyle = '#fff'; rr(c, -20, -18, 40, 34, 5); c.fill(); stickerArt(0, -1, 12, screen === 'play' ? actI : 0, 0, 0); c.restore(); }
/** Big game (the last level of a sport): a cheering crowd along the top. */
function crowdStrip() { const CR = ['#ff3b6b', '#ffd60a', '#1fb6ff', '#ff9f1c', '#3ddc4a', '#ff5fd2'];
  c.fillStyle = 'rgba(91,75,214,0.85)'; band(c, 100, 46); for (let q = 0; q < 16; q++) { const x = 12 + q * 25, w = Math.max(0, Math.sin(q * 0.6 - T * 4)), y = 124 - w * 8; c.fillStyle = CR[q % 6]; rr(c, x - 8, y + 4, 16, 16, 6); c.fill(); c.fillStyle = '#f6c6a0'; c.beginPath(); c.arc(x, y, 7, 0, 6.28); c.fill(); } }
/** Sport intro card (like F&L introAnim): the sport's picture zooms in on a sunburst, Fizby explains, tap to skip. */
function drawIntro() { const t = intro!.t, A = ACTS[actI], k = Math.min(1, t * 3), out = t > 2.1 ? Math.min(1, (t - 2.1) * 4) : 0;
  c.save(); c.globalAlpha = 1 - out; const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, A.bg[0]); g.addColorStop(1, A.bg[1]); c.fillStyle = g; band(c, 0, H);
  c.save(); c.translate(195, 330); c.rotate(t * 0.4); c.fillStyle = 'rgba(255,255,255,0.25)'; for (let q = 0; q < 12; q++) { c.rotate(0.5236); c.beginPath(); c.moveTo(0, 0); c.lineTo(-40, -520); c.lineTo(40, -520); c.fill(); } c.restore();
  const s = (0.4 + 0.6 * k) * (1 + Math.sin(t * 5) * 0.03) * 2.3; c.save(); c.translate(195, 330); c.scale(s, s); c.fillStyle = '#fff'; rr(c, -56, -56, 112, 112, 28); c.fill(); cardArt(actI, -56, -56, 112, 112); c.restore();
  mascot(c, 120 + (1 - k) * -200, 830, 330, 'stand', T, isSpeaking()); c.restore(); }
function drawOnboard() { const t = onboard, k = Math.min(1, t * 2.5); mascot(c, 319, 612 + (1 - k) * 340, 128, 'point', T, isSpeaking(), true);
  const ph = (t % 1.6) / 1.6; if (t > 0.8) { c.save(); c.translate(104, 214 + (ph < 0.4 ? (0.4 - ph) * 40 : 0)); c.scale(0.6, 0.6); hand(c, 0, 0, ph > 0.4 && ph < 0.6 ? 1 : 0, 1); c.restore(); } }
/** Living stadium behind the hub cards: a crowd doing the wave, flags, bunting, a ball rolling across the grass. */
function stadium() {
  sky(c, '#22d3ee', '#c8f7ff', T, 790, '#3ddc4a', '#2fc23c', false);
  c.fillStyle = '#5b4bd6'; rr(c, -20 - bleed.x, 110, W + 40 + 2 * bleed.x, 520, 40); c.fill(); c.fillStyle = '#7a6af0'; for (let r = 0; r < 9; r++) band(c, 140 + r * 54, 6);
  const CROWD = ['#ff3b6b', '#ffd60a', '#1fb6ff', '#ff9f1c', '#3ddc4a', '#ff5fd2', '#ffffff'];
  for (let r = 0; r < 9; r++) for (let q = -Math.ceil(bleed.x / 28); q < 14 + Math.ceil(bleed.x / 28); q++) { const x = 14 + q * 28 + (r % 2) * 14, wave = Math.max(0, Math.sin(q * 0.5 - T * 3.2 + r * 0.25)), y = 136 + r * 54 - wave * 14;
    c.fillStyle = CROWD[(((q * 3 + r * 5) % 7) + 7) % 7]; rr(c, x - 9, y + 4, 18, 18, 7); c.fill(); c.fillStyle = '#f6c6a0'; c.beginPath(); c.arc(x, y, 8, 0, 6.28); c.fill(); if (wave > 0.6) { c.strokeStyle = '#f6c6a0'; c.lineWidth = 4; c.beginPath(); c.moveTo(x - 9, y + 8); c.lineTo(x - 14, y - 10); c.moveTo(x + 9, y + 8); c.lineTo(x + 14, y - 10); c.stroke(); } }
  for (let i = 0; i < 5; i++) { const x = 20 + i * 87; c.fillStyle = '#fff'; c.fillRect(x, 96, 3, 30); c.fillStyle = CROWD[i]; c.beginPath(); c.moveTo(x + 3, 96); c.quadraticCurveTo(x + 18, 96 + Math.sin(T * 6 + i) * 5, x + 30, 104); c.lineTo(x + 3, 112); c.fill(); }
  }
function drawHub() {
  stadium();
  backBtn(() => go('title')); mascotBust(c, 195, 66, 46, T, isSpeaking(), 'point'); btn('hubMascot', 150, 20, 90, 90, () => { sfx.tap(); say(L.hub); });
  roundBtn('gear', W - 44 + bleed.x, 50, 22, 'rgba(255,255,255,0.5)', (c) => { c.fillStyle = '#7a5a8a'; for (let i = 0; i < 8; i++) { c.save(); c.rotate(i * 0.785); c.fillRect(-3, -14, 6, 8); c.restore(); } c.beginPath(); c.arc(0, 0, 9, 0, 6.28); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(0, 0, 4, 0, 6.28); c.fill(); }, () => { initAudio(); sfx.tap(); openGate(); });
  for (let i = 0; i < ACTS.length; i++) {
    const col = i % 3, row = Math.floor(i / 3), w = 112, h = 112, x = 13 + col * (w + 13), y = 128 + row * (h + 10), lk = false, wig = lockWiggle === i && lockT > 0 ? Math.sin(lockT * 40) * 5 : 0;
    const pk = poke && poke.i === i ? 1 + Math.sin(Math.min(1, poke.t / 0.28) * Math.PI) * 0.12 : 1;
    c.save(); c.translate(wig + x + w / 2, y + h / 2); c.scale(pk, pk); c.translate(-x - w / 2, -y - h / 2); const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, ACTS[i].bg[0]); g.addColorStop(1, ACTS[i].bg[1]); c.fillStyle = 'rgba(0,0,0,0.12)'; rr(c, x, y + 5, w, h, 28); c.fill(); c.fillStyle = g; rr(c, x, y, w, h, 28); c.fill(); c.lineWidth = 6; c.strokeStyle = '#fff'; c.stroke();
    cardArt(i, x, y, w, h);
    if (ACTS[i].levels) for (let k = 0; k < ACTS[i].levels; k++) { const on = save.lv[i] > k; c.fillStyle = on ? '#ffd60a' : 'rgba(255,255,255,0.6)'; c.beginPath(); const sx = x + w / 2 + (k - (ACTS[i].levels - 1) / 2) * 17, sy = y + h - 13; if (clubLocked(k) && !on) { c.fillStyle = 'rgba(60,40,90,0.35)'; } for (let q = 0; q < 10; q++) { const rr2 = q % 2 ? 3 : 7.5; c.lineTo(sx + Math.cos(-1.571 + q * 0.628) * rr2, sy + Math.sin(-1.571 + q * 0.628) * rr2); } c.fill(); }
    if (lk) { c.fillStyle = 'rgba(60,40,90,0.35)'; rr(c, x, y, w, h, 28); c.fill(); lock(x + w / 2, y + h / 2 - 6, 1.4); }
    c.restore();
    btn('act' + i, x, y, w, h, () => { if (poke) return; initAudio(); sfx.snap(); sfx.crowd(); poke = { i, t: 0 }; });
  }
  // Trophy Room button
  const ty = 690, p = 1 + Math.sin(T * 3) * 0.03; c.save(); c.translate(195, ty + 50); c.scale(p, p); c.fillStyle = 'rgba(0,0,0,0.12)'; rr(c, -172, -44, 344, 96, 30); c.fill(); c.fillStyle = '#7c5cff'; rr(c, -172, -48, 344, 96, 30); c.fill(); c.lineWidth = 6; c.strokeStyle = '#fff'; c.stroke();
  for (let k = 0; k < 4; k++) trophy(c, -130 + k * 50, 6, 0.55, save.trophies[k] ?? k, k < save.trophies.length, T); save.stickers.slice(-3).forEach((s, k) => sticker(c, 70 + k * 38, -2 + (k % 2) * 8, 20, Math.floor(s / 10), s % 10, T)); c.restore();
  btn('town', 23, ty + 2, 344, 96, () => { initAudio(); sfx.snap(); go('town'); });
}
function drawPlay() {
  const A = ACTS[actI]; sky(c, A.bg[0], A.bg[1], T, 900, shade(A.bg[1], -0.05), shade(A.bg[1], -0.1), false);
  if (intro) btn('introSkip', 0, 0, W, H, () => { intro = null; });
  act!.draw(c);
  backBtn(() => go('hub'));
  if (!intro && winT < 0 && ACTS[actI].id !== 'paint') roundBtn('help', W - 40 + bleed.x, 122, 24, '#9b5cff', (c) => { c.fillStyle = '#fff'; c.font = '900 30px ui-rounded, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', 0, 2); }, () => { sfx.tap(); tut = 0; idle = 99; resetHint(); if (act?.intro) say(act.intro); mascotPose = 'point'; mascotPoseT = 3; });
  mascotBust(c, 195, 64, 40, T, isSpeaking(), mascotPose); btn('mascot', 150, 20, 90, 90, () => { sfx.tap(); if (act?.intro) say(act.intro); idle = 99; });
  if (A.levels) for (let k = 0; k < A.levels; k++) { c.fillStyle = Math.min(level, A.levels) > k ? '#ffd60a' : 'rgba(255,255,255,0.7)'; c.beginPath(); c.arc(W - 30 + bleed.x - (A.levels - 1 - k) * 18, 62, 7, 0, 6.28); c.fill(); }
  if (!intro && winT < 0) roundBtn('restart', W - 96 + bleed.x, 122, 24, '#ff9f1c', (c) => { c.strokeStyle = '#fff'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.arc(0, 0, 10, -0.3, 4.6); c.stroke(); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(8, -14); c.lineTo(14, -2); c.lineTo(2, -4); c.fill(); }, () => { sfx.whoosh(); start(actI, level); });
  for (const q of pops) { const k = q.t / 0.9; c.save(); c.globalAlpha = Math.max(0, 1 - k); star(c, q.x, q.y - 30 - k * 70, 16 + k * 6); c.restore(); }
  if (winT >= 0) { const k = Math.min(1, winT * 3); c.fillStyle = `rgba(255,255,255,${0.72 * k})`; band(c, 0, H); }
  if (winT >= 0) for (let i = 0; i < 3; i++) { const k = Math.max(0, Math.min(1, (winT - 0.3 - i * 0.25) * 4)); if (k <= 0) continue; const sc = k < 1 ? 1.4 - 0.4 * k : 1; c.save(); c.globalAlpha = i < winStars ? 1 : 0.3; star(c, 135 + i * 60, 230 - (i === 1 ? 14 : 0), 26 * sc, i < winStars ? '#ffd60a' : '#ffffff'); c.restore(); }
  if (tut >= 0) { c.fillStyle = `rgba(40,20,80,${0.35 * Math.min(1, tut * 4, (4.5 - tut) * 2)})`; band(c, 140, H - 140); }
  if (intro) drawIntro();
  if (winT >= 0) { const k = Math.min(1, winT * 3); mascot(c, 195, 844 - 30 + (1 - k) * 300, 230, 'cheer', T, isSpeaking()); if (newSticker >= 0) { bookIcon(48, 792, 1 + (winT > 2.3 && winT < 2.6 ? Math.sin((winT - 2.3) / 0.3 * Math.PI) * 0.25 : 0)); const s = Math.min(1, winT * 2), f = Math.max(0, Math.min(1, (winT - 1.7) / 0.6)), e = f * f * (3 - 2 * f);
    if (f < 1) stickerArt(160 + (48 - 160) * e, 420 + (792 - 420) * e - Math.sin(e * Math.PI) * 120, (30 + 50 * s) * (1 - e * 0.7), Math.floor(newSticker / 10), newSticker % 10, T); } }
  if (isBig() && winT < 0) crowdStrip();
}
let setupFace = 0, setupBand: Band = '4-5';
/** First launch: Fizby asks who is playing. Pick your ball and your age (pictures and numbers only), then the big check. */
function drawSetup() {
  sky(c, '#22d3ee', '#c8f7ff', T, 760, '#3ddc4a', '#2fc23c', false); mascot(c, 300, 330, 230, 'point', T, isSpeaking(), true);
  btn('setupGo', 195 - 60, 690, 120, 120, () => { saveFirst(setupFace, setupBand); applyTuning(); sfx.yay(); go('hub'); }); // registered first: the obvious next step
  const p = 1 + Math.sin(T * 4) * 0.05; c.save(); c.translate(195, 750); c.scale(p, p); c.fillStyle = 'rgba(0,0,0,0.18)'; c.beginPath(); c.arc(0, 6, 56, 0, 6.28); c.fill(); c.fillStyle = '#3ddc4a'; c.beginPath(); c.arc(0, 0, 56, 0, 6.28); c.fill(); c.lineWidth = 7; c.strokeStyle = '#fff'; c.stroke();
  c.strokeStyle = '#fff'; c.lineWidth = 12; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-24, 2); c.lineTo(-6, 20); c.lineTo(26, -18); c.stroke(); c.restore();
  const FACE: BallKind[] = ['soccer', 'basket', 'tennis'];
  FACE.forEach((k, i) => { const x = 85 + i * 110, y = 430, on = i === setupFace; c.fillStyle = on ? '#fff' : 'rgba(255,255,255,0.45)'; c.beginPath(); c.arc(x, y, on ? 48 : 42, 0, 6.28); c.fill(); if (on) { c.lineWidth = 6; c.strokeStyle = '#7b4fd6'; c.stroke(); }
    ball(c, k, x, y - (on ? Math.abs(Math.sin(T * 5)) * 6 : 0), on ? 32 : 28, on ? T * 2 : 0); btn('setupKid' + i, x - 50, y - 50, 100, 100, () => { setupFace = i; sfx.pop(); }); });
  (['2-3', '4-5', '6+'] as Band[]).forEach((bd, i) => { const x = 30 + i * 115, y = 540, on = bd === setupBand; c.fillStyle = on ? '#7b4fd6' : '#ffffff'; rr(c, x, y, 100, 90, 22); c.fill();
    text(['3', '4', '5 6'][i], x + 50, y + 34, i === 2 ? 30 : 38, on ? '#fff' : INK, 'center', 900); for (let k = 0; k < [3, 4, 6][i]; k++) { c.fillStyle = on ? '#ffd60a' : '#ffb703'; c.beginPath(); c.arc(x + 50 + (k - ([3, 4, 6][i] - 1) / 2) * 13, y + 70, 5, 0, 6.28); c.fill(); }
    btn('setupAge' + i, x, y, 100, 90, () => { setupBand = bd; sfx.pop(); }); });
}
let bookPage = -1;
function drawTown() {
  c.fillStyle = '#7c5cff'; band(c, 0, H); backBtn(() => go('hub')); mascotBust(c, 195, 66, 42, T, isSpeaking(), 'cheer');
  c.fillStyle = '#b07a3a'; rr(c, 16, 205, W - 32, 14, 6); c.fill(); rr(c, 16, 305, W - 32, 14, 6); c.fill(); for (let k = 0; k < ACTS.length; k++) { const x = 40 + (k % 6) * 62 + (k >= 6 ? 31 : 0), ty2 = k < 6 ? 170 : 270; trophy(c, x, ty2, 0.72, k, save.trophies.includes(k), T); btn('trophy' + k, x - 28, ty2 - 40, 56, 76, () => { sfx.ding(); say(SPORT_NAME[k]); }); }
  // Sticker Book (F&L stickers.ts style): one page per sport, earned stickers in colour, missing ones as silhouettes to collect
  if (bookPage < 0) bookPage = save.stickers.length ? Math.floor(save.stickers[save.stickers.length - 1] / 10) : 0;
  const P = bookPage, have = new Set(save.stickers); c.fillStyle = '#fff'; rr(c, 16, 335, W - 32, 420, 24); c.fill(); c.fillStyle = ACTS[P].bg[0]; rr(c, 16, 335, W - 32, 70, 24); c.fill(); c.fillRect(16, 380, W - 32, 25);
  c.save(); c.translate(195 - 56 * 0.55, 370 - 56 * 0.55); c.scale(0.55, 0.55); cardArt(P, 0, 0, 112, 112); c.restore();
  const got = Array.from({ length: 10 }, (_, v) => have.has(P * 10 + v)).filter(Boolean).length; for (let k = 0; k < 10; k++) { c.fillStyle = k < got ? '#ffd60a' : 'rgba(255,255,255,0.6)'; c.beginPath(); c.arc(270 + (k % 5) * 18, 358 + Math.floor(k / 5) * 18, 6, 0, 6.28); c.fill(); }
  for (let v = 0; v < 10; v++) { const x = 60 + (v % 5) * 68, y = 462 + Math.floor(v / 5) * 120, on = have.has(P * 10 + v);
    if (on) { stickerArt(x, y, 30, P, v, T + v); btn('st' + v, x - 32, y - 32, 64, 64, () => { sfx.sticker(); say(SPORT_NAME[P]); }); }
    else { c.save(); c.globalAlpha = 0.22; c.filter = 'grayscale(1) brightness(0.4)'; stickerArt(x, y, 30, P, v, 0); c.restore(); c.fillStyle = '#ffffff'; c.font = '900 22px ui-rounded, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', x, y + 2); } }
  for (let k = 0; k < ACTS.length; k++) { const x = 30 + k * 33, y = 790, on = k === P; c.fillStyle = on ? '#fff' : 'rgba(255,255,255,0.35)'; c.beginPath(); c.arc(x, y, on ? 17 : 14, 0, 6.28); c.fill(); ball(c, ACTS[k].ball, x, y, on ? 11 : 9, 0);
    btn('page' + k, x - 16, y - 22, 32, 44, () => { if (bookPage !== k) { bookPage = k; sfx.flip(); } }); }
  return 0;
}
let townMax = 0;
// ---- grown-ups ----
let gate = { hold: 0, q: [0, 0], opts: [] as number[], asked: false, pressing: false };
function openGate() { const a = 2 + Math.floor(Math.random() * 6), b = 2 + Math.floor(Math.random() * 6), r = a + b, o = new Set([r]); while (o.size < 3) o.add(Math.max(2, r + Math.floor(Math.random() * 7) - 3)); gate = { hold: 0, q: [a, b], opts: [...o].sort(() => Math.random() - 0.5), asked: false, pressing: false }; modal = { kind: 'gate' }; }
let resetHold = 0, resetPress = false;
function drawParents() {
  c.fillStyle = '#f4f1ff'; band(c, 0, H); backBtn(() => go('hub'));
  text('For grown-ups', 195, 62, 26); const P = profiles(), me = current();
  // ---- children (up to 3), each with an age band that tunes hints and touch slack ----
  let y = 96; c.fillStyle = '#fff'; rr(c, 16, y, W - 32, 128, 20); c.fill();
  P.list.forEach((pr, i) => { const x = 28 + i * 86, on = i === P.cur; c.fillStyle = on ? '#e3d9ff' : '#f6f3ff'; rr(c, x, y + 10, 78, 62, 14); c.fill(); if (on) { c.lineWidth = 3; c.strokeStyle = '#7b4fd6'; rr(c, x, y + 10, 78, 62, 14); c.stroke(); }
    ball(c, pr.face as BallKind, x + 39, y + 32, 15, 0); text(pr.name, x + 39, y + 60, 11.5, INK, 'center', 800);
    btn('kid' + i, x, y + 10, 78, 62, () => { sfx.tap(); if (i === P.cur) { setFace(i); } else pickChild(i); }); });
  if (P.list.length < 3) { const x = 28 + P.list.length * 86; c.fillStyle = '#f6f3ff'; rr(c, x, y + 10, 78, 62, 14); c.fill(); text('+', x + 39, y + 40, 30, '#7b4fd6'); btn('kidAdd', x, y + 10, 78, 62, () => { sfx.tap(); const n = addProfile(); if (n >= 0) pickChild(n); }); }
  text('Name', 330, y + 40, 13, '#1f7ae0'); btn('kidName', 286, y + 16, 84, 50, () => { const n = window.prompt('Child name', me.name); if (n) rename(P.cur, n); });
  (['2-3', '4-5', '6+'] as Band[]).forEach((bd, i) => { const x = 28 + i * 112, on = me.band === bd; c.fillStyle = on ? '#7b4fd6' : '#efe9ff'; rr(c, x, y + 78, 104, 46, 12); c.fill(); text(tuning(bd).label, x + 52, y + 101, 14, on ? '#fff' : INK);
    btn('band' + bd, x, y + 78, 104, 46, () => { sfx.tap(); setBand(P.cur, bd); applyTuning(); }); });
  // ---- Club ----
  y = 234; c.fillStyle = '#fff'; rr(c, 16, y, W - 32, 300, 20); c.fill();
  text(CLUB_NAME, 195, y + 26, 21, '#7b4fd6'); text(hasClub() ? 'Everything is unlocked. Thank you!' : 'Unlock every level of every sport', 195, y + 50, 13.5, '#5a4a6e', 'center', 600);
  const plans: [Plan, string, string][] = [['yearly', `${store.prices.yearly} per year`, store.trial.yearly ? '7-day free trial, then auto-renews yearly' : 'Auto-renews yearly'], ['monthly', `${store.prices.monthly} per month`, store.trial.monthly ? '7-day free trial, then auto-renews monthly' : 'Auto-renews monthly'], ['forever', `${store.prices.forever} once`, 'Own it forever, no subscription']];
  plans.forEach(([p, price, sub], i) => { const by = y + 66 + i * 68; c.fillStyle = store.ent.plan === p ? '#d9ffd0' : '#efe9ff'; rr(c, 30, by, W - 60, 60, 16); c.fill(); text(price, 46, by + 21, 19, INK, 'left', 900); text(sub, 46, by + 43, 12.5, '#5a4a6e', 'left', 600); btn('buy-' + p, 30, by, W - 60, 60, () => { sfx.tap(); void buy(p); }); });
  const ly = y + 284; text('Restore', 70, ly, 15, '#1f7ae0'); btn('restore', 20, ly - 22, 95, 44, () => void restore()); text('Manage', 160, ly, 15, '#1f7ae0'); btn('manage', 115, ly - 22, 90, 44, () => void manage());
  text('Terms', 240, ly, 15, '#1f7ae0'); btn('terms', 207, ly - 22, 66, 44, () => openLink(TERMS_URL)); text('Privacy', 315, ly, 15, '#1f7ae0'); btn('privacy', 275, ly - 22, 95, 44, () => openLink(PRIVACY_URL));
  if (store.msg) text(store.msg, 195, y + 262, 12, '#2a8a2a', 'center', 700);
  // ---- this child's progress ----
  y = 544; c.fillStyle = '#fff'; rr(c, 16, y, W - 32, 150, 20); c.fill(); text(`What ${me.name} practiced`, 195, y + 22, 16); const sk = Object.entries(save.skills).sort((a, b) => b[1] - a[1]).slice(0, 5);
  text(`${save.trophies.length} trophies  ·  ${save.stickers.length} stickers`, 195, y + 42, 12, '#7a6a8e', 'center', 700);
  if (!sk.length) text('Nothing yet. Play an activity!', 195, y + 90, 14, '#5a4a6e', 'center', 600);
  sk.forEach(([n, v], i) => { const yy = y + 64 + i * 19; text(n, 34, yy, 12.5, INK, 'left', 700); c.fillStyle = '#eee'; rr(c, 190, yy - 6, 160, 12, 6); c.fill(); c.fillStyle = '#3ddc4a'; rr(c, 190, yy - 6, Math.max(12, 160 * Math.min(1, v / 30)), 12, 6); c.fill(); });
  // ---- settings ----
  y = 706; const BAR = (n: number) => '▮'.repeat(n) + '▯'.repeat(3 - n);
  const set = (id: string, x: number, label: string, val: string, fn: () => void) => { c.fillStyle = '#fff'; rr(c, x, y, 82, 66, 16); c.fill(); text(label, x + 41, y + 22, 12.5, '#5a4a6e', 'center', 700); text(val, x + 41, y + 46, 15); btn(id, x, y, 82, 66, () => { fn(); saveSettings(); sfx.tap(); }); };
  set('music', 16, 'Music', BAR(settings.musicVol), () => cycleVol('musicVol')); set('sfx', 106, 'Sounds', BAR(settings.sfxVol), () => cycleVol('sfxVol'));
  set('voice', 196, 'Voice', settings.voice ? 'On' : 'Off', () => { settings.voice = !settings.voice; });
  c.fillStyle = '#fff'; rr(c, 286, y, 88, 66, 16); c.fill(); if (resetHold > 0) { c.fillStyle = '#ffd0d0'; rr(c, 286, y, 88 * Math.min(1, resetHold / 3), 66, 16); c.fill(); } text('Hold to', 330, y + 24, 12.5, '#c0392b'); text('reset', 330, y + 44, 14, '#c0392b');
  btn('reset', 286, y, 88, 66, () => { resetPress = true; });
  text('No ads. No tracking. No data leaves this device.', 195, 800, 12, '#7a6a8e', 'center', 600);
}
function drawModal() {
  if (!modal) return;
  if (modal.kind === 'unlock') { const m = modal; m.t += 1 / 60; c.fillStyle = 'rgba(40,20,80,0.55)'; band(c, 0, H);
    const k = Math.min(1, m.t * 2.5), s = 0.5 + 0.5 * k + Math.sin(m.t * 5) * 0.03; c.save(); c.translate(195, 380); c.scale(s, s); c.rotate(m.t * 0.3);
    c.fillStyle = 'rgba(255,230,90,0.5)'; for (let i = 0; i < 12; i++) { c.rotate(0.5236); c.beginPath(); c.moveTo(0, 0); c.lineTo(-24, -230); c.lineTo(24, -230); c.fill(); } c.restore();
    c.save(); c.translate(195, 380); c.scale(s * 2.2, s * 2.2); trophy(c, 0, 0, 1.2, m.sport, true, T); c.restore();
    mascot(c, 90, 760, 230, 'cheer', T, isSpeaking()); if (m.t < 0.1) burst(195, 380, 50);
    btn('unlockOk', 0, 0, W, H, () => { if (m.t > 0.8) { modal = null; afterWin(); } }); if (m.t > 4) { modal = null; afterWin(); } return; }
  // gate: hold, then a sum (grown-up reading required)
  c.fillStyle = 'rgba(40,20,80,0.7)'; band(c, 0, H); c.fillStyle = '#fff'; rr(c, 30, 210, W - 60, 420, 28); c.fill(); text('Grown-ups only', 195, 250, 22);
  if (!gate.asked) { text('Press and hold for 3 seconds', 195, 300, 16, '#5a4a6e', 'center', 700); if (gate.pressing) { gate.hold += 1 / 60; if (gate.hold >= 3) { gate.asked = true; gate.pressing = false; sfx.snap(); } } else gate.hold = 0;
    lock(195, 430, 1.6); c.beginPath(); c.arc(195, 430, 70, -1.571, -1.571 + Math.min(1, gate.hold / 3) * 6.28); c.lineWidth = 10; c.lineCap = 'round'; c.strokeStyle = '#3ddc4a'; c.stroke(); btn('gateHold', 125, 360, 140, 140, () => { gate.pressing = true; }); }
  else { text(`${gate.q[0]} + ${gate.q[1]} = ?`, 195, 340, 40, INK, 'center', 900); gate.opts.forEach((v, i) => { c.fillStyle = '#e8f6ff'; c.beginPath(); c.arc(95 + i * 100, 460, 40, 0, 6.28); c.fill(); text(String(v), 95 + i * 100, 462, 28);
      btn('gateA' + i, 55 + i * 100, 420, 80, 80, () => { if (v === gate.q[0] + gate.q[1]) { sfx.snap(); modal = null; go('parents'); } else { sfx.wrong(); modal = null; } }); }); }
  text('Close', 195, 595, 16, '#1f7ae0'); btn('gateX', 135, 575, 120, 40, () => { sfx.tap(); modal = null; });
}
function afterWin() { if (screen !== 'play') return; const A = ACTS[actI]; if (A.levels) start(actI); }
// ---- loop ----
let last = performance.now();
let raf = 0, lastTick = performance.now(), stalls = 0;
/** rAF can stall (busy device, webview hiccup); a slow interval keeps the game ticking so nothing freezes mid-turn. */
setInterval(() => { if (!document.hidden && performance.now() - lastTick > 400) { stalls++; if (raf) cancelAnimationFrame(raf); raf = 0; frame(performance.now()); } }, 250);
function frame(now: number) {
  raf = 0; lastTick = performance.now(); if (now < last) now = last;
  const dt = Math.min(0.25, (now - last) / 1000); last = now; // slow/starved frames still advance real time (physics runs in 1/120 s substeps) T += dt; if (!raf) raf = requestAnimationFrame(frame);
  fadeT += dt; for (let i = pops.length - 1; i >= 0; i--) { pops[i].t += dt; if (pops[i].t > 0.9) pops.splice(i, 1); } if (intro) { intro.t += dt; idle = 0; if (intro.t > 2.4) intro = null; } if (tut >= 0) { tut += dt; if (tut > 4.5) tut = -1; } if (onboard >= 0) onboard += dt;
  if (poke) { poke.t += dt; if (poke.t > 0.3) { const i = poke.i; poke = null; if (screen === 'hub') start(i, save.lv[i], true); } }
  if (lockT > 0) lockT -= dt; if (mascotPoseT > 0) { mascotPoseT -= dt; if (mascotPoseT <= 0) mascotPose = 'stand'; } if (shake > 0) shake = Math.max(0, shake - dt * 30);
  if (screen === 'play' && act) { { const n = Math.ceil(dt / (1 / 120)); for (let k = 0; k < n && act; k++) act.update(dt / n); } // fixed small physics steps: the same shot rolls the same on a slow device
    if (winT >= 0) { const w0 = winT; winT += dt; if (w0 < 1.9 && winT >= 1.9 && newSticker >= 0) { voiceSay(L.sticker); sfx.pop(); } if (w0 < 2.3 && winT >= 2.3 && newSticker >= 0) sfx.stickerIn(); if (winT > 3.2 && !modal) { winT = -1; if (!checkUnlock()) afterWin(); } }
    else if (!modal) { idle += dt; if (act.busy?.()) { idle = 0; busyT += dt; if (busyT > 12) { busyT = 0; heals++; const lv = level; start(actI, lv); return; } } else busyT = 0; const cur = act; stepHint(dt, idle, () => cur.next(), () => { if (cur.intro) { say(cur.intro, false); mascotPose = 'point'; mascotPoseT = 2.5; } });
      demo = hint.active && hint.act ? { a: hint.act, t: hint.t } : null; if (idle > 12 && mascotPoseT <= 0) mascotPose = 'think'; } }
  if (resetPress && pointerIsDown) { resetHold += dt; if (resetHold > 3) { resetPress = false; resetHold = 0; save = fresh(); persist(); sfx.crash(); } } else { resetHold = 0; resetPress = false; }
  for (const p of parts) { p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.99; p.life -= dt; } for (let i = parts.length - 1; i >= 0; i--) if (parts[i].life <= 0) parts.splice(i, 1);
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#ffe14d'; c.fillRect(0, 0, cv.width, cv.height);
  const sx = shake ? (Math.random() - 0.5) * shake : 0, sy = shake ? (Math.random() - 0.5) * shake : 0; c.setTransform(scale, 0, 0, scale, ox + sx * scale, oy + sy * scale);
  frameBtns = [];
  if (screen === 'title') drawTitle(); else if (screen === 'setup') drawSetup(); else if (screen === 'hub') drawHub(); else if (screen === 'play' && act) drawPlay(); else if (screen === 'town') townMax = drawTown(); else if (screen === 'parents') drawParents();
  if (screen === 'hub' && onboard >= 0) drawOnboard(); confettiDraw(c, parts); if (fadeT < 0.25) { c.fillStyle = `rgba(255,255,255,${1 - fadeT / 0.25})`; band(c, 0, H); } if (screen === 'play' && act && winT < 0 && !modal) drawHint(T, idle); if (modal) { frameBtns = frameBtns.filter(() => false); drawModal(); }
  btns = frameBtns;
}
// ---- input: one finger at a time; leaving the screen or a cancelled touch counts as letting go ----
let pointerId: number | null = null, pointerIsDown = false, lastPtr = 0;
const toLogical = (e: PointerEvent): Pt => { const r = cv.getBoundingClientRect(); return { x: Math.max(-bleed.x, Math.min(W + bleed.x, ((e.clientX - r.left) * dpr - ox) / scale)), y: Math.max(-bleed.y, Math.min(H + bleed.y, ((e.clientY - r.top) * dpr - oy) / scale)) }; };
cv.addEventListener('pointerdown', e => {
  if (pointerId !== null) { // a second finger: ignore it, unless the first one went quiet (a lost touch end must never freeze input)
    if (performance.now() - lastPtr < 600) return; const old = pointerId; release({ pointerId: old, clientX: e.clientX, clientY: e.clientY } as PointerEvent); }
  pointerId = e.pointerId; lastPtr = performance.now(); pointerIsDown = true; try { cv.setPointerCapture(e.pointerId); } catch { /* */ } initAudio();
  const p = toLogical(e); if (onboard > 0.6) onboard = -1; idle = 0; demo = null; resetHint(); if (mascotPose === 'think') mascotPose = 'stand'; if (performance.now() - screenAt < 180) return; // a tap that lands as the screen changes must not hit the new screen's buttons
  const b = [...btns].reverse().find(b => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h);
  if (b && !(screen === 'play' && b.id !== 'back' && b.id !== 'mascot' && !modal && act && hitAct(p))) { b.fn(); if (screen === 'town') townDrag = null; return; }
  if (screen === 'play' && act && winT < 0 && !modal) act.down(p);
  if (screen === 'town') townDrag = { x: p.x, sx: townX, moved: false };
});
function hitAct(p: Pt) { void p; return false; }
function release(e: PointerEvent) { if (e.pointerId !== pointerId) return; pointerId = null; pointerIsDown = false; const p = toLogical(e); if (screen === 'play' && act) act.up(p); townDrag = null; gate.pressing = false; resetPress = false; }
cv.addEventListener('pointermove', e => { if (e.pointerId !== pointerId) return; lastPtr = performance.now(); const p = toLogical(e); if (screen === 'play' && act && winT < 0) act.move(p); if (townDrag) { townX = Math.max(0, Math.min(townMax, townDrag.sx - (p.x - townDrag.x))); } });
cv.addEventListener('pointerup', release); cv.addEventListener('pointercancel', release); cv.addEventListener('lostpointercapture', e => { if (e.pointerId === pointerId) release(e); });
addEventListener('blur', () => { if (pointerId !== null && act) act.up({ x: 0, y: 0 }); pointerId = null; pointerIsDown = false; });
// backgrounding: audio.ts suspends and resumes the whole audio context
document.title = GAME_TITLE;
// offline: the web build registers dist/sw.js (made by scripts/precache.mjs). The iOS app bundles its files, so it needs none.
if ('serviceWorker' in navigator && location.protocol.startsWith('http') && !(window as any).Capacitor?.isNativePlatform?.()) navigator.serviceWorker.register('./sw.js').catch(() => { /* */ });
 void initStore(); raf = requestAnimationFrame(frame); setTimeout(() => { if (screen === 'title') say(L.title, false); }, 600);
// ---- test hooks ----
/** Store art, drawn with the game's own art code (scripts/icons.mjs saves it): 'icon' = 1024 full-bleed square, 'splash' = 2732 square launch art. */
function renderArt(kind: 'icon' | 'splash') {
  const N = kind === 'icon' ? 1024 : 2732, cv2 = document.createElement('canvas'); cv2.width = cv2.height = N; const g = cv2.getContext('2d')!; const k = N / 390; g.scale(k, k);
  if (kind === 'icon') { const bg = g.createLinearGradient(0, 0, 0, 390); bg.addColorStop(0, '#22d3ee'); bg.addColorStop(1, '#1e8fff'); g.fillStyle = bg; g.fillRect(0, 0, 390, 390); field(g, 270, '#3ddc4a');
    star(g, 60, 70, 30); star(g, 330, 80, 26, '#ff5fd2'); ball(g, 'basket', 300, 250, 60, 0.4); ball(g, 'soccer', 110, 270, 70, 0.2); trophy(g, 205, 170, 2.2, 0, true, 0); }
  else { g.translate(0, -290); sky(g, '#22d3ee', '#c8f7ff', 0, 520, '#3ddc4a', '#2fc23c'); field(g, 520, '#3ddc4a'); ball(g, 'soccer', 300, 560, 30, 0); mascot(g, 170, 600, 300, 'wave', 0.5, false); }
  return cv2.toDataURL('image/png');
}
(window as any).__snap = { renderArt,
  get screen() { return screen; }, get audio() { return { ...audioStats, track: audioStats.track, ctx: audioStats.ctx }; }, get winStars() { return winStars; }, get hintDelay() { return hintCfg.delay; }, get slack() { return tune.slack; }, get kid() { return profiles().cur; }, get act() { return actI; }, get level() { return level; }, get winT() { return winT; }, get modal() { return modal ? modal.kind : null; }, levels: ACTS.map(a => a.levels), get freeRemix() { return freeRemix; }, get demo() { return demo ? demo.a : null; },
  buttons: () => btns.map(b => ({ id: b.id, x: b.x, y: b.y, w: b.w, h: b.h })), next: () => act?.next() ?? null, busy: () => !!intro || !!poke || !!act?.busy?.(), get heals() { return heals; }, get busyT() { return busyT; }, get dbg() { return { screen, act: !!act, winT, modal: !!modal, poke: !!poke, intro: !!intro, ab: !!act?.busy?.() }; }, get stalls() { return stalls; }, get T() { return T; }, get intro() { return !!intro; }, get onboard() { return onboard; },
  toScreen: (x: number, y: number) => { const r = cv.getBoundingClientRect(); return { x: r.left + (ox + x * scale) / dpr, y: r.top + (oy + y * scale) / dpr }; },
  start: (i: number, l: number) => start(i, l), go, save: () => JSON.parse(JSON.stringify(save)), setSave: (s: Save) => { save = s; persist(); }, closeModal: () => { modal = null; afterWin(); },
  store: () => ({ club: hasClub(), sim: store.sim, msg: store.msg }), storeTest, products: PRODUCTS, lines: allLines, lineId, missing: () => [...missing], get gate() { return { ...gate }; },
};
