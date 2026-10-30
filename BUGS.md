# Bugs

Open: **0**

| # | Bug | Found by | Fix | Status |
|---|---|---|---|---|
| 1 | play-all stalled at Gymnastics (activity 9) level 4. After a wrong move the replay started at a negative time, so it showed move -1 and the routine got out of step. | play-all | `src/acts/gym.ts`: the replay waits until its start time before showing move 0. All Gymnastics levels and remixes pass. | Fixed |
| 2 | The grown-up gate stayed open over a game that started underneath it. | parity screenshots | `start()` and `go()` close any modal. | Fixed |
| 3 | `favicon.ico` 404 in the console. | audio-check (zero-errors) | `index.html` links `favicon.png` and `apple-touch-icon.png`. | Fixed |
| 4 | Back tap during the screen-change debounce made the monkey test flaky. | monkey | The test now waits like a real tap would (the 180 ms debounce is intended). | Fixed |
| 5 | Racing and Mini-golf were flaky under heavy CPU load. Big frame steps changed how far a putt rolled, and the kart missed stars it was steering into. | play-all under load | `src/main.ts` runs activity physics in fixed 1/120 s substeps. Racing counts a star when the kart is moving into its lane. | Fixed |
| 6 | Lines talked over each other (`say()` cancelled the line before). | audit row 3 | Shared recorded-voice queue. `tests/audio-check.mjs` checks at most 1 line sounds at once. | Fixed |
| 7 | Clips for short lines failed the clone checks (padding or carrier words heard). | voice pass 3 | Reworded to slightly longer lines, then cloned again. Any line without a clip falls back to the device voice. `voice/coverage.json` lists them. | Fixed |
