# b2-today: Today button (I2)

## What changed

- `src/app/app.html`: a "Today" button in the toolbar, right of the timescale chip. It is not
  rendered in parity mode (`@if (!parityMode)`). A click calls `centerOnToday(true)` on the grid
  through the template reference `#grid`.
- `src/app/app.ts`: exposes `PARITY_MODE` to the template.
- `src/app/app.scss`: `.toolbar` is a flex row with an 8px gap (`$layout-badge-padding-x`).
  `.today-button` uses the chip tokens: height 25px, radius 5px, white fill, the chip shadow as
  its border, the chip value font (13px Medium, `#3e40db`). Hover uses `$color-surface-chip-bg`.
  The focus ring is the chip focus ring (`$color-border-focus`, 1px solid), with a 1px offset.
- `src/app/timeline-grid/timeline-grid.ts`: `centerOnToday` is now public and takes `smooth`.
  It uses `scrollTo` with `behavior: 'smooth'`, or `'instant'` when the user prefers reduced
  motion or for the first load. The maths is the same as before.
- `tests/e2e/today.spec.ts`: `[I2]` test. It checks parity mode (no button), each timescale
  (scroll to 0, click, today line within 3px of the visible centre), keyboard Tab and Enter, and
  the focus ring.

## Checks

- Pixel check, Schedule - Default, bar and cursor masks: before 0.2% (Group 5 1450 px), after
  0.2% (Group 5 1450 px). No change.
- Hand check with Playwright: the today line lands at -2px from the centre (its left edge; the
  centre of the line is on the middle) for Hour, Day, Week, Month, and after keyboard Enter.
- `npm run build` clean, `npx vitest run` 29 passed, `npx playwright test` 63 passed.
- `verify.mjs`: I2 is now pass with the e2e evidence (57 pass, 14 pending).

## Differences

- None in parity mode. The button is outside the design, by the lead decision.
