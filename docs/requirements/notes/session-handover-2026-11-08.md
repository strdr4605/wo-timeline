# Session handover, 2026-11-08

State at the end of the session. Read this first in the next session.

## Where the work stands

| Wave | Items | State |
|---|---|---|
| 0 | A1, A5, G1, G5 | done, verified |
| 1 | B1 to B11 | done, verified, fixed after the verifier (B6, B9, G2, G5) |
| 2 | C1 to C8, F1 to F4 | done, not verified yet |
| 3 | D1 to D15, E1 to E6 | not started |
| 4 | A2, A3, A4 (infinite scroll) | not started |
| 5 | Storybook bonus | not started |

Acceptance criteria: 28 pass, 1 fail (G4, the drawer, belongs to wave 3), 42 pending.

## What changed today after the wave 1 verification

- The Sketch Cloud file was opened with surf and the **official export** was pulled. The repo holds
  the nine artboards as 1x PNGs of 1440 x 1024 under `docs/design/assets/`, the wordmark and the
  other layers under `docs/design/assets/sketch-layers/`, and the `.sketch` source under
  `docs/design/source/`.
- `scripts/design-diff.mjs` compares a screenshot of the app with an artboard and prints the
  percentage of different pixels per region. `scripts/screenshot.mjs` takes the screenshot.
- `docs/requirements/notes/design-measurements.md` holds every value that was measured from the
  export: the logo box, the title box, the chip segments, the grid lines, the row heights, the
  hover colours, the bar boxes.
- `docs/requirements/DESIGN-PARITY.md` describes the parity mode (`?parity=1`: today frozen at
  2024-09-01, left edge, design fixture data set) and the masks for the diff.

## Known deviations that are still in the app

These are measured, not guessed. They are the work of the next unit.

1. G3: the logo is a blue placeholder. The wordmark is `docs/design/assets/sketch-layers/Group 3.png`
   (800 x 100), to be drawn at 80 x 10 at (101, 20).
2. The page title sits at y 110, the design has y 104.
3. G2: the chip value segment is `#e6ebf0`, the design has `#ffffff`. The chip also draws a
   `#979797` border, the Sketch placeholder stroke, the design has none.
4. B10: the first row is 48 high, the design has 60. Every row below sits 12px too high.
5. B9: the hovered timeline row is `#f1f3f8` at 75% alpha, the design has `#eef0ff`. The hovered
   rail row is `#fafbfd`.
6. B3: the timescale dropdown has Day, Week, Month. The design has Hour, Day, Week, Month.

## Process rules, changed today

- One **atomic unit** per builder, one builder per unit, about 50k tokens of context. Never a
  whole wave.
- A **fresh verifier** after every builder, with the unit in scope. The next unit starts only
  after the verifier has reported.
- The unit list and the prompts live in `docs/requirements/AGENT-PROMPTS.md`.
- The builder prompts must not ask the child to measure the artboard again. The measurements are
  in `design-measurements.md`. Two builders today burned their whole context on pixel scans and
  delivered no code.

## Next session, in this order

1. Unit 1, `docs/requirements/prompts/builder-parity.md`: parity mode and the six deviations
   above, one diff pass, one commit. Then `docs/requirements/prompts/verifier-parity.md`.
2. Unit 2, drawer shell. Unit 3, drawer fields. Unit 4, drawer actions. One verifier each.
3. Unit 5, infinite scroll (A2, A3, A4).
4. Unit 6, Storybook bonus.
5. The demo videos (`npm run demo`) and the Loom script `docs/demo-script.md`.
6. The public repository cut: the app, the README, the prompt log, `docs/design/tokens.json` and
   `docs/requirements/`. No videos, no Sketch source, no binary assets.

## Open decisions for the human

- The font: the CDN link to Circular Std stays primary. A builder added local fallback
  declarations. Keep them or remove them?
- The logo: the exported wordmark is used as an image. A hand made SVG would scale better. The
  exported PNG is 10 times the size of the box, so it is sharp.
