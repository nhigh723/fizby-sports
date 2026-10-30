# Parity progress log (restart-safe)

Commits push after each chunk. Newest first.

- 00:50 EDT. Found and fixed the real bowling L5 bug (BUGS #8). Racing watchdog added. Full play-all rerun.
- 00:15 EDT. Voice 124/124. Tennis early window and bowling 2 racks fixed. Final play-all rerun (fs-logs/final/play-all.log); previous run green except bowling L5 (Gymnastics L4 passed).
- 23:45 EDT. monkey ALL PASSED (fs-logs/final/monkey.log). Voice 123/124 (colours from shared library). Pass 3c (Batter up!) gating. Final play-all running.
- 22:20 EDT. Steps 1-6 are committed. Voice pass 3b is running (`voice/pass3.sh`: 18 reworded or missing lines). The final play-all is running, log at `/workspace/fs-logs/final/play-all.log`. Fixed so far: Gymnastics stall, gate modal, favicon 404, golf near-miss loop, physics substeps. Investigating a Racing L0 flake.
- Done and verified:
  - profiles-check: ALL PASSED
  - audio-check: ALL PASSED (`/workspace/fs-logs/final/audio-check.log`)
  - offline-check: OK (`/workspace/fs-logs/final/offline-check.log`)
  - parity screenshots: 26 pairs in `screenshots/parity/`
- Still to do (as of 00:50 EDT):
  1. DONE: green full play-all (EXIT 0)
  2. Rerun monkey. It passed at 23:15 but needs a rerun after the bowling, tennis and racing fixes.
  3. Rerun audio-check and offline-check.
  4. Re-shoot the parity screenshots.
  5. Deploy, then live-check.
  6. Final closure table and BUGS.md sign-off.
- Done:
  - Voice 124/124 (voice/coverage.json)
  - monkey: ALL PASSED at 23:15
  - profiles-check: ALL PASSED
  - Gymnastics L4: passes
