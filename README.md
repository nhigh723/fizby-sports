# Fizby Sports

A sports hub for ages 3-6: Soccer, Basketball and Bowling (more sports coming). Bright colours, nothing to read, every instruction spoken by Fizby with a hand demo, single-tap Back. Stickers for every win, a trophy per sport, all in the Trophy Room.

- No ads, no analytics, no tracking, no third-party SDKs. Purchases (Apple StoreKit only), outside links and settings sit behind a grown-up gate.
- Free tier: the first 2 levels of every sport. Fizby Club (yearly / monthly with a 7-day trial) or Forever unlocks every level.
- App id `com.nickhigh.game5`; products `com.nickhigh.game5.club.yearly`, `.club.monthly`, `.forever`.
- Mascot and title live in `src/brand.ts`.
- Support: nickrhigh@yahoo.com

Dev: `npm run build && npx vite preview --port 4182`, then `node tests/play-all.mjs`, `node tests/monkey.mjs`, `URL=http://localhost:4182/ node tests/offline-check.mjs`, `node tests/shots.mjs`.
