# Narration hooks

All speech goes through `say()` in `src/main.ts`, then `say()` in `src/audio.ts`, then the recorded-voice player in `src/voicePlayback.ts`.

- **One voice at a time.** The player queues lines, so they never overlap. `tests/audio-check.mjs` checks that at most one line is sounding.
- **Forced lines.** `say(text)` (force) drops whatever is queued, but the sentence that is already sounding finishes. `say(text, false)` is skipped while Fizby is talking. Activities use force for counting and goal lines.
- **Where clips come from.** Each line is resolved to a whole-line clip (`voice/voice-manifest.json`, keyed by text hash). If there's none, it is assembled from recorded phrases (`voice/voice-index.json`). Both files are built by `scripts/merge-voice.mjs` from this game's clips plus the shared Fizby voice library.
- **Last-resort fallback.** A line with no clip at all is read by the device voice so an instruction is never silent. `voice/coverage.json` lists any such lines. The target is zero.
- **Hooks:**
  - title and hub greetings
  - sport intro: name, Big game, goal
  - goal lines, counting and colour lines inside each activity
  - hint goal, at the age-band delay and then every 15 s while idle
  - `?` tutorial
  - win line, then the teaching line (`FACT`), then the sticker line (queued)
  - trophy line
  - Trophy Room and Sticker Book taps
- **New lines.** Run `node scripts/voice-lines.mjs`, then `voice/pass3.sh` (low-priority clone, gate and install), then `node --experimental-strip-types scripts/merge-voice.mjs <F&L public/voice>`.
