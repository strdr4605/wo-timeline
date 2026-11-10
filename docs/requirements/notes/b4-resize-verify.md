# Unit b4-resize: verify

Verifier, 2026-11-10. Lead: t38. Item: C9. Builder notes (`b4-resize.md`) checked, not trusted.
Node 26 (`/opt/homebrew/opt/node@26/bin`). Scripts: scratchpad `v/check.mjs`, `v/esc.mjs`.

## Pixels (`?parity=1`, states of `session-handover-2026-11-10.md`)

Schedule - Default (bar and cursor masks) pass - 0.2%, committed 0.2% - pixel-check
Schedule - Default `hover@727,322;wait@300` with masks pass - 0.11%, committed 0.11% - pixel-check
View Selection pass - 0.43%, committed 0.43% - pixel-check
Options CTA (`fixture=hover`, mask `710,325,32,32`) pass - 0.31%, committed 0.31% - pixel-check
Edit and Delete Expanded (`fixture=hover`, mask `859,320,32,32`) pass - 0.26%, committed 0.26% - pixel-check
Create New Event - With Selection / Placeholder and Defaults / Active Text Field / Status Dropdown pass - 0.3% / 0.3% / 0.32% / 0.29%, committed same - pixel-check
Helpers/Button-Hover/Label 979,394,104,26 pass - 4x zoom design vs app label: same box, radius, fill, "Drag" Bold and "to resize" Book, glyph AA only. App box 103.19 x 26, centred on the bar end (design: label centre 1031 = bar Group 7 right edge 1031), 3 px above the bar (design: label bottom 420, bar top 423). Computed: bg rgb(104,113,150) = #687196, radius 8px, padding 0 8px, h 26px, color rgb(249,250,255) = #f9faff, 14px, shadows `#e6ebf0 0 0 16 -8`, `#c8cfe9 0 2 4 -2` = design layer. Note: the design text layer lists `CircularStd-Bold` for the whole run, the PNG shows Bold "Drag" only; the app follows the PNG - Playwright computed style, zoom

## Behaviour (C9)

C9a hover pass - handle width 8px kept, `cursor: ew-resize`, label "Drag to resize" opacity 1 on the handle, `<span>` "Drag" weight 700, rest 400 - Playwright
C9b end handle pass - drag changes end only, live tooltip text updates on each move (Day 25px -> +1 day, Week 23px -> +1, 25px -> +2), bar redraws live - Playwright
C9b start handle pass - e2e step "a drag on the start handle moves the start date" (Sep 18 -> Oct 19), end unchanged - resize.spec.ts
C9b snap Day/Week/Month pass - whole days in each view (Day 48px/day, Week 114px/7 days, Month e2e 114px -> Feb 19) - Playwright
C9b snap Hour fail (deviation) - lead scope: "Hour: hour". App snaps to whole days in Hour view (500px no change, 600px -> +1 day, 1152px/day). Reason (builder): orders store `yyyy-mm-dd`, no hour. Needs a lead decision - Playwright, `timeline.ts dateAtPosition`
C9c end <= start pass - start handle dragged past the end: alert "The end date must be after the start date.", dates kept - Playwright
C9c overlap pass - end dragged into Compleks Systems: alert "These dates overlap another order on Konsulting Inc.", `role="alert"`, dates kept, alert gone after 4.3s - Playwright
C9c persist pass - valid release outside the bar: localStorage `endDate":"2027-02-19"`, same after reload (F5) - Playwright
C9d Escape pass - Escape during drag: preview reverts (Feb 3 -> Jan 21), mouse up after it commits nothing, store unchanged - Playwright
C9d no menu/drawer pass - after drags and releases `.work-order-menu--open` 0, `.drawer--open` 0 - Playwright
C9d pointer capture pass - pointer moved 80-200px below the bar, drag continues and commits - Playwright, resize.spec.ts
C9e keyboard pass - Shift+ArrowRight end +1 day, Alt+Shift+ArrowLeft start -1 day, menu stays closed; `aria-describedby="work-order-bar-help"` text names both keys - resize.spec.ts
C9 e2e title pass - `[C9] a drag on a bar-end handle resizes the order, snapped to days, with checks and keys` - resize.spec.ts:12

## Regressions

build pass - `npm run build` exit 0, no warning (after the budget change) - log
vitest pass - 29 passed (5 files) - log
playwright pass - 65 passed (13.7s), I5 included - log

## Code

K1 tokens fail (minor) - `layout.resizeAlert.showMs` generates `$layout-resize-alert-show-ms: 4000px` (wrong unit, unused); `app.ts` repeats the literal `RESIZE_ERROR_MS = 4000` - `_tokens.scss:273`, `app.ts`
K2 tokens pass - label gap, alert bottom, alert style use tokens; z-index 20 literal follows the repo habit - diff
K3 dead code / top-down pass - no dead code; helpers below entry points - diff
K4 scope fail - builder set I5 to `"status": "fail"` in `acceptance-criteria.json` with an ANSI error string. I5 e2e passes now (65/65). The builder claim "fails the same with my changes stashed" not reproduced - `acceptance-criteria.json` I5
K5 scope note - `angular.json` `anyComponentStyle` warning 4kB -> 6kB, outside the unit files; needed for a clean build (bar styles 4.35 kB) - diff

## Failures

- C9b snap Hour: snaps to a day, not an hour (deviation, lead decision).
- K1: `showMs` token unused and `4000px`; literal 4000 in `app.ts`.
- K4: I5 marked fail in `acceptance-criteria.json`, but I5 passes. Re-run `verify.mjs`.

## Lead fixes

- C9b Hour snap: accepted. Orders store calendar days (`yyyy-mm-dd`), so Hour view snaps to whole days (lead decision).
- K1: `layout.resizeAlert.showMs` removed from tokens (behaviour, not design); `RESIZE_ERROR_MS` stays a named constant in `app.ts`.
- K4: `verify.mjs` re-run: I5 and C9 pass; 59 pass, 13 pending.
