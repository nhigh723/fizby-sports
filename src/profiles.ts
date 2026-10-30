// Up to 3 child profiles with an age band each (shared design with Fizby's Fun & Learn, src/profiles.ts there).
// Switching parks the current child's progress (fs5~save) under 'fs5P<i>:' and brings the other child's back. The Club is per device.
export type Band = '2-3' | '4-5' | '6+';
export type Profile = { name: string; face: string; band: Band };
type Store = { cur: number; list: Profile[] };
const PK = 'fs5~profiles', FACES = ['soccer', 'basket', 'tennis'];
/** true once a child has been set up (first-launch setup or the grown-ups area) */
export const hasProfiles = () => { try { return !!localStorage.getItem(PK); } catch { return true; } };
export function saveFirst(face: number, band: Band) { put({ cur: 0, list: [{ name: 'Player 1', face: FACES[face % 3], band }] }); }
export function profiles(): Store { try { const s = JSON.parse(localStorage.getItem(PK) || ''); if (s && Array.isArray(s.list) && s.list.length) return s; } catch { } return { cur: 0, list: [{ name: 'Player 1', face: FACES[0], band: '4-5' }] }; }
function put(s: Store) { try { localStorage.setItem(PK, JSON.stringify(s)); } catch { } }
export const current = () => { const s = profiles(); return s.list[s.cur] || s.list[0]; };
export function addProfile(): number { const s = profiles(); if (s.list.length >= 3) return -1; s.list.push({ name: `Player ${s.list.length + 1}`, face: FACES[s.list.length % 3], band: '4-5' }); put(s); return s.list.length - 1; }
export function setBand(i: number, band: Band) { const s = profiles(); if (s.list[i]) { s.list[i].band = band; put(s); } }
export function setFace(i: number) { const s = profiles(); const p = s.list[i]; if (p) { p.face = FACES[(FACES.indexOf(p.face) + 1) % FACES.length]; put(s); } }
export function rename(i: number, name: string) { const s = profiles(); if (s.list[i] && name.trim()) { s.list[i].name = name.trim().slice(0, 14); put(s); } }
const ours = (k: string) => k === 'fs5~save';
/** Park the current child's saves and load child i's. Returns true when the caller should restart. */
export function switchTo(i: number): boolean { const s = profiles(); if (i === s.cur || !s.list[i]) return false;
  const keys: string[] = []; for (let n = 0; n < localStorage.length; n++) { const k = localStorage.key(n)!; if (ours(k)) keys.push(k); }
  for (const k of keys) { localStorage.setItem(`fs5P${s.cur}:${k}`, localStorage.getItem(k)!); localStorage.removeItem(k); }
  const pre = `fs5P${i}:`, back: string[] = []; for (let n = 0; n < localStorage.length; n++) { const k = localStorage.key(n)!; if (k.startsWith(pre)) back.push(k); }
  for (const k of back) { localStorage.setItem(k.slice(pre.length), localStorage.getItem(k)!); localStorage.removeItem(k); }
  s.cur = i; put(s); return true; }
/** Age band tuning: hint delay, extra touch slack. */
export function tuning(b: Band = current().band) { return b === '2-3' ? { hint: 4, slack: 16, label: 'Age 3' } : b === '6+' ? { hint: 7, slack: 0, label: 'Ages 5-6' } : { hint: 5, slack: 8, label: 'Age 4' }; }
