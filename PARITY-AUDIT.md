# Fizby Sports vs Fizby's Fun & Learn: parity audit

The Fun & Learn reference (F&L) is `/workspace/fizby-check/nico-fun-learn-app`, used **read only**. All paths below are inside it.
Severity: **Critical** = a kid or parent notices at once, **High** = clearly below F&L, **Med** = depth/polish, **Low** = nice to have.
Neither app has haptics or accessibility features beyond the basics. Those rows are about parity plus small wins.

| # | System / screen | Fun & Learn | Fizby Sports today | Gap | F&L reference |
|---|---|---|---|---|---|
| 1 | Character art | Six 2D cartoon Fizby poses as cut-out art (welcome-point, cheer-jump, think, wave, oops, explain) | Old code-drawn "scientist" Fizby with five canvas poses and no cut-out art | **Critical** | `src/nico.ts`, `public/art/nico-*.webp` |
| 2 | Mascot presence and animation | The pose follows context (oops on a mistake, think while waiting, cheer on a win) on every screen | A bust in a ring on every screen, a full body only on the title and win screens, no oops or think reactions | **High** | `src/nico.ts`, `src/main.ts` |
| 3 | Narration engine | A queue: lines never talk over each other, a tap skips the current line, lines are looked up by ID | `say()` cancels the line before it, so lines cut each other off. There are no IDs | **Critical** | `src/narrate.ts`, `src/voicePlayback.ts`, `src/lines.ts` |
| 4 | Cloned-voice coverage | 1,487 clips, plus 68 guidance/teach lines and a tracked list of the few lines still missing | 88 of 111 lines cloned. 23 fall back to the device voice, including several sport names and "Three!" | **High** | `public/voice`, `src/lines-guidance.ts`, `tests/unvoiced-lines.json` |
| 5 | Teaching prompts | `learn.ts` names what the child did ("Three cars! One, two, three!"), and each game has intro, idle nudge and teach lines | Only one goal line per level, numbers in a few games, no fact or teach lines, no idle nudge line | **High** | `src/learn.ts`, `src/lines.ts`, `docs/LEARNING-MAP.md` |
| 6 | Music | 13 looped tracks, including `sports.mp3` and `hub.mp3`, ducked under the voice | No music at all | **Critical** | `public/audio/music*`, `src/audio.ts` |
| 7 | Sound effects | 85 recorded CC0 or offline-synthesized samples (cheer, crowd, bounce, whistle-type) | About 15 live Web-Audio beeps | **High** | `public/audio/sfx*`, `src/audio.ts`, `docs/LICENSES.md` |
| 8 | Menus and transitions | Animated topic intro card with a Fizby pose and narration, fade-ins, skippable | Every screen change is a hard cut, and there's no intro per sport | **High** | `src/introAnim.ts`, `src/intros.ts` |
| 9 | Hub | A living scene: buildings on a winding path that always animate, toys that react to taps | A static 3×4 card grid (only the card icons bob) | **High** | `src/hub.ts` |
| 10 | Navigation | One-tap Back, a "?" walkthrough button, per-world sub-menus | One-tap Back only. Mid-game there's nothing but Back and the mascot | **Med** | `src/tut.ts`, `src/main.ts` |
| 11 | Hint system | Hand demo after about 5 s, looping every 3 s; at 15 s the target pulses and Fizby says the goal; the delay depends on age | Hand demo after about 6 s and nothing after that. There's no pulse or spoken goal, and no age tuning | **High** | `src/hint.ts`, `src/profiles.ts` (tuning) |
| 12 | Tutorials | An animated "?" walkthrough per game: a ghost hand acts out each gesture, with narration | None | **High** | `src/tut.ts` |
| 13 | Level progression and difficulty | A level table per topic with goal icons, facts and **boss** levels, replays that vary (mirrored or swapped), and difficulty by age band | 5 fixed levels plus random remixes per game. No boss levels or replay variation, no age bands, no level-select map | **High** | `src/levels.ts`, `src/games/topics.ts`, `src/main.ts` (replay variation) |
| 14 | Per-game depth | F&L sports alone has three throw mechanics with floating scores, arc previews, leading the runner and targets. Games run 130 to 450 lines | Each game is about 30 to 60 lines with one mechanic. Hockey and Mini-golf are close; Bowling and Swimming are shallow | **High** | `src/games/sports.ts`, `src/games/kit.ts` (kid, box, label, shape) |
| 15 | Characters and teammates | A shared `kid()` cartoon-child generator with looks and outfits, plus animals and pals | Generic blobs (keeper pal, duck, stick gymnast), no kid characters | **High** | `src/games/kit.ts` (`kid`, `KidLook`), `src/games/pals.ts` |
| 16 | Stickers | A Sticker Book with pages, the game's own icons on die-cut backs, silhouettes of missing stickers (the collection pull), and a sticker fly-in effect | A sticker after each win and a 24-slot grid with no pages and no silhouettes of what's still missing | **Med** | `src/stickers.ts`, `src/main.ts` (stickerFx) |
| 17 | Trophies and celebrations | Celebration with confetti, a cheer-jump pose, crowd SFX and sticker fly-in | A trophy shelf and confetti, beeps for sound, a code-drawn cheer | **Med** | `src/main.ts`, `public/audio/sfx/cheer.mp3`, `crowd.mp3` |
| 18 | Parent area | Skills view per child, plans, Restore/Manage/Terms/Privacy, a share-a-free-month gift, settings | Plans, Restore/Manage/Terms/Privacy, a skills list (one child only), sound and reset | **Med** | `src/main.ts`, `src/share.ts`, `src/learn.ts` |
| 19 | Grown-up gate | Hold, then a sum | The same pattern, ported | OK | `src/main.ts` |
| 20 | Profiles | Up to 3 child profiles, each with an age band (2-3, 4-5, 6+), a face and a name; saves kept separately | None, so the whole family shares one save | **High** | `src/profiles.ts` |
| 21 | Settings | Separate music and voice levels, age band, profile switch, hint timing | Sound on/off and a hold-to-reset button | **Med** | `src/audio.ts`, `src/narrate.ts`, `src/main.ts` |
| 22 | Purchase and paywall | StoreKit 2 via `@capgo/native-purchases`, first 2 levels free, behind the gate, store simulator | The same code, ported, with com.fizbystudio.sports IDs. No Capacitor iOS project or codemagic.yaml yet (that's M4) | **Med** (M4) | `src/store.ts`, `ios/`, `codemagic.yaml` |
| 23 | Onboarding | First launch: Fizby welcome-point pose, intro narration, the hub explained by voice | The title screen says one line, then Play | **Med** | `src/introAnim.ts`, `src/intros.ts`, `src/nico.ts` |
| 24 | Accessibility | Big targets, extra touch slack for ages 2-3, an ARIA label on the canvas, no reading | Big targets and no reading, but no touch slack or ARIA | **Low** | `src/profiles.ts` (slack), `src/main.ts` |
| 25 | Haptics | None | None. Could add `@capacitor/haptics` light taps (Apple-only, no tracking) | **Low** | n/a |
| 26 | Performance | Canvas plus webp art, with the cached art used on iPad | Pure canvas, light. The precache service worker now makes offline reload work | OK / **Low** | `src/gfx.ts` |
| 27 | Offline | The bundled app is offline, with `docs/FAQ-OFFLINE.md` | The web build gets offline reload through `sw.js`. The airplane-mode test on a real iPhone isn't done yet | OK | `docs/FAQ-OFFLINE.md` |
| 28 | Docs | DESIGN, LEARNING-MAP, LICENSES, NARRATION-HOOKS, SUBMIT and more | README only | **Med** | `docs/` |
| 29 | Tests | play-all, plus a list of unvoiced lines | play-all, monkey and offline. play-all stalls at **activity 9 level 4** (Gymnastics, 4-move routine; under investigation) | **High** (bug) | `tests/play-all.mjs`, `tests/unvoiced-lines.json` |

## Planned fix order
1. **Shared F&L systems copied in:** the narration queue (`narrate.ts` + `voicePlayback.ts`), recorded music and SFX (`public/audio`, `audio.ts`), the hint hand with its 15 s pulse and spoken goal (`hint.ts`), and the 2D Fizby poses (`nico.ts` + art). These fix rows 1, 2, 3, 6, 7 and 11, the four Critical gaps.
2. **Profiles and age bands** (`profiles.ts`) feeding hint timing, touch slack and difficulty (rows 20, 13 and 24). Then settings and the parent area per child (rows 18 and 21).
3. **Intros, transitions and onboarding** (`introAnim.ts`, `intros.ts`) and a "?" tutorial per game (`tut.ts`) (rows 8, 12 and 23).
4. **Living sports hub,** a stadium scene modeled on `hub.ts` (row 9).
5. **Depth for each game:** shared `kid()` teammates, floating scores, teach lines through `learn.ts`, a boss level per sport and replay variation. Shallow games first: Bowling, Swimming, then Hockey and Mini-golf. Also fix the Gymnastics stall (rows 5, 13, 14, 15 and 29).
6. **Stickers and celebrations:** a paged book with silhouettes and the fly-in, plus crowd and cheer SFX (rows 16 and 17).
7. **Voice:** clone every new line and close the 23 missing ones, then publish an unvoiced-lines list (row 4).
8. **Proof:** side-by-side screenshots in `screenshots/parity/`, then play-all, monkey, offline-check, deploy and live-check. Docs (row 28). Small haptics if approved (row 25).
