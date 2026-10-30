import { createRecordedVoicePlayer } from './voicePlayback';
import { lineId } from './voice';
// Shared with Fizby's Fun & Learn (src/audio.ts there). Sound = recorded CC0 samples + offline-synthesized clips in public/audio (see docs/LICENSES.md), with the live
// Web Audio synth below as an instant fallback while they load. Music = per-category loops from public/audio/music.
let ctx: AudioContext | null = null, master: GainNode, musicGain: GainNode, sfxGain: GainNode, duckGain: GainNode, sfxDuck: GainNode;
/** sfxVol / musicVol: 0 (off) .. 3 (loud). `sound` / `music` mirror "> 0" for older saves and callers. */
export const settings = { sound: true, music: true, voice: true, sfxVol: 3, musicVol: 2 };
const LEVEL = [0, 0.4, 0.7, 1], MUSIC_MAX = 0.42;

// iOS: Web Audio is silenced by the ring/silent switch unless the page's audio session is "playback".
// Safari 17+ exposes navigator.audioSession; older iOS switches category when an <audio> element plays.
let unlockEl: HTMLAudioElement | null = null;
function iosUnlock() {
  const nav = navigator as any; try { if (nav.audioSession) nav.audioSession.type = 'playback'; } catch { }
  if (!unlockEl) { unlockEl = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAACAgICA'); unlockEl.loop = true; unlockEl.volume = 0.01; (unlockEl as any).playsInline = true; }
  unlockEl.play().catch(() => { });
}
function resumeOnGesture() { iosUnlock(); if (ctx && ctx.state !== 'running' && !document.hidden) ctx.resume().catch(() => { }); }
['pointerdown', 'touchend', 'click', 'keydown'].forEach(e => window.addEventListener(e, resumeOnGesture, { capture: true, passive: true }));
// Pause everything (music too) while the app is in the background; pick up again when it comes back.
document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) ctx.suspend().catch(() => { }); else if (ctx.state !== 'running') ctx.resume().catch(() => { }); });
export function initAudio() {
  iosUnlock();
  if (ctx) { if (ctx.state !== 'running') ctx.resume().catch(() => { }); return; }
  const AC = (window as any).AudioContext || (window as any).webkitAudioContext; if (!AC) return;
  ctx = new AC() as AudioContext; if (ctx.state !== 'running') ctx.resume().catch(() => { }); master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination);
  sfxDuck = ctx.createGain(); sfxDuck.connect(master); sfxGain = ctx.createGain(); sfxGain.connect(sfxDuck); duckGain = ctx.createGain(); duckGain.connect(master); musicGain = ctx.createGain(); musicGain.gain.value = 0; musicGain.connect(duckGain);
  applySettings(); loadSamples(); loadVoice(); if (wantTrack) setTrack(wantTrack);
  // iOS housekeeping: when the app is backgrounded (home screen, app switch, phone call) ALL sound stops —
  // music must never keep playing over the home screen — and it resumes cleanly when the app comes back.
  document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) { ctx.suspend().catch(() => { }); } else if (settings.voice || settings.music || settings.sound) ctx.resume().catch(() => { }); });
}
export function applySettings() {
  settings.sfxVol = Math.max(0, Math.min(3, settings.sfxVol ?? (settings.sound ? 3 : 0))); settings.musicVol = Math.max(0, Math.min(3, settings.musicVol ?? (settings.music ? 2 : 0)));
  settings.sound = settings.sfxVol > 0; settings.music = settings.musicVol > 0;
  if (!ctx) return; if (!settings.voice) stopVoice(true); const t = ctx.currentTime;
  sfxGain.gain.setTargetAtTime(LEVEL[settings.sfxVol], t, 0.03); musicGain.gain.setTargetAtTime(LEVEL[settings.musicVol] * MUSIC_MAX, t, 0.08);
  if (settings.musicVol > 0 && wantTrack && curTrack !== wantTrack) setTrack(wantTrack);
}
/** Settings buttons: step a volume 0 -> 1 -> 2 -> 3 -> 0. */
export function cycleVol(k: 'sfxVol' | 'musicVol') { settings[k] = (settings[k] + 1) % 4; applySettings(); }

// ---------- samples ----------
type Entry = { file: string; loopStart?: number; loopEnd?: number };
const bufs = new Map<string, AudioBuffer>(), sfxMeta: Record<string, Entry> = {}, musicMeta: Record<string, Entry> = {};
let samplesLoading = false;
async function decode(url: string, e?: Entry) {
  const b = await ctx!.decodeAudioData(await (await fetch(url)).arrayBuffer());
  if (e?.loopStart !== undefined && e.loopEnd !== undefined) smoothSeam(b, e.loopStart, e.loopEnd);
  return b;
}
// The file holds a little wrapped audio either side of the loop, so blending the last 12 ms before loopEnd into the
// audio just before loopStart makes the wrap sample-exact whatever padding the decoder added.
function smoothSeam(b: AudioBuffer, ls: number, le: number) {
  const W = Math.floor(b.sampleRate * 0.012), s = Math.floor(ls * b.sampleRate), e = Math.floor(le * b.sampleRate); if (s < W || e > b.length) return;
  for (let c = 0; c < b.numberOfChannels; c++) { const d = b.getChannelData(c); for (let k = 0; k < W; k++) { const a = k / W; d[e - W + k] = d[e - W + k] * (1 - a) + d[s - W + k] * a; } }
}
async function loadSamples() {
  if (!ctx || samplesLoading) return; samplesLoading = true;
  try { Object.assign(sfxMeta, await (await fetch('./audio/sfx.json')).json()); Object.assign(musicMeta, await (await fetch('./audio/music.json')).json()); } catch { return; }
  if (wantTrack) setTrack(wantTrack);
  const names = Object.keys(sfxMeta); let i = 0;
  const worker = async () => { while (i < names.length) { const n = names[i++]; try { bufs.set(n, await decode('./audio/' + sfxMeta[n].file, sfxMeta[n])); } catch { /* keep synth fallback */ } } };
  await Promise.all([worker(), worker(), worker()]);
}
/** Plays a named sample (public/audio/sfx.json). Returns false if it isn't loaded yet, so callers can fall back to synth. */
export function play(name: string, vol = 1, rate = 1, when = 0): boolean {
  if (!ctx || ctx.state !== 'running' || !settings.sfxVol) return !!ctx; const b = bufs.get(name); if (!b) return false;
  const s = ctx.createBufferSource(), g = ctx.createGain(); s.buffer = b; s.playbackRate.value = rate; g.gain.value = vol; s.connect(g); g.connect(sfxGain); s.start(ctx.currentTime + when); lastSfx = performance.now(); return true;
}
const vary = (r = 0.04) => 1 + (Math.random() * 2 - 1) * r;
// Every touch gets a sound: if a tap didn't trigger anything else within ~90 ms, play a soft little tap.
let lastSfx = 0;
window.addEventListener('pointerdown', () => { const t0 = performance.now(); setTimeout(() => { if (lastSfx < t0) play('tap', 0.35, vary(0.08)); }, 90); }, { capture: true, passive: true });
// Held loops (engine, siren, hose, sizzle, whisk, purr...): call hold() every frame while the sound should play;
// it fades out by itself ~0.2 s after the calls stop, so games never have to clean up.
const held = new Map<string, { src: AudioBufferSourceNode; g: GainNode; last: number; keep: number }>();
export function hold(name: string, vol = 1, rate = 1, keepMs = 200) {
  if (!ctx || ctx.state !== 'running') return; const b = bufs.get(name), e = sfxMeta[name]; if (!b || !e) return; const t = ctx.currentTime;
  let h = held.get(name);
  if (!h) { const src = ctx.createBufferSource(), g = ctx.createGain(); src.buffer = b; src.loop = true; src.loopStart = e.loopStart || 0; src.loopEnd = e.loopEnd || b.duration;
    g.gain.value = 0; src.connect(g); g.connect(sfxGain); src.start(t, e.loopStart || 0); h = { src, g, last: 0, keep: 200 }; held.set(name, h); }
  h.last = performance.now(); h.keep = keepMs; h.g.gain.setTargetAtTime(vol, t, 0.05); h.src.playbackRate.setTargetAtTime(rate, t, 0.08);
}
setInterval(() => { if (!ctx) return; const now = performance.now();
  held.forEach((h, k) => { if (now - h.last > h.keep) { h.g.gain.setTargetAtTime(0, ctx!.currentTime, 0.06); try { h.src.stop(ctx!.currentTime + 0.4); } catch { } held.delete(k); } }); }, 100);
/** A happy noise from a pet: dogs bark, cats meow (and sometimes purr), bunnies squeak. */
export function petSound(kind?: string) { const r = Math.random();
  if (kind === 'dog') (r < 0.5 ? sfx.bark : sfx.bark2)(); else if (kind === 'cat') (r < 0.35 ? sfx.purr : r < 0.7 ? sfx.meow : sfx.meow2)(); else sfx.squeak(); }
/** Truck engine that revs with speed (0 = idle .. 1 = flat out). Call every frame while the engine runs. */
export function engine(speed: number, big = false) { const v = Math.max(0, Math.min(1, speed)); hold(big ? 'engineBig' : 'engine', 0.16 + 0.4 * v, 0.72 + 1.15 * v); }

// ---------- music: one looping track per category, cross-faded, ducked under Nico's voice ----------
const TRACK: Record<string, string | null> = { hub: 'hub', sports: 'sports', paint: 'hub' };
let wantTrack: string | null = null, curTrack: string | null = null, curMusic: { src: AudioBufferSourceNode; g: GainNode } | null = null; const loadingTrack = new Set<string>();
/** Called every frame with the category on screen ('hub' for title/home). Music Maker gets no background music. */
export function musicScene(section: string) { const t = section in TRACK ? TRACK[section] : 'hub'; if (t !== wantTrack) { wantTrack = t; setTrack(t); } }
function setTrack(name: string | null) {
  if (!ctx) return; const t = ctx.currentTime;
  if (curMusic && curTrack !== name) { const old = curMusic; old.g.gain.setTargetAtTime(0, t, 0.35); try { old.src.stop(t + 2); } catch { } curMusic = null; curTrack = null; }
  if (!name || curTrack === name || !settings.musicVol) return; const e = musicMeta[name]; if (!e) return;
  const b = bufs.get('music:' + name);
  if (!b) { if (!loadingTrack.has(name)) { loadingTrack.add(name); decode('./audio/' + e.file, e).then(buf => { bufs.set('music:' + name, buf); if (wantTrack === name) setTrack(name); }).catch(() => { }).finally(() => loadingTrack.delete(name)); } return; }
  // Decoded loops are big (~15-30 MB each), so keep only the one playing plus the hub theme; the mp3 stays in the HTTP cache.
  bufs.forEach((_, k) => { if (k.startsWith('music:') && k !== 'music:' + name && k !== 'music:hub') bufs.delete(k); });
  const src = ctx.createBufferSource(), g = ctx.createGain(); src.buffer = b; src.loop = true; src.loopStart = e.loopStart!; src.loopEnd = e.loopEnd!;
  g.gain.value = 0; g.gain.setTargetAtTime(1, t, 0.4); src.connect(g); g.connect(musicGain); src.start(t, e.loopStart); curMusic = { src, g }; curTrack = name;
}
// Back-to-back lines (a win fact, then auto-advance straight into the next goal) keep the music down: the swell back
// up waits ~0.5 s for another line. Sound effects dip a little too so Nico stays easy to hear.
let ducks = 0, relT = 0;
function duck(on: boolean) { if (!ctx) return; ducks = Math.max(0, ducks + (on ? 1 : -1)); clearTimeout(relT);
  if (ducks) { duckGain.gain.setTargetAtTime(0.3, ctx.currentTime, 0.06); sfxDuck.gain.setTargetAtTime(0.75, ctx.currentTime, 0.06); }
  else relT = window.setTimeout(() => { if (ctx && !ducks) { duckGain.gain.setTargetAtTime(1, ctx.currentTime, 0.35); sfxDuck.gain.setTargetAtTime(1, ctx.currentTime, 0.2); } }, 500); }
/** test probe: voices = recorded lines sounding right now (must never exceed 1), track = the music loop that is playing */
export const audioStats = { voices: 0, maxVoices: 0, lines: 0, get track() { return curTrack; }, get ctx() { return ctx?.state ?? 'none'; } };
function voiceStarted(s: AudioBufferSourceNode) { duck(true); audioStats.voices++; audioStats.lines++; audioStats.maxVoices = Math.max(audioStats.maxVoices, audioStats.voices); let done = false; const end = () => { if (!done) { done = true; audioStats.voices--; duck(false); } }; s.onended = end; }
function tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.3, when = 0, slide = 0, dest?: AudioNode) {
  if (!ctx) return; const t = ctx.currentTime + when; const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(dest || sfxGain); o.start(t); o.stop(t + dur + 0.05);
}
function noise(dur: number, vol = 0.2, freq = 1200, when = 0) {
  if (!ctx) return; const t = ctx.currentTime + when; const len = Math.floor(ctx.sampleRate * dur); const b = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const s = ctx.createBufferSource(); s.buffer = b; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; const g = ctx.createGain(); g.gain.value = vol;
  s.connect(f); f.connect(g); g.connect(sfxGain); s.start(t);
}
const synth = {
  tap: () => tone(660, 0.08, 'triangle', 0.2),
  pick: () => tone(520, 0.12, 'sine', 0.25, 0, 300),
  snap: () => { tone(880, 0.1, 'triangle', 0.3); tone(1320, 0.12, 'sine', 0.2, 0.05); },
  wrong: () => { tone(330, 0.25, 'sine', 0.25, 0, -120); tone(250, 0.3, 'triangle', 0.15, 0.12, -80); },
  win: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, 'triangle', 0.25, i * 0.09)); tone(1568, 0.5, 'sine', 0.15, 0.4); noise(0.4, 0.08, 3000, 0.1); },
  star: (i: number) => { tone(988 + i * 200, 0.3, 'sine', 0.25); tone(1976 + i * 400, 0.25, 'sine', 0.08, 0.03); },
  fizz: () => noise(1.2, 0.15, 4000),
  buzz: () => { tone(220, 0.6, 'square', 0.08, 0.2); tone(223, 0.6, 'sawtooth', 0.05, 0.2); },
  tick: () => tone(1400 + Math.random() * 400, 0.03, 'square', 0.05),
  pop: () => { noise(0.15, 0.4, 1500); tone(180, 0.15, 'sine', 0.3, 0, -100); },
  pour: () => noise(0.25, 0.06, 900),
  flip: () => tone(500, 0.1, 'triangle', 0.25, 0, 400),
  whoosh: () => noise(0.5, 0.2, 600),
};
const S = (name: string, fb: () => void, vol = 1, r = 0.04) => () => { if (!play(name, vol, vary(r))) fb(); };
const sfxBase = {
  tap: S('tap', synth.tap, 0.9), pick: S('pick', synth.pick), snap: S('snap', synth.snap), wrong: S('wrong', synth.wrong, 1, 0),
  win: () => { if (!play('fanfare')) synth.win(); }, star: (i: number) => { if (!play('star' + Math.min(2, i))) synth.star(i); },
  fizz: S('fizz', synth.fizz), buzz: S('buzz', synth.buzz, 0.8, 0), tick: S('tick', synth.tick, 0.8, 0.08), pop: S('pop', synth.pop, 1, 0.1),
  pour: S('splash2', synth.pour, 0.5), flip: S('flip', synth.flip), whoosh: S('whoosh', synth.whoosh, 1, 0.08),
  // the richer library (names in public/audio/sfx.json); each falls back to the nearest synth sound until it loads
  bark: S('bark', synth.pop), bark2: S('bark2', synth.pop), yip: S('yip', synth.pop), meow: S('meow', synth.pick), meow2: S('meow2', synth.pick), purr: S('purr', synth.pour, 1, 0),
  roar: S('roar', synth.buzz, 1, 0.06), roarBig: S('roarBig', synth.buzz, 1, 0.03), cheer: S('cheer', synth.win, 0.9, 0), dig: S('dig', synth.pour), dump: S('dump', synth.pour, 1, 0.05),
  splash: S('splash', synth.pour), crack: S('crack', synth.pop), squish: S('squish', synth.pop), sprinkle: S('sprinkle', synth.pour, 0.8), bubble: S('bubble', synth.pop),
  chop: S('chop', synth.tap), slice: S('slice', synth.whoosh), pot: S('pot', synth.tap, 0.8), ding: S('ding', synth.star.bind(null, 2), 1, 0),
  bounce: S('bounce', synth.pop, 1, 0.08), kickball: S('kickball', synth.pop), swish: S('swish', synth.whoosh), whistle: S('whistle', synth.tick, 0.8, 0),
  coin: S('coin', synth.star.bind(null, 1), 0.9, 0.02), coins: S('coins', synth.tick), beep: S('beep', synth.tick, 0.8, 0), horn: S('horn', () => honk(), 1, 0.03),
  rock: S('rock', synth.tick, 1, 0.08), squeak: S('squeak', synth.pick),
  sticker: S('sticker', synth.pop, 1, 0.03), stickerIn: S('stickerIn', synth.tap, 0.9, 0.05), hint: S('hint', synth.pick, 0.8, 0), yourTurn: S('yourturn', synth.star.bind(null, 1), 1, 0),
  yay: S('yay', synth.snap, 1, 0.02), streak: (n = 0) => { if (!play('streak', 0.9, 2 ** (Math.min(7, Math.max(0, n)) / 12))) synth.star(Math.min(2, n)); },
  // Airport: one-shots here; the loops are held every frame with hold('prop' | 'heli' | 'belt' | 'fuel', vol, rate)
  jet: S('jet', synth.whoosh, 1, 0.05), dingdong: S('dingdong', synth.star.bind(null, 1), 0.9, 0), beltClunk: S('beltclunk', synth.pop, 1, 0.08), pumpClick: S('pumpclick', synth.tick, 1, 0.03),
  // Monster Trucks (also hold('rumble', vol, rate) for the big tires while rolling)
  rev: S('rev', () => honk(), 1, 0.05), crush: S('crush', synth.pop, 1, 0.06), crowd: S('crowd', synth.win, 0.9, 0),
  // Egg Smash: eggTap on a light hit, eggCrack(1..3) as the shell weakens, eggBurst on the last hit; one hit sound per tool
  eggTap: S('eggTap', synth.tap, 1, 0.06), eggCrack: (n = 1) => { if (!play('eggCrack' + Math.min(3, Math.max(1, n)), 1, 1 + (Math.random() - 0.5) * 0.06)) synth.pop(); },
  eggBurst: S('eggBurst', synth.win, 1, 0.03),
  toolHammer: S('toolHammer', synth.tick, 1, 0.06), toolRock: S('toolRock', synth.tick, 1, 0.06), toolSpoon: S('toolSpoon', synth.tick, 1, 0.06),
  toolPan: S('toolPan', synth.tick, 1, 0.04), toolMallet: S('toolMallet', synth.pop, 1, 0.06), toolSqueak: S('toolSqueak', synth.pick, 1, 0.08),
  toggle: S('toggle', synth.tap), fanfareBig: () => { if (!play('fanfareBig')) synth.win(); }, aww: S('aww', synth.wrong, 1, 0),
};
// ---- voice: one recorded-voice player owns all narration (Oct 25 update): full sentences, no overlap, no device voice ----
export const missing = new Set<string>(); let voiceGain: GainNode | null = null;
export const voicePlayer: any = (createRecordedVoicePlayer as any)({ getContext: () => ctx, isEnabled: () => settings.voice,
  manifestURL: './voice/voice-manifest.json', indexURL: './voice/voice-index.json',
  connect: (src: AudioBufferSourceNode) => { if (!voiceGain) { voiceGain = ctx!.createGain(); voiceGain.connect(master); } src.connect(voiceGain); voiceStarted(src); },
  onMissing: (text: string) => { missing.add(text); deviceVoice(text); } });
/** Fizby Sports keeps one safety net F&L dropped: a line with no recorded clip at all is read by the device voice, so no instruction is ever silent. */
function deviceVoice(text: string) { if (!settings.voice) return; try { const u = new SpeechSynthesisUtterance(text); u.rate = 0.95; u.pitch = 1.25; speechSynthesis.speak(u); devUntil = performance.now() + text.length * 70; } catch { /* none */ } }
let devUntil = 0;
async function loadVoice() { try { await voicePlayer.preload(); } catch { } }
/** narrate.ts installs this so every line (direct or queued) is logged and gated in one place */
export const voiceHook: { speak: (text: string, opts: { now?: boolean; id?: string; onend?: () => void }) => void } = { speak: (t, o) => voicePlayer.say(t, { onEnd: o.onend }) };
export function say(text: string, onend?: () => void) { if (!text) return; voiceHook.speak(text, { onend }); }
export function voiceState(text: string): 'clip' | 'loading' | 'tts' { return voicePlayer.duration(text) > 0 ? 'clip' : 'loading'; }
export function clipDuration(text: string) { return voicePlayer.duration(text); }
/** plays a standalone narration file (intros) through the same player */
export function playFile(url: string, onStart?: (d: number) => void, onEnd?: () => void) { voicePlayer.playURL(url, { onStart, onEnd }); }
/** hard=true (mute, Skip) stops the line that is sounding; otherwise only queued lines are dropped and the current sentence finishes */
export function stopVoice(hard = false) { if (hard) voicePlayer.stop(); else voicePlayer.clearPending(); }
// Truck horn (hub games). Two detuned square tones, like a toy truck.
const synthHonk = () => { tone(349, 0.32, 'square', 0.09); tone(440, 0.32, 'square', 0.07); tone(350, 0.3, 'triangle', 0.15); };
export const honk = () => { if (!play('horn', 1, vary(0.03))) synthHonk(); };

// ---- Fizby Sports names on top of the shared library ----
export const sports = {
  thud: S('kickball', synth.pop, 1, 0.08), boing: S('bounce', synth.pop, 1, 0.1), crash: () => { if (!play('crush', 0.8)) synth.pop(); play('crowd', 0.5, 1, 0.15); },
  bell: S('ding', synth.star.bind(null, 2), 1, 0), hop: S('bounce', synth.flip, 0.8, 0.12), roll: () => hold('rumble', 0.25, 1.3, 600),
  unlock: () => { if (!play('fanfareBig')) synth.win(); }, cheer: () => { if (!play('fanfare')) synth.win(); play('crowd', 0.6, 1, 0.2); },
};
export const sfx = Object.assign(sfxBase, sports);
export let muted = false;
export function setMuted(m: boolean) { muted = m; settings.voice = !m; settings.sfxVol = m ? 0 : 3; settings.musicVol = m ? 0 : 2; applySettings(); }
export const isSpeaking = () => !!voicePlayer.busy || performance.now() < devUntil;
