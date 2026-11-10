# b16-verify2: re-verify J3 (docs/demo-script.md) after b16-fix

Verifier walk: own script (not `b16-walk.mjs`), headless Chromium, 1440 x 1024,
`http://localhost:4200`, `localStorage.clear()` first, 350 ms after each step, real clicks and
key presses, keys typed with 90 ms between characters, no direct value set. Script order S0 to
S12. Storage cleared at the end. Date: 2026-11-11. Result: 60 checks, 0 walk failures.

## Click path

- S0 pass - clean storage shows 8 bars - walk
- S1 pass - `npm start` = `ng serve --port 4200`; Angular 20.3.35; 5 work centres, 8 work orders in `sample-data.ts` - package.json, sample-data.ts
- S2.2 pass - "Current month" chip and `.grid-today-marker` visible - walk
- S2.3 pass - tooltip "Konsulting Inc In progress Sep 18, 2026 to Jan 21, 2027" - walk
- S2.4 pass - Concentrix Ltd Complete, Rodriques Electrics Open, Konsulting Inc In progress, McMarrow Distribution Blocked - walk
- S2.5-9 pass - chip "Timescale Month"; Week -> "Current week", Day -> "Today", Hour -> "Today" (17:00, 18:00 in view), Month -> "Current month" - walk
- S3.1 pass - x 638 y 268 is row "Genesis Hardware", column "Aug 2026" (x 581..695); "Click to add dates" shows - walk
- S3.2-3 pass - drawer "Work Order Details", focus `#drawer-name`, 16.08.2026 / 23.08.2026, Open, Create - walk
- S4.1 pass - Tab 1 `#drawer-status`, Tab 2 `#drawer-end`; Cmd+A, type, Tab -> value 01.11.2026 - walk
- S4.3 pass - drawer stays open, "These dates overlap another order on Genesis Hardware." at y 99, buttons at y 25; no "Demo Overlap" bar - walk
- S4.4-6 pass - name click, 2 Tab -> `#drawer-end`, 15.10.2026, Create: drawer closes, bar "Demo Overlap Aug 16, 2026 to Oct 15, 2026" - walk
- S5.1-3 pass - three-dot visible on hover; menu Edit, Delete; drawer Concentrix Ltd / 18.10.2026 / 22.02.2027, Save - walk
- S5.4-5 pass - name "Concentrix Ltd Edited", status In progress, drawer closes, bar shows In progress - walk
- S5.6-7 pass - Delete removes "Demo Overlap" - walk
- S6.2-3 pass - 2 Tab -> end, 01.10.2026, Save: "The end date must be after the start date.", drawer open - walk
- S6.4-5 pass - 40.13.2026, Tab -> focus `#drawer-start`, "40.13.2026 is not a valid date." - walk
- S6.6-7 pass - Shift+Tab -> `#drawer-end`, 12.2026, Tab: "Enter the date as dd.mm.yyyy." - walk
- S6.8-10 pass - empty name, Save: "Enter a work order name."; Escape closes, dates unchanged (Oct 18, 2026 to Feb 22, 2027) - walk
- S7.1-3 pass - end handle 8 px, "Drag to resize"; +57 px: Jan 21, 2027 -> Feb 5, 2027 - walk
- S7.4-5 pass - drag to x 1430: alert "These dates overlap another order on Konsulting Inc.", bar reverts, alert gone after 4.3 s - walk
- S7.7-9 pass - divider x 478..486, label shows at x 482; +100 px: 380 -> 480 px; limits 240 px / 560 px in `_tokens.scss` - walk, src/styles/_tokens.scss:287-288
- S8 pass - wheel right (scrollLeft 8542), Today: scrollLeft 3714, today line x 1010.5 - walk
- S9.2-4 pass - Tab order chip, Today, "Concentrix Ltd Edited" (outline solid 1px); Enter -> Edit, Down -> Delete, Escape -> bar - walk
- S9.5 pass - Shift+Right: Feb 22, 2027 -> Feb 23, 2027; Shift+Left back - walk
- S9.6 pass - 8 Tab: 7 other bars, then "Work center column width" - walk
- S9.7 pass - Right 500, Home 240, End 560 px - walk
- S10.1-2 pass - wheel left: scrollWidth 8997 -> 67137 (scrollLeft 2955, no jump to 0); wheel right: -> 231297 - walk
- S10.3 pass - start range 13 + 2 x 30 = 73 Month columns (`BUFFER.Month` 6, `EXTEND_CHUNK` 30); 33 header cells with 560 px rail - walk, timeline.ts:31, timeline-grid.ts:691
- S11 pass - reload keeps "Concentrix Ltd Edited", Konsulting end Feb 5, 2027, rail 560 px; keys `naologic.workOrders.v1`, `naologic.railWidth.v1` - walk, schedule.service.ts:106-108
- S12 pass - `?parity=1`: 4 bars, no Today button, columns from Mar 2024, `PARITY_TODAY` 2024-09-01; normal data unchanged after - walk, parity.ts:20

## Document checks

- Time budget pass - rows 20+50+40+40+50+40+50+20+40+30+20+20+100+40 s = 560 s = 9:20; table and intro say 9:20; inside 5 to 10 min - demo-script.md
- S13 paths pass - all 13 files exist - ls
- S14 pass - `test:all` = build + vitest + playwright; `tests/unit/`, `tests/e2e/` exist; `[E1]` ids in specs; `DEMO_HEADLESS` in `playwright.demo.config.ts`; B3 video exists; 3 `*.stories.ts` (bar, chip, drawer) - package.json, ls
- Errors pass - S4 shows the overlap error on Create; S6 shows the 4 validation errors (date order, invalid date, format, name), not an overlap; S7.5 shows the overlap alert on drag - walk
- H2 coverage fail - brief "Interactions Summary" rows "Click outside panel -> Close panel" and "Click Cancel -> Close panel" are not in the script. Row hover highlight is not named (S3.1 shows the placeholder only) - FE-technical-test-10-2026.md:162-178
- Code structure pass - S13, 11 steps, 1:40 - demo-script.md
- J3 row evidence pass - Tab path, 01.11.2026 vs Concentrix Ltd, 9:20, 14 timed sections confirmed by own walk - acceptance-criteria.md:132

## Regressions

- `npm run build` pass - clean
- `npx vitest run` pass - 31 passed
- `npx playwright test` pass - 87 passed

## Failures

1. H2 coverage: the script does not show "Cancel" or "click outside the panel" to close the drawer
   (brief section 5, Interactions Summary). It does not name the row hover highlight. Add one step
   (for example in S5 or S6: open Edit, click Cancel; open again, click outside the drawer). J3
   itself (click path and overlap trigger) holds.

## Lead fixes

- Section 5 now shows the row hover highlight, "Cancel" and a click outside the panel (the
  overlay calls `cancel()`, `work-order-drawer.html:1`). Section 5 time is 1:10, total 9:40.
  The J3 row evidence says 9:40.
