// Merges Fizby's shared Fun & Learn voice library (same cloned voice) with this game's own clips into the two files the
// recorded-voice player reads: voice/voice-manifest.json (text hash -> clip) and voice/voice-index.json (phrase -> clip + durations).
// Usage: node scripts/merge-voice.mjs <path to the F&L public/voice folder>   (copies its clips into public/voice, read only on the source)
import fs from 'node:fs'; import { execFileSync } from 'node:child_process';
import { normalizeVoiceText, resolveRecordedSpeech } from '../src/voicePlayback.ts';
const SRC = process.argv[2], V = 'public/voice';
const own = JSON.parse(fs.readFileSync(`${V}/manifest.json`)); const flm = JSON.parse(fs.readFileSync(`${SRC}/manifest-20261025-r2.json`)), fli = JSON.parse(fs.readFileSync(`${SRC}/recorded-text-20261025-r2.json`));
for (const f of new Set([...Object.values(flm).flat(), ...Object.values(fli.phrases).flat()])) if (!fs.existsSync(`${V}/${f}`) && fs.existsSync(`${SRC}/${f}`)) fs.copyFileSync(`${SRC}/${f}`, `${V}/${f}`);
const all = JSON.parse(fs.readFileSync('voice/all.json')); const text = Object.fromEntries(all);
const manifest = { ...flm, ...own }, phrases = { ...fli.phrases }, durations = { ...fli.durations };
const dur = f => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', `${V}/${f}`]).toString().trim();
for (const [h, f] of Object.entries(own)) { if (text[h]) phrases[normalizeVoiceText(text[h])] = f; durations[f] = dur(f); }
// keep only what this game's lines actually use (whole-line clips or phrase assembly), so the offline cache stays small
const need = new Set(Object.values(own)), voiced = [], silent = [];
for (const [, t] of all) { const r = resolveRecordedSpeech(t, manifest, phrases); if (r) { r.forEach(f => need.add(f)); voiced.push(t); } else silent.push(t); }
for (const o of [manifest, phrases]) for (const k of Object.keys(o)) if (![].concat(o[k]).every(f => need.has(f))) delete o[k];
for (const k of Object.keys(durations)) if (!need.has(k)) delete durations[k];
const keep = new Set([...need, 'manifest.json', 'voice-manifest.json', 'voice-index.json']); for (const f of fs.readdirSync(V)) if (!keep.has(f)) fs.unlinkSync(`${V}/${f}`);
fs.writeFileSync('voice/coverage.json', JSON.stringify({ voiced: voiced.length, total: all.length, silent }, null, 1));
console.log('voiced', voiced.length, '/', all.length);
fs.writeFileSync(`${V}/voice-manifest.json`, JSON.stringify(manifest)); fs.writeFileSync(`${V}/voice-index.json`, JSON.stringify({ phrases, durations }));
console.log('manifest', Object.keys(manifest).length, 'phrases', Object.keys(phrases).length);
