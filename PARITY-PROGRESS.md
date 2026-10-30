# QA round 2 progress log (restart-safe)

Source: /workspace/fs-qa-independent/REPORT.md. Newest first.

- 03:45 EDT. V1 is done. The canvas is full-bleed on iPad and tall phones: backgrounds paint the whole screen through `band()`/`bleed`, the HUD sits at the screen edges, and input works across the full width. Shots in screenshots/ipad/. A background QA loop is running against live (fs-logs/qa-runs/) to gather B1 data.
- To do:
  - V2 gymnastics art, V3 kart and racing card, V4 paint pictures, V5 hockey player and puck
  - V6 hub cards and overlaps
  - V7 title seam
  - V8 unique stickers
  - V9 swim win
  - V10 depth
  - V11 parent area
  - V12 profile setup
  - B1 freeze and music
  - Then: tests, screenshots, deploy, live QA on iPhone and iPad

## QA round 2 — update (Oct 30, 2026 ~04:15 EDT)
- V1 done (0745854). V2 gymnasts = posed kid figures (fkit `figure`), beam + mat gym hall. V3 illustrated top-down kart + side-view `kart()` on hub; trees, cones, gates, boost pads.
- V4 Paint: 5 illustrated Path2D pictures (medal, ball on sunny hill, trophy, jersey, finish flag) with shading + line-art detail, paint pots.
- V5 Hockey: real puck (`puck()`), hockey kid with helmet + swinging stick, teammate kid.
- V6 Hub: illustrated vignette per card (kid players, props); onboarding Fizby sits in the empty grid cell, small hand on Soccer corner; stray ball removed; stadium clouds off (clipped circle).
- V7 curved bunting replaces seam line. V8 10 distinct sticker designs per sport (`stickerArt`). V9 swim win: Fizby centred between arrows, scene washed out, book icon shows current sport sticker.
- V10 added: gym Handstand move (L3+, 5 moves), race boost pads (L2+). V11 targets >=44, 'practiced', bands Age 3 / Age 4 / Ages 5-6. V12 first-launch setup screen.
- Voice 126/126 (new: setup line, Handstand).
- B1: play-all showed 2 intermittent stalls (bowl L6 hard busy forever; paint L2 hint loop), no page errors. Fixes: busy watchdog (>12 s busy → restart level, counted in __snap.heals); paint tap prefers the part whose dot is tapped.
- Logs: /workspace/fs-logs/qa2/.

## QA round 2 — update (Oct 30, 2026 ~09:15 EDT)
- V10 new mechanics (in addition to each game's 5 level modes): soccer pass-then-shoot (L1), basket pick-the-colour ball (L2), bowl how-many-fell quiz (L0-L1), tee catch the fly ball (L1-L2), swim dive start on the green light (L1+), golf sliding gate timing (L1), tennis aim at the bucket (L2), gym Handstand (L2+), race boost pads, paint sparkle stamps (L2+). Voice 131/131.
- Frame loop bug from 81f4685 (inline comment swallowed `T += dt`) found by an fps probe and fixed in 77b3bc7; nothing deployed in between.
- B1 diagnostics in __snap.perf: longest JS frame (<=90 ms), longest long task, gaps between frames, slowest audio/voice call (<=2 ms). The stalls line up with 8-16 s gaps where no rAF and no timer ran, while no JS task was long. So the page is being starved, not looping. Running an A/B now: headless GPU (SwiftShader) vs --disable-gpu.
- Watchdog restarts now count as test failures in play-all.

## QA round 2: update (Oct 30, 2026 ~10:30 EDT)
- B1 root cause: the box itself freezes. The host-stall monitor (/workspace/fs-logs/lagmon.mjs, a plain Node 100 ms timer) logged gaps of 80 s, 332 s, 86 s, 99 s and 67 s (lagmon.log). Over the same windows the page shows frame gaps with no long JS task (__snap.perf). Bowl, paint and tee "stalls" happen only inside these windows. Once the box is frozen past the timeout, the game's own real-time watchdog restarted turns, which made more noise. That watchdog is removed. What remains is a game-time detector (logs only), and play-all fails if it ever triggers.
- play-all now budgets each level in game time. Full run: 110 ok / 0 FAIL, 0 detector hits (fs-logs/qa-final2/full-1.log).

## 2026-10-30 ~12:50 EDT: final verification
- Parity screenshots regenerated (screenshots/parity, 26 shots, no page errors).
- Live qa (game-time budget, qa-evidence/qa-gt.mjs): iPhone 78/78 levels ok, iPad 78/78 levels ok, 0 FAIL, 0 STUCK. The real-time qa.mjs FAILs line up with host freezes recorded by lagmon (B1).
- Found and fixed a real bug: the parent gate hold counted frames, not time, so it never completed on iPad (BUGS.md #15). Deployed as fs5-0c3f9b3d4c.

## Closure checklist (2026-10-30 ~13:20 EDT, live build fs5-0c3f9b3d4c)
| Item | Status | Evidence |
|---|---|---|
| V1 | fixed (0745854) | screenshots/iphone, screenshots/ipad |
| V2 gymnastics art | fixed | screenshots/{iphone,ipad} gym shots, screenshots/parity/25-* |
| V3 kart/racing | fixed | device shots, race game shots |
| V4 paint pictures | fixed | screenshots/parity/26-*, device shots |
| V5 hockey player/puck | fixed | device shots |
| V6 hub cards/overlaps | fixed | screenshots/parity/02-hub.png, qa-evidence shots 08b-wrong (hub) |
| V7 title seam | fixed (bunting) | screenshots/parity/01-title.png |
| V8 unique stickers | fixed (10 per sport) | device-shots sticker-variety shots |
| V9 swim win | fixed | screenshots/win/* |
| V10 depth | extra mechanic in every game, on top of 5 level modes | PARITY-PROGRESS V10 list; play-all 110 ok (fs-logs/qa-final2/full-1.log); live qa 78/78 on both devices |
| V11 parent area | fixed; gate hold real-time fix (BUGS #15) | qa-evidence/qa-tail-live2-{iphone,ipad} logs (live): reaches parents screen |
| V12 profile setup | fixed | setup flow in qa logs ("setupGo..."), device shots |
| B1 stalls | root cause: host-level box freezes (lagmon gaps 40-597 s) that line up exactly with every real-time FAIL; no long JS tasks; the restarting watchdog was removed and replaced by a detector that only logs | /workspace/fs-logs/lagmon.log, BUGS.md #12-14, qa-evidence/qa-gt-{iphone,ipad}.log 78/78 ok 0 STUCK |
| Audio incl. gameplay music | ok | fs-logs/qa-final2 audio-check |
| Offline (live) | ok, only host github.io | qa-evidence/offline-live2.log |
| Monkey / profiles | EXIT 0 | fs-logs/qa-final2 |

## 2026-10-30 ~15:35 EDT: QA round-2 nits (live cache fs5-c7cf5c5383)
1. Trophy cups and sticker-book tabs now use illustrated sport badges, the same art as the hub cards.
2. The Gymnastics bunting is now side swags below the top buttons.
3. The setup age chip reads "5-6".
4. Optional name entry in setup: a grown-up types it, it stays on the device only (localStorage), there is no network call, and it can be skipped.
Screenshots: screenshots/nits/. Live play-all 110 ok, monkey, live-check and offline all EXIT 0 (qa-evidence/final4/).
