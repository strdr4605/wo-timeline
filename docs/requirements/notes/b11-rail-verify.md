# b11-rail verify (I10 rail resize)

Verifier, 2026-11-11. Lead: t38. Node 26 (`/opt/homebrew/opt/node@26/bin`). The shell default
Node 16 cannot run npm 11, so the first run of the scripts failed for that reason only.
All browser checks are headless. Scripts: `hand.mjs`, `keys.mjs`, `at500.mjs` in the verifier
scratchpad.

## Pixels (`scripts/pixel-check.mjs`, steps and masks of session-handover-2026-11-10.md and u4-fix.md)

- Schedule - Default (bar and cursor masks) pass - 0.2%, handover 0.2% - pixel-check
- Schedule - Default `hover@727,322;wait@300` pass - 0.11%, handover 0.11% - pixel-check
- View Selection `click@200,167;wait@300` pass - 0.43%, handover 0.43% - pixel-check
- Options CTA (`fixture=hover`, mask `710,325,32,32`) pass - 0.31%, handover 0.31% - pixel-check
- Edit and Delete Expanded (`fixture=hover`, mask `859,320,32,32`) pass - 0.26%, handover 0.26% - pixel-check
- With Selection pass - 0.3% - pixel-check
- Placeholder and Defaults pass - 0.3% - pixel-check
- Active Text Field pass - 0.32% - pixel-check
- Status Dropdown pass - 0.29% - pixel-check
- Timeline - Hover Options, `Helpers/Button-Hover/Label [489,531,104,26]` pass - 75 bad px (2.77%
  of the box), `hover@482,544;wait@300`, zoom `474,523,124,42`: app box 489,531,103.2x26, same
  fill #687196, "Drag" Bold, rest regular. Diff is glyph anti-aliasing and a 0.8px narrower box
  edge - pixel-check zoom.png
- Rail line colour and width pass - design png x 481-483 = #3e40db (y 400, 700, 1020), x 480
  white, x 484 #f7f9fc. App png at hover: x 481-483 = #3e40db, x 480/484 rail and body fill.
  Computed `::before` 3px, rgb(62, 64, 219). The design has no layer for the line, so the export
  is the only source - pngjs on both pngs
- Line start y pass (known difference) - the mock line starts at y 229; the app line starts at
  y 204 (the app grid top). The mock is an older layout, so only the boxes count - pngjs

## Behaviour (Playwright, headless, 1440x1024)

- Hover pass - line opacity 0 -> 1, label opacity 0 -> 1, text "Drag to resize". Label at y 531
  for pointer y 544, at y 787 for pointer y 800 (follows pointer) - hand.mjs
- Pointer capture pass - `hasPointerCapture(1)` true after press. Pointer moved to y 950 (off the
  divider) still drags: width 428 for +48 - hand.mjs
- Cursor pass - divider `cursor: ew-resize`, `touch-action: none`. During a drag the cursor comes
  from the capture target in Chromium; headless cannot show the real cursor - computed style
- Label hides during drag pass - opacity 0 with `grid-rail-divider--dragging` - hand.mjs
- Save on release only pass - storage null during drag, "428" after release - hand.mjs
- Max/min tokens pass - drag to x 1400 gives 560, drag to x 5 gives 240, aria-valuenow same;
  saved `9999` loads as 560; saved `abc` loads as 380 - hand.mjs
- Escape cancels pass - drag 240 -> 400, Escape -> 240, more moves do nothing, release saves
  nothing new - hand.mjs, keys.mjs
- Right button pass - a right-button drag does not resize - at500.mjs
- Separator role pass - `role=separator aria-orientation=vertical aria-label="Work center column
  width" aria-valuenow=380 aria-valuemin=240 aria-valuemax=560 tabindex=0
  aria-controls=work-center-rail` - hand.mjs
- ArrowLeft/ArrowRight pass - step 20 (5 presses with 16-200 ms gaps: 240 -> 340), Home 240,
  End 560, clamped at the limits - keys.mjs
- Fast key presses observation - 5 presses with no gap give +40, not +100; 5 synchronous
  keydowns give +20. The handler reads `railValue()`, which follows the `railWidth` input only
  after the parent change detection. A real key repeat (about 30 ms) is above the 16 ms that
  works. Not a fail; see notes - keys.mjs
- Keyboard focus shows line and label pass - with the pointer away: line 1, label 1 at y 505
  (grid top 204 + labelTop 301). The design y is 531 from line top 230; the token is relative
  to the line top, so the keyboard place is 26px higher than the design. Minor - hand.mjs
- Reload keeps width pass - 300 before reload, 300 after, storage "300" - hand.mjs
- Parity: start 380 with saved 500 pass - hand.mjs
- Parity: saves nothing pass - key and drag leave storage at "500"; reload gives 380 - hand.mjs
- Parity: width stays 380 FAIL (plan reading) - a key or a drag in parity mode changes the width
  for the page (drag gives 450, keys give 500). The plan says "Parity mode: width stays 380, no
  saved width". The builder chose "changes for this page only" (b11-rail.md), and the [I10] e2e
  asserts 400 after a key in parity. Lead decision - hand.mjs, at500.mjs
- Bar positions pass - drag 380 -> 428: Konsulting bar +48. Saved 500 vs a 380 page: 4 bars
  +60, today marker +60. The start scroll centres today between the rail and the right edge,
  so a 120px wider rail moves the content by 60. Bars and today line stay aligned - hand.mjs
- Today line at changed width pass - +48 at 428, matches the bar shift - hand.mjs
- Hover placeholder at 500 pass - parity, pointer 847,322: box 795,303,113,38 and tooltip
  785,272 (the 380 values 675/665 + 120); over a bar the placeholder goes away - at500.mjs
- C9 at 500 pass - end handle drag +80 px: "Feb 22, 2027" -> "Mar 15, 2027", bar 479 -> 559 px
  wide - hand.mjs
- I5 at 500 pass - parity: Tab from the timescale chip focuses the first bar, Enter focuses
  menuitem Edit, Escape gives the focus back. Normal mode: Tab from Today focuses a bar. The
  divider is the last grid Tab stop - at500.mjs
- Today button at 500 pass - marker centre 1020.5, expected (102 + 500 + 1440) / 2 = 1021 - hand.mjs
- Narrow screen observation - viewport 1000, saved 500: rail 400 (40vw), aria-valuenow 500.
  Builder notes this. ArrowLeft does not change the visible width until the value goes under
  400 - hand.mjs
- Console pass - no page error and no console error in all runs - hand.mjs

## e2e `[I10]` (`tests/e2e/rail.spec.ts`)

- Drag pass - +60, bar moves 60, storage "440"
- Limits pass - 560 and 240
- Escape pass - back to 240
- Keyboard pass - arrows, Home, End, focus line and label
- Reload pass - 260 after reload
- Parity pass - 380 with a saved width, nothing saved, 380 after reload (it also asserts a key
  changes the width to 400 in parity, which is the plan point above)
- Today pass - centre within 3 px at 260

## Regressions

- `npm run build` pass - exit 0
- `npx vitest run` pass - 5 files, 31 tests
- `npx playwright test` run 1 pass - 74 passed (13.6s)
- `npx playwright test` run 2 pass - 74 passed (13.6s), no flaky
- `node docs/requirements/verify.mjs` pass - 67 pass, 6 pending, 0 fail, exit 0. Prints the
  known `unknown item id in test title: P9`

## Code

- Tokens pass - line width/colour, handle, gap, labelTop, min, max, step in
  `tokens.json` -> `_tokens.scss`; no literals in the new SCSS; the script reads the limits from
  CSS custom properties set from the tokens
- Scope pass - `jj diff --stat`: 13 files, all I10 (grid, app, schedule service storage path,
  tokens, criteria row, handover item 6, notes, e2e). The `tokens.json` motion line only gains a
  trailing comma
- Order pass - entry handlers before private helpers, `railKeyTarget` at the file bottom
- Duplication observation - the label styles copy the bar label rules of
  `work-order-bar.scss` (builder notes it)

## Failures

- Parity "width stays 380": a key or a drag in parity mode changes the width for the page (no
  save). Plan text says the width stays 380. Needs a lead decision: accept the builder reading,
  or block resize in parity and change the [I10] parity step.

## Lead decision

- Failure 1 is accepted as built. Parity mode treats the rail width as it treats work orders
  (F5): the start state is the design (380), a change stays in memory for the page, and nothing
  is saved. Pixel checks load a fresh page, so they always see 380.
