# b15-verify (H1 README.md, J3 docs/demo-script.md)

Verifier: Claude, 2026-11-11. Node 26.13.0 (`/opt/homebrew/bin/node`), npm 11.20.0. Dev server of the
lead on :4200. Headless only. No file of the unit was changed: `jj diff --stat` is the same before
and after (`verify.mjs` and `npm run tokens` wrote the same content again).

Walkthrough scripts: scratchpad `j3/walk.mjs`, `j3/s4.mjs`, `j3/focus.mjs`, `j3/s6.mjs`, `j3/m.mjs`.

## H1 checks

- H1 run steps pass - `npm start` = `ng serve --port 4200` in package.json; :4200 answers 200 - package.json
- H1 setup pass - Node minimum correct: vitest 5.1.0 engines `^22.12.0 || ^24.0.0 || >=26.0.0`, @angular/core `^20.19.0 || ^22.12.0 || >=24.0.0` - node_modules/*/package.json
- H1 `npm run build` pass - exit 0 - run
- H1 `npx vitest run` pass - 5 files, 31 passed - run
- H1 `npx playwright test` pass - 87 passed - run
- H1 `npm run test:all` pass - run 1: 1 fail `[B3]` (`cell!.width`, boundingBox null, timeline.spec.ts:82) while my walkthrough loaded the same server; run 2: 87 passed, exit 0; `[B3]` alone `--repeat-each=10`: 10 passed. Flaky under load only - run
- H1 `DEMO_HEADLESS=1 npm run demo` pass - 86 passed, exit 0, no window - run
- H1 `npm run build-storybook` pass - "Storybook build completed successfully" - run
- H1 `npm run storybook` pass - HTTP 200 on :6006, then stopped (000) - run
- H1 `npm run tokens` pass - `_tokens.scss` same as before - run
- H1 `node docs/requirements/verify.mjs` pass - 72 pass, 3 pending; prints `unknown item id ... P9` as the README says - run
- H1 pixel-check command pass - 0.2% mismatch (masks excluded) - run
- H1 libraries pass - every library in the table is in package.json; versions match (20.3.35, 19.0.1, 2.11.8, 20.7.0, 5.1.0, 1.65.0, 10.6.5, ~5.9.2); `@angular/localize/init` polyfill in angular.json:27 - package.json, angular.json
- H1 approach claims pass - OnPush in all 5 components; `@for` tracks by id/key (timescale options are strings); storage keys `naologic.workOrders.v1`, `naologic.railWidth.v1` (schedule.service.ts:106,108); `overlaps()` inclusive, skips edited docId (overlap.ts); `[G1]` unit test checks SCSS vs tokens.json; Q1 in grill-session.md - code
- H1 code structure table pass - every path exists; `drawer-form.ts` holds defaults and dotted date format - ls, code
- H1 parity claims pass - `?parity=1`: chip on Sep 2024, 4 design bars, no Today button - Playwright
- H1 bonus table pass - every listed id is `[x]` in acceptance-criteria.md - acceptance-criteria.md
- H1 known limits pass - 375 px: title x 101, drawer subtitle 40 px high at 20 px line height (2 lines); Hour column 48 = Day column 48; handle width 8px - Playwright
- H1 STE style pass - short sentences, active voice, one idea each - README.md
- H1 minor (not a failure) - `.pixel-check/<artboard>/` is a slug in practice (`.pixel-check/work-order-schedule-default/`) - pixel-check output
- H1 minor (not a failure) - dev tooling `@angular-devkit/build-angular`, `@angular/build`, `@angular/cli` has no row in the libraries table - package.json

## J3 checks

- J3 duration fail - the table rows add up to 9:20 (560 s), not the stated 9:00. Still inside 5 to 10 min - demo-script.md time budget
- J3 coverage pass - every feature, overlap error and code tour (H2) have a section - demo-script.md
- J3 file paths pass - all 13 paths in section 13 exist; `docs/demo/videos/B3-the-timescale-dropdown-offers-hour-day-week-and-month.webm` exists - ls
- J3 S1 pass - npm start command correct - package.json
- J3 S2 pass - rail "Work Center", chip "Current month", 1 today line, tooltip "Concentrix Ltd / Complete / Oct 18, 2026 to Feb 22, 2027", 4 statuses on the named bars, menu Hour,Day,Week,Month, chips "Current week", "Today", "Today", hour labels `07:00`.. (time of day dependent) - Playwright
- J3 S3 pass - (638,268) is row 1 Genesis Hardware, column "Aug 2026" (x 581-695); placeholder "Click to add dates"; drawer "Work Order Details", focus `#drawer-name`, start 16.08.2026, end 23.08.2026, Open, "Create" - Playwright
- J3 S4 overlap trigger FAIL - see Failures J3 - Playwright
- J3 S5 pass - three-dot at bar right end, menu Edit,Delete; edit values match; save gives `in-progress`; Delete removes "Demo Overlap" - Playwright
- J3 S6 FAIL for steps 2, 4, 6 (same cause as S4); messages in code match the script texts exactly when the text reaches the field - Playwright, work-order-drawer.ts:134,154,305,307
- J3 S7 bar pass with minor - "Drag to resize" label shows; +57 px from 4 px inside the end gives 05.02.2027, not 06.02.2027 (depends on grab point); drag to x 1430 reverts and shows "These dates overlap another order on Konsulting Inc.", gone after 4.3 s; Escape during drag reverts - Playwright
- J3 S7 rail minor - edge at x 478-486, label "Drag to resize"; +100 px gives 480 px, script says "about 476 px"; limits 240/560 correct - Playwright
- J3 S8 minor - Today scrolls back; today line at x 1009 with the rail widened in S7 (centre of timeline area 1011). Script says x 959, which is the value for the 380 px rail only - Playwright
- J3 S9 pass - Tab: chip, Today, first bar; Enter -> Edit, Down -> Delete, Escape closes and focus back on bar; Shift+Right 22.02 -> 23.02, Shift+Left back; 8 Tabs: 7 bars then "Work center column width" (script says "through the 8 bars": wording off by one, result correct); Right +20, Home 240, End 560; mouse click on edge gives no focus - Playwright
- J3 S10 pass with minor - 73 columns at start; left edge 73 -> 103 columns; right edge -> 133; header cells 33 with the 560 px rail of S9 (script says about 37) - Playwright
- J3 S11 pass - after reload: "Concentrix Ltd Edited", Konsulting end kept, rail 560, both storage keys, document structure `{docId, docType, data}` - Playwright
- J3 S12 pass - Sep 2024 current, 4 design bars, no Today button - Playwright
- J3 S14 FAIL count - `docs/demo/videos/` has 81 `.webm` files after `DEMO_HEADLESS=1 npm run demo` (all fresh), not 67 - ls
- J3 acceptance row - `J3` is `[x]` with evidence "every click path checked in headless Playwright"; not true for S4 and S6 - acceptance-criteria.md:132

## Failures H1

(none)

## Failures J3

1. S4 overlap trigger does not work as written. A click on "End date" opens the ngb-datepicker
   and moves the focus to a calendar day (`ngb-dp-day`) at once (0 ms, 50 ms, 150 ms, 400 ms
   after the click). "Select all the text and type `01.11.2026`" then types into nothing. The
   field keeps 23.08.2026. "Create" saves the order with no overlap and closes the drawer.
   4 of 4 runs at human speed (300 ms after the click). Only a keystroke sent before the focus
   move (first scripted run) reached the field. A second click on the field closes the calendar
   and leaves the focus in the input; Tab from "Status" also reaches "End date" (D10).
   Steps 4.1 and 4.4.
2. S6 steps 2, 4, 6 have the same cause. Edit of "Concentrix Ltd": click "End date", Cmd+A, type
   `01.10.2026` -> value stays 22.02.2027, no error, "Save" closes the drawer.
3. Time budget total says 9:00. The rows add up to 9:20.
4. S14 says 67 video files. `docs/demo/videos/` has 81.
5. Minor numbers that do not match the script order: S7 rail "about 476 px" is 480; S8 today line
   "x 959" is x 1009 after the S7 rail change; S7 end date 06.02.2027 depends on the grab point
   (05.02.2027 measured); S10 "about 37" header cells is 33 with the 560 px rail; S9 step 6 "through
   the 8 bars" is 7 bars and then the rail edge.
6. `J3` row in acceptance-criteria is `[x]` with evidence that does not hold until 1 and 2 are fixed.
