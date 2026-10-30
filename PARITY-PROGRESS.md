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
