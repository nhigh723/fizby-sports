# Fizby Sports: design

Ages 3-6. No reading needed to play. Bright colours, one finger, big targets. Fizby talks the child through every game in the cloned Fizby voice.

## Screens
- **Title**: the Fizby's SPORTS! logo, Fizby waving, one big Play button.
- **Stadium hub**: 11 sport cards in front of a living stadium. The crowd does the wave, flags flap, and a ball rolls across the grass. A tapped card pokes and the crowd cheers, then the sport opens. On the first visit Fizby pops up, points and a hand shows where to tap.
- **Sport intro**: the sport's picture zooms in on a sunburst while Fizby names the sport and its goal. Tap to skip.
- **Play**: Back, Fizby (tap him to hear the goal again), level dots, **?** (Fizby shows the move with the hint hand and says it) and **restart**.
- **Win**: Fizby cheer-jumps, confetti and crowd. The teaching line plays, then the new sticker flies into the Sticker Book. The last level of every sport is the **Big game** (crowd along the top and a bigger celebration), and finishing it wins the sport's trophy.
- **Trophy Room**: two shelves of 11 trophies above the Sticker Book. The book has one page per sport with 10 stickers each. Missing stickers show as "?" silhouettes. Ball tabs turn the pages.
- **Grown-ups** (behind the hold-plus-sum gate):
  - up to 3 children, each with a name, a face and an age band
  - Fizby Club plans, Restore, Manage, Terms and Privacy
  - what this child practised
  - Music and Sounds volumes, Voice on/off, hold to reset

## Shared systems (from Fizby's Fun & Learn, copied in)
| File | What it does |
|---|---|
| `src/audio.ts` | Samples, music loops and ducking |
| `src/voicePlayback.ts` | One recorded-voice queue, assembled from the phrase index |
| `src/hint.ts` | Hand after the age-band delay, then a pulse and the spoken goal |
| `src/fizby2d.ts` | 2D poses (`nico.ts` in F&L) |
| `src/profiles.ts` | Up to 3 children and their age bands |
| `src/fkit.ts` | `kid()` team pals |

## Age bands (`src/profiles.ts` `tuning()`)
| Band | Hint after | Extra touch slack |
|---|---|---|
| 2-3 | 4 s | 16 px |
| 4-5 | 5 s | 8 px |
| 6+ | 7 s | 0 |

## Freemium
The first 2 levels of every sport are free. Without the Club, later levels play a free-level remix.

The Fizby Club has three plans: yearly or monthly, each with a 7-day trial, or Forever. Product IDs:
- `com.fizbystudio.sports.club.yearly`
- `com.fizbystudio.sports.club.monthly`
- `com.fizbystudio.sports.forever`

There are no ads, no analytics and no third-party SDKs (Kids Category 1.3). Purchases, outside links and sharing all sit behind the gate.
