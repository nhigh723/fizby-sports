# Parity progress log (restart-safe)

Commits push after each chunk. Newest first.

- 22:20 EDT. Steps 1-6 are committed. Voice pass 3b is running (`voice/pass3.sh`: 18 reworded or missing lines). The final play-all is running, log at `/workspace/fs-logs/final/play-all.log`. Fixed so far: Gymnastics stall, gate modal, favicon 404, golf near-miss loop, physics substeps. Investigating a Racing L0 flake.
- Done and verified:
  - profiles-check: ALL PASSED
  - audio-check: ALL PASSED (`/workspace/fs-logs/final/audio-check.log`)
  - offline-check: OK (`/workspace/fs-logs/final/offline-check.log`)
  - parity screenshots: 26 pairs in `screenshots/parity/`
- Still to do:
  1. Green play-all.
  2. Monkey.
  3. Merge the voice clips and rebuild.
  4. Rerun audio-check and offline-check.
  5. Re-shoot the parity screenshots.
  6. Deploy, then live-check.
  7. PARITY-AUDIT.md closure table.
