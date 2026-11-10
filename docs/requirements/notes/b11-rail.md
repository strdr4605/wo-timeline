# b11-rail: rail resize (I10)

Source: artboard "Timeline - Hover Options", layer `Helpers/Button-Hover/Label` with the text
"Drag to resize" at 489,531,104,26, and the blue line at the rail edge. The line has no layer in
`artboards.json`. The export shows it: 3px `#3e40db`, x 481 to 483, from y 230 to the bottom.

## What changed

- `src/app/timeline-grid/`: new element `.grid-rail-divider` with `role="separator"`,
  `aria-orientation="vertical"`, the name "Work center column width", `aria-valuenow`,
  `aria-valuemin`, `aria-valuemax` and `aria-controls` (the rail). It is an 8px zone on the line
  between the rail and the timeline. It has no layout width (negative margins). It is sticky,
  so it moves with the rail.
  - Hover, keyboard focus and drag show the 3px line (`::before`, 120ms fade, the
    `durationFast` motion token). Hover and keyboard focus show the label "**Drag** to resize"
    5px right of the line. The label is at the pointer y. With the keyboard focus and no pointer,
    it is at the design place (301px below the grid top). The label hides during a drag, the
    same rule as the bar label of C9.
  - Pointer drag: pointer capture, cursor `ew-resize`, `touch-action: none`. The width is
    clamped to 240..560. The release emits `railWidthChange`. Escape (document listener) and
    `pointercancel` put the width back.
  - Keys: ArrowLeft and ArrowRight change the width by 20. Home and End go to 240 and 560.
  - The limits are tokens. The CSS gives them to the divider as custom properties. The script
    reads them once after the first render (the grid reads `--column-width` the same way).
  - The rail width is `min(clamp(240px, var(--rail-width, 380px), 560px), 40vw)`. The 40vw limit
    for narrow screens stays.
- DOM order: the divider is the last child of `.grid__inner`. CSS `order` puts it between the
  rail and the timeline (`.grid__timeline` has `order: 2`). Reason: Tab must still go from the
  toolbar to the first bar (I5 and I2 tests). The divider is the last Tab stop of the grid.
- `src/app/data/schedule.service.ts`: new signal `railWidth` and `saveRailWidth()`, key
  `naologic.railWidth.v1`. `readStorage` and `writeStorage` now take the key, so both values
  use the same F5 path. Parity mode does not read the saved width and does not write. A drag in
  parity mode changes the width for that page only.
- `src/app/app.*`: passes `railWidth` to the grid and saves `railWidthChange`.
- Tokens: `layout.railResize` (handleWidth 8, lineWidth 3, lineColor `#3e40db`, labelGap 5,
  labelTop 301, minWidth 240, maxWidth 560, keyStep 20). The reasons are in
  `agentChoices["layout.railResize (b11-rail)"]`.
- `acceptance-criteria.md` / `.json`: new row I10 (bonus, e2e, sketch). `verify.mjs` set it to
  pass.
- `session-handover-2026-11-10b.md`: I10 is item 6, after J1/J2, before I1 and I9.

## Pixel check

- `Schedule - Default`, bar masks: 0.21% before, 0.21% after.
- `Schedule - Default`, `hover@727,322;wait@300`, bar and cursor masks: 0.11% before, 0.11%
  after.
- View Selection 0.43%, Options CTA 0.31%, Edit and Delete Expanded 0.26%, Placeholder and
  Defaults 0.3%, With Selection 0.3%. All the same as the handover values.
- Label against the design box (`--artboard="Timeline - Hover Options"
  --steps="hover@482,544;wait@300" --zoom="474,523,124,42"`, no full-artboard diff):
  `Helpers/Button-Hover/Label [489,531,104,26]`: 75 bad px, 2.77% of the box. App box 103.2 x
  26 at 489,531. The rest is glyph anti-aliasing.
- Line: app pixels at x 481, 482, 483 are `#3e40db` (y 700), as in the export. x 480 and x 484
  are the rail and body fills.

## Checked by hand (Playwright, headless)

- Drag +48 at width 380 gives 428. The bars move 48 px right. The release saves "428".
- Limits hold at 560 and 240. Escape during a drag puts the width back, nothing is saved.
- At width 500: the hover placeholder is 52 px left of the pointer (token), as at 380. The Today
  button centres today between the rail edge and the right edge (1021, expected 1021). A C9 end
  drag changes the end date. Tab from the chip reaches a bar.
- Parity: 380 with a saved width. A key changes the width but saves nothing. A reload gives 380.

## What still differs

- The mock line starts at y 230 (older layout). The app line runs the full grid height from
  y 204.
- On a screen under 1400px wide, the 40vw limit can make the rail narrower than
  `aria-valuenow`.
- The label styles are a copy of the bar label rules in `work-order-bar.scss`. A shared mixin
  would change the bar unit, so it is left for later.

## Tests

- `tests/e2e/rail.spec.ts`: `[I10]`, one test with steps (separator values, hover line and
  label, drag and storage, limits, Escape, keys, focus, reload, Today, parity). Passed 3 of 3
  with `--repeat-each=3`.
- `npm run build` clean. `npx vitest run` 31 passed. `npx playwright test` 74 passed (73 before
  plus `[I10]`).
- `node docs/requirements/verify.mjs`: 67 pass, 6 pending, 0 fail. It still prints the known
  `unknown item id in test title: P9`.
- Dev server note: the watcher kept a stale error ("Can't bind to 'railWidth'") after the edits.
  A `touch` of the changed files made it rebuild. The server was not restarted.
