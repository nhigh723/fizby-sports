# Offline

**Web build.** `scripts/precache.mjs` writes `dist/sw.js`, which precaches every built file: code, art, music, SFX and voice clips. After one online visit the game reloads and plays in airplane mode. It is tested by `tests/offline-check.mjs`. Lookups use `ignoreVary` so GitHub Pages' `Vary` header can't cause cache misses.

**iOS app (Capacitor).** Everything is bundled in the app, so nothing is fetched at run time. StoreKit is the only network use, and only when a grown-up buys or restores.
