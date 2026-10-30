<!-- Fizby Sports reuses only public/audio/sfx (all files), public/audio/music/{hub,sports}.mp3 and the Fizby voice from the list below. -->
# Asset licenses
- **Art:** game pieces are drawn procedurally in code (src/art.ts). Character and background art is listed below.
- **Sound effects and music:** see "Audio" below. Every recorded sound is **CC0 1.0** (public domain dedication). Everything else is synthesized by our own code (CC0). No attribution is required anywhere; credits are listed as a courtesy.

## Audio (public/audio)
Built by `scripts/audio/sfx.py` (SFX) and `scripts/audio/render_music.py` + `scripts/audio/music.py` (music) from source packs downloaded to `$AUDIO_SRC` (not committed). Files are MP3 (plays on iOS Safari/WKWebView, Chrome, Firefox), mono 64 kbps for SFX, stereo 72 kbps for music. A live Web Audio synth in src/audio.ts stands in until they load.

**Music (public/audio/music/\*.mp3), all 11 loops:** hub, science, build, sports, kitchen, animals, dino, airport, monster, garden, ocean. Original compositions (melodies and chords written for this game in scripts/audio/music.py) rendered with our own numpy synth (scripts/audio/synth.py: Karplus-Strong plucks, marimba, glockenspiel, FM piano, additive brass, flute, synthesized drums, algorithmic reverb). No samples or third-party music. **CC0 / Fizby Studio.**

**Synthesized SFX (our code, CC0):** pop, whoosh, swish, bounce, kickball, whistle, ding, coin, star0-2, fanfare, fanfareBig, aww, sticker, stickerIn, hint, yourturn, yay, streak, jet (flyby), dingdong (announcement chime), beltclunk, pumpclick, prop (propeller loop), heli (helicopter loop), belt (baggage belt loop), fuel (fuel pump loop), rev (monster truck rev), rumble (big-tire loop), beep, horn, dump, buzz, fizz, engine, engineBig, siren, sizzle, whisk, rocket. `crack` is synthesized plus a quiet layer of mud_03 (below). `hose` is synthesized noise plus loop_water_01 (below).

**Recorded SFX (all CC0 1.0):**

| Sound(s) | Source file | Pack / page | Author | License |
|---|---|---|---|---|
| tap | drop_002.ogg | Interface Sounds, https://kenney.nl/assets/interface-sounds | Kenney (kenney.nl) | CC0 |
| pick | pluck_002.ogg | Interface Sounds (same) | Kenney | CC0 |
| snap | confirmation_001.ogg | Interface Sounds (same) | Kenney | CC0 |
| wrong | question_004.ogg | Interface Sounds (same) | Kenney | CC0 |
| tick | tick_004.ogg | Interface Sounds (same) | Kenney | CC0 |
| toggle | toggle_002.ogg | Interface Sounds (same) | Kenney | CC0 |
| flip | card-place-1.ogg | Casino Audio, https://kenney.nl/assets/casino-audio | Kenney | CC0 |
| coins | handleCoins.ogg | RPG Audio, https://kenney.nl/assets/rpg-audio | Kenney | CC0 |
| chop | chop.ogg | RPG Audio (same) | Kenney | CC0 |
| slice | knifeSlice.ogg | RPG Audio (same) | Kenney | CC0 |
| pot | metalPot1.ogg | RPG Audio (same) | Kenney | CC0 |
| rock | impactMining_000.ogg | Impact Sounds, https://kenney.nl/assets/impact-sounds | Kenney | CC0 |
| crush | impactMetal_heavy_000.ogg + impactPlate_heavy_002.ogg + impactGlass_light_001.ogg (layered with a synthesized boing) | Impact Sounds, https://kenney.nl/assets/impact-sounds | Kenney | CC0 |
| bark, bark2 | dog_barking_mono.wav (2 barks cut out) | https://opengameart.org/content/dog-barking-mono | Brandon Morris (submitted by HaelDB) | CC0 (dual CC0 / OGA-BY 3.0; used under CC0) |
| yip, roar, squeak | barking_01.ogg, roar_02.ogg, cute_06.ogg | 80 CC0 creature SFX, https://opengameart.org/content/80-cc0-creature-sfx | rubberduck | CC0 |
| meow | Meow.ogg | https://opengameart.org/content/meow | IgnasD | CC0 |
| meow2 | kitten_mew-1.wav | https://opengameart.org/content/kitten-mew | AntumDeluge | CC0 |
| purr | cat_purrsleepy_loop.wav (3 s, loop-crossfaded) | https://opengameart.org/content/cat-purr-meow | Kerzoven | CC0 |
| roarBig | monster_roar.wav (first 2 s) | https://opengameart.org/content/cc0-deep-monster-roar | trazzz123 | CC0 |
| cheer | applause-clapping-church-crowd-immersive.wav (3 s excerpt) | https://opengameart.org/content/applause-in-a-large-hall-or-church | eXpl0it3r | CC0 |
| crowd | applause-clapping-church-crowd-immersive.wav (3.5 s excerpt from 7 s) | https://opengameart.org/content/applause-in-a-large-hall-or-church | eXpl0it3r | CC0 |
| dig | shovel.ogg | https://opengameart.org/content/shovel-sound | themightyglider | CC0 |
| splash, splash2 (also used for pour), bubble, hose layer | splash_04.ogg, splash_08.ogg, bubble_01.ogg, loop_water_01.ogg | 40 CC0 water/splash/slime SFX, https://opengameart.org/content/40-cc0-water-splash-slime-sfx | rubberduck | CC0 |
| squish, crack layer | mud_05.ogg, mud_03.ogg | 25 CC0 mud SFX, https://opengameart.org/content/25-cc0-mud-sfx | rubberduck | CC0 |
| sprinkle | adding_salt_01.ogg (first 1.6 s) | https://opengameart.org/content/adding-salt | TinyWorlds | CC0 |
| boil | cooking_without_cover_01.ogg (4 s, loop-crossfaded) | https://opengameart.org/content/boiling-water-loops | TinyWorlds | CC0 |

Kenney packs say: "License (Creative Commons Zero, CC0) ... You may use these assets in personal and commercial projects. Credit ... would be nice but is not mandatory." Each OpenGameArt page above lists CC0 as its license (checked 2026-10-16). No freesound content is used, because downloading from freesound needs an account.
- **Fizby's voice (public/voice/*.mp3, public/voice/intro/*.mp3):** pre-generated with **Kokoro-82M** (hexgrad), licensed **Apache-2.0**, which allows commercial use. Voice preset `am_eric`, shifted to a boy's pitch (~265 Hz) and formants (x1.17) with Praat's Change Gender via praat-parselmouth (GPL-3, build-time only; output audio is not covered), generated by scripts/gen_voice.py via **kokoro-onnx** (MIT). Phonemization uses espeak-ng (GPL) **at build time only**. It is not shipped or linked into the app, and its output audio is not covered by the GPL. The generated clips are Fizby Studio's assets.
- **Rendered art (brand/art, public/art):** Fizby poses, topic backgrounds and the icon head were supplied by Fizby Studio, generated to match brand/nico-model-sheet.jpg. Cutouts were made with rembg (MIT) using the isnet-general-use model (Apache-2.0), at build time only.
- **Fonts:** system fonts only.
- **Code dependencies:** Capacitor (MIT). Build tools: Vite (MIT), TypeScript (Apache-2.0), playwright-core (Apache-2.0, tests only), sharp (Apache-2.0, icon generation only).

## Cloned voice lines
Voice: the Fizby character voice (shared with Fizby's Fun & Learn) plus gap lines synthesized with Qwen3-TTS-12Hz-0.6B-Base (Apache-2.0, Alibaba Qwen) cloning the Fizby reference voice. Gated by Whisper WER 0 and speaker similarity >= 0.84 (scripts/pad-voice.py, scripts/clipcheck.py).

## Egg Smash SFX
eggTap, eggCrack1-3, eggBurst, toolHammer/Rock/Spoon/Pan/Mallet/Squeak (scripts/audio/sfx.py): Kenney Impact Sounds (CC0: impactWood_light_002, impactGlass_light_001-003, impactGlass_medium_001, impactMetal_light_002, impactWood_medium_001, impactMining_002, impactPlate_light_001, impactBell_heavy_001, impactPlate_heavy_001, impactSoft_heavy_001, impactSoft_medium_000), OGA CC0 water-splash splash_04, mud-sfx mud_05, creature cute_06; rest synthesized (CC0).
