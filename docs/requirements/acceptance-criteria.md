# Acceptance criteria

Work Order Schedule Timeline (Naologic front-end take-home). Generated from `acceptance-criteria.json` - edit the JSON, then run `node docs/requirements/render.mjs`.

Progress: 75 pass, 0 fail, 0 open decision, 2 pending.

Legend: `[x]` pass, `[ ]` pending, `[?]` open decision. An item may only be marked pass with an evidence command (test name, screenshot path or measurement output) in the JSON `evidence` field.

## Stack and scaffold

| | id | requirement | source | verify | priority | evidence |
|---|---|---|---|---|---|---|
| [x] | A1 | Angular 17+, standalone components, TypeScript strict mode, SCSS | brief | unit | must | e2e: [A1] app builds and serves the shell |
| [x] | A2 | Drawer form uses Reactive Forms (FormGroup, FormControl, Validators) | brief | unit | must | e2e: [A2] the drawer form is a Reactive Forms FormGroup with Validators |
| [x] | A3 | Status dropdown uses ng-select, restyled to match the design (no system dropdown) | brief, owner | visual | must | e2e: [A3] the status field is ng-select, restyled, with no system dropdown |
| [x] | A4 | Start and end dates use ngb-datepicker | brief | unit | must | e2e: [A4] the start and end dates use ngb-datepicker |
| [x] | A5 | Circular Std loaded from the CDN with the local docs/design/fonts fallback | brief, sketch | visual | must | e2e: [A5] Circular Std comes from the font CDN with a local fallback |

## Timeline grid and zoom

| | id | requirement | source | verify | priority | evidence |
|---|---|---|---|---|---|---|
| [x] | B1 | Work center panel on the left stays fixed while the timeline scrolls horizontally | brief, owner, ref | e2e | must | e2e: [B1] the work center panel stays fixed while the timeline scrolls sideways |
| [x] | B2 | Timeline grid scrolls horizontally | brief | e2e | must | e2e: [B2] the timeline grid scrolls horizontally |
| [x] | B3 | Timescale dropdown offers Day, Week, Month (Hour is optional extra) | brief, owner, ref | e2e | must | unit: timeline positions [B3] an hour column holds sixty minutes and is labelled with its hour |
| [x] | B4 | Default timescale is Month. The written brief says Day; the owner video, both candidate demos and every Sketch artboard show Month. The decision is recorded in docs/decisions/2026-11-08-grill-session.md (Q1). Month is the default; switching to Day later is a one-constant change. | owner, ref, cand | e2e | must | e2e: [B4] the default timescale is Month |
| [x] | B5 | Header row re-labels per zoom level (month names, week starts, day numbers) | brief, sketch | visual | must | e2e: [B5] the header row re-labels per zoom level |
| [x] | B6 | Current period indicator: highlighted current month pill in the header plus a vertical line on the grid | sketch, ref | visual | must | e2e: [B6] the Current month chip sits on the header line at the current month |
| [x] | B7 | Current day indicator line on the grid | brief | e2e | must | e2e: [B7] one 3px #d4d7ff today line, 709 long, on the edge of the current month |
| [x] | B8 | Initial view centres on today with a buffer (about two weeks either side in Day view) | brief | e2e | must | e2e: [B8] the initial view centres on today with a buffer |
| [x] | B9 | Row hover highlights the row background | brief, owner, ref | e2e | must | e2e: [B9] row hover: rail and timeline row, the placeholder box and its tooltip |
| [x] | B10 | Row height 48, bars aligned with their work center row, left panel width 380 | sketch, ref | visual | must | e2e: [B10] the first row is 60 high, the next rows 48 with a 1px divider |
| [x] | B11 | Grid lines 1px #e6ebf0, column dividers per timescale | sketch | visual | must | e2e: [B11] column lines run 747 down from the header line in every timescale |

## Work order bars

| | id | requirement | source | verify | priority | evidence |
|---|---|---|---|---|---|---|
| [x] | C1 | Bar start position equals work order start date, end position equals end date | brief | unit | must | unit: timeline positions [C1] a date is placed at the interpolated position of its column |
| [x] | C2 | Bar shows the work order name and a status badge | brief, sketch | visual | must | e2e: [C2] the bar shows the work order name and a status badge |
| [x] | C3 | Status colours: open and in-progress #3e40db, complete #08a268, blocked #b13600, on the badge fills #d6d8ff / #e1ffcc / #fceeb5 | sketch, brief | visual | must | e2e: [C3] every status has the colours of the design |
| [x] | C4 | Bar height 38, radius 8, 1px border #dee0ff / #d1fab3 / #fff5cf by status | sketch | visual | must | e2e: [C4] the bar is 38 high, has a radius of 8 and a 1px border |
| [x] | C5 | Three-dot actions button appears on bar hover and opens a menu with Edit and Delete | brief, owner, ref | e2e | must | e2e: [C5] the three-dot button appears on hover and opens a menu with Edit and Delete |
| [x] | C6 | Menu styled like the design (width 200, rows 28, radius 5), not a system menu | owner, sketch | visual | must | e2e: [C6] the menu is the menu of the design, not a system menu |
| [x] | C7 | Hover tooltip on the bar shows name, status and the full date range | brief, ref, cand | e2e | bonus | e2e: [C7] the bar shows a tooltip with name, status and the full date range |
| [x] | C8 | Drag handles at both ends of the bar on hover (design shows them) | sketch, ref | e2e | bonus | e2e: [C8] the bar shows a drag handle at both ends on hover |
| [x] | C9 | Drag a bar-end handle to resize the order ("Drag to resize" label of Timeline - Hover Options): snapped to days, live preview, refused on end before start or overlap, Escape cancels, Shift+Arrow and Alt+Shift+Arrow keys | sketch | e2e | bonus | e2e: [C9] a drag on a bar-end handle resizes the order, snapped to days, with checks and keys |

## Create and edit drawer

| | id | requirement | source | verify | priority | evidence |
|---|---|---|---|---|---|---|
| [x] | D1 | Drawer slides in from the right, width 591, radius 12, with the drop shadow from the design | owner, sketch, ref | visual | must | e2e: [D1] the drawer slides in from the right: 591 wide, radius 12, the design shadow |
| [x] | D2 | Header shows Work Order Details and the subtitle Specify the dates, name and status for this order | brief, sketch | visual | must | e2e: [D2] the header shows the title, the subtitle and the line under them |
| [x] | D3 | Clicking an empty timeline cell opens the create drawer with the start date pre-filled from the click position | brief, owner, ref | e2e | must | e2e: [D3] a click on an empty cell opens the create drawer with the start date of the click |
| [x] | D4 | End date defaults to start date plus 7 days | brief, ref | unit | must | unit: drawer form defaults [D4] the end date is the start date plus 7 days, also over a month end |
| [x] | D5 | Status defaults to Open on create | brief | unit | must | unit: drawer form defaults [D5] a new order is Open with an empty name |
| [x] | D6 | Edit mode pre-fills the fields and the submit button reads Save instead of Create | brief | e2e | must | unit: drawer form defaults [D6] edit fills the values of the order |
| [x] | D7 | Cancel closes the drawer without saving | brief | e2e | must | e2e: [D7] Cancel closes the drawer without a new order |
| [x] | D8 | Clicking outside the drawer closes it | brief | e2e | must | e2e: [D8] a click outside the drawer closes it |
| [x] | D9 | Escape closes the drawer | ref | e2e | bonus | e2e: [D9] Escape closes the drawer, but first closes an open dropdown |
| [x] | D10 | Tab moves between the fields | ref | e2e | bonus | e2e: [D10] Tab moves through the fields in order, End date above Start date |
| [x] | D11 | Text field shows the placeholder state and the active/focused state from the design | owner, sketch | visual | must | e2e: [D11] the text field shows the placeholder state and the focus state of the design |
| [x] | D12 | Date picker opens when the field is clicked; no separate calendar button | owner | e2e | must | unit: drawer form defaults [D12] dates read and write as DD.MM.YYYY, as in the design; e2e: datepicker-typing.spec.ts [D12] click keeps focus for typing; [D12] Start open, click End: End gets focus and typed text, Start unchanged; [D12] mouse pick, then partial text: no error until blur, then error, Create blocked |
| [x] | D13 | Status dropdown is a pill when collapsed and plain text when expanded | owner, sketch | visual | must | e2e: [D13] the status is a pill when collapsed and plain text in the open list |
| [x] | D14 | Button geometry: primary #5659ff and secondary white, 66x32, top right of the drawer | sketch | visual | must | e2e: [D14] Cancel and the primary button: 66 x 32 at the top right, white and #5659ff |
| [x] | D15 | Overlay behind the drawer dims the timeline | owner, sketch | visual | must | e2e: [D15] the overlay dims the page behind the drawer |

## Validation

| | id | requirement | source | verify | priority | evidence |
|---|---|---|---|---|---|---|
| [x] | E1 | All fields required, end date must be after start date, invalid form blocks save | brief | unit | must | unit: drawer form validation [E1] the shape check tells a wrong shape from a day that does not exist |
| [x] | E2 | Overlapping work order on the same work center is rejected and no order is created | brief, owner, ref | unit | must | unit: schedule service save and remove [E2] the new order gets a docId that no other order has |
| [x] | E3 | Edit ignores the order being edited when checking overlap | brief | unit | must | unit: schedule service save and remove [E3] save with a docId updates that order in place and ignores its old dates |
| [x] | E4 | Overlap error is shown to the user with a clear message | brief, owner | e2e | must | e2e: [E4] the overlap error names the work centre and sits between the buttons and the fields |
| [x] | E5 | Overlapping orders on different work centers are allowed | brief | unit | must | unit: schedule service save and remove [E5] the same range on another work centre is saved |

## Data

| | id | requirement | source | verify | priority | evidence |
|---|---|---|---|---|---|---|
| [x] | F1 | At least 5 work centers with realistic manufacturing names | brief | unit | must | unit: sample data [F1] at least 5 work centers with realistic manufacturing names |
| [x] | F2 | At least 8 work orders across the centres, all 4 statuses present, one centre with several non-overlapping orders | brief | unit | must | unit: sample data [F2] at least 8 work orders, all 4 statuses, one centre with several orders |
| [x] | F3 | Documents follow the docId / docType / data structure | brief | unit | must | unit: sample data [F3] the documents follow the docId / docType / data structure |
| [x] | F4 | Overlap detection lives in a service as a pure, testable function | brief, ref | unit | must | unit: sample data [F4] the overlap detection is a pure function of the service |
| [x] | F5 | localStorage persistence: work orders survive a reload | brief, ref | e2e | bonus | e2e: [F5] parity mode neither reads nor writes the storage |

## Visual fidelity

| | id | requirement | source | verify | priority | evidence |
|---|---|---|---|---|---|---|
| [x] | G1 | Every colour and size comes from docs/design/tokens.json, no guessed values | owner, sketch | visual | must | unit: design tokens [G1] every SCSS token variable matches tokens.json |
| [x] | G2 | Timescale chip geometry: label segment 75, value segment 71, height 25, radius 5 | sketch | visual | must | e2e: [G2] the timescale chip is 146 wide with the segments at 75 and 71 |
| [x] | G3 | Logo top left with the spacing from the design | ref, sketch | visual | must | e2e: [G3] the wordmark sits at (101, 20), 80 x 10, on a top bar without a border |
| [x] | G4 | Measure the rendered DOM against the token values (a script prints differences) | sketch, owner | visual | must | measure: .drawer border-bottom-left-radius = "12px" (expected "12px") |
| [x] | G5 | Type scale matches: body 14 Book, drawer title 20 Medium, chip 13 | sketch | visual | must | unit: design tokens [G5] type scale matches the token file |

## Deliverables

| | id | requirement | source | verify | priority | evidence |
|---|---|---|---|---|---|---|
| [x] | H1 | README with run steps, setup, approach and the libraries used with reasons | brief | manual | must | manual: README.md has requirements, setup and run, parity mode, tests, approach, libraries with reasons, bonus items, AI workflow and known limits; every command in it was run (b15-readme) |
| [ ] | H2 | Loom demo of 5 to 10 minutes covering every feature, overlap error and the code structure | brief | manual | must |  |
| [ ] | H3 | Public repository with a clean commit history | brief | manual | must |  |
| [x] | H4 | Prompts used with AI saved as markdown files | brief | manual | bonus | manual: docs/ai-prompts.md indexes the prompts and contracts in docs/requirements/prompts/*.md |
| [x] | H5 | Comments explain the date maths and the key decisions | brief | manual | must | e2e: [H5] comments explain the date maths and the key decisions |
| [x] | H6 | AI prompt log for this build kept in the repo | brief | manual | bonus | manual: docs/ai-prompts.md, AI prompt log: delegation, unit/prompt/notes/commit table, decisions, failures |

## Bonus features

| | id | requirement | source | verify | priority | evidence |
|---|---|---|---|---|---|---|
| [x] | I1 | Infinite horizontal scroll: more columns load as the user scrolls | brief, ref, cand | e2e | bonus | e2e: [I1] in Hour a scroll to the right end keeps adding columns, no empty area |
| [x] | I2 | Today button centres the viewport on today | brief, ref, cand | e2e | bonus | e2e: [I2] the Today button centres the viewport on today in every timescale |
| [x] | I3 | Smooth animations: drawer slide in and out, bar hover transitions | brief | manual | bonus | e2e: [I3] prefers-reduced-motion: reduce sets every duration to 0s |
| [x] | I4 | Automated test suite runs headless and passes | brief | unit | bonus | e2e: [I4] test:all runs build, vitest and playwright, and the suite is headless |
| [x] | I5 | Accessibility: aria labels on controls, focus management, keyboard reachable menu | brief | e2e | bonus | e2e: [I5] controls have names, bars and menus work with the keyboard, the drawer keeps the focus |
| [x] | I6 | OnPush change detection and trackBy on the timeline lists | brief | manual | bonus | e2e: [I6] every component uses OnPush and no template tracks by $index |
| [x] | I7 | Responsive: layout does not break on smaller screens, horizontal scroll acceptable | brief | manual | must | e2e: [I7] a phone screen keeps the timeline, the scroll and the drawer usable |
| [x] | I8 | The design covers Month only; Day and Week layouts are derived from the same tokens and look consistent | sketch | visual | must | e2e: [I8] Day and Week reuse the Month rows, bars and header of the design |
| [x] | I9 | Virtual scrolling for large ranges (brief l.439 "Consider virtual scrolling for performance with large ranges"): only the columns and bars near the view are in the DOM, the scroll position and the focus stay, a drag works across the window edge, parity mode renders every column | brief | e2e | bonus | e2e: [I9] parity mode renders every column |
| [x] | I10 | Drag the rail divider to resize the work center column ("Drag to resize" label at the rail edge of Timeline - Hover Options): blue line and label on hover, pointer drag with min and max width, Escape cancels, separator keys, width saved (not in parity mode) | sketch | e2e | bonus | e2e: [I10] a drag on the rail edge resizes the rail, with limits, Escape, keys and storage |
| [x] | I11 | Storybook for the main components: the work order bar (one story per status: Open, In progress, Complete, Blocked), the timescale chip (closed and open menu) and the drawer (create and edit), with the real components, the global styles, the tokens and the sample data. Scripts storybook and build-storybook, output storybook-static (ignored). The app build, vitest and Playwright do not pick up the stories. | lead | e2e | bonus | e2e: [I11] Storybook has stories for each bar status, the timescale chip and the drawer, outside the app build |
| [x] | I12 | Demo data (?demo=1, never in parity mode): a 'Load 5,000 orders' button next to Today makes about 5,000 orders with a seeded generator (all statuses, about 2 years around today, no overlap on a work centre); 'Load 50 work centres' adds 50 rows (not virtualized); 'Reset data' brings back the sample data; a live badge shows orders, bars and columns in the DOM and the frame time. The data stays in memory, nothing goes to localStorage. ?virtual=0 turns the column windowing off for a compare. | human | e2e | bonus | e2e: [I12] demo-data.spec.ts (6 tests); unit: demo.spec.ts [I12] no overlap, every status; effect: docs/requirements/notes/b19-demo-data.md |
| [x] | R1 | Neutral branding for the public repo: a "WO Timeline" text wordmark (public/wo-timeline-logo.svg) in the 80 x 10 logo box at (101, 20); localStorage keys wo-timeline.workOrders.v1 and wo-timeline.railWidth.v1 (no migration of the old keys); no company name in src/, tests/, public/ outside the font CDN URL. Parity pixels change only inside the logo box. | human | e2e | bonus | e2e: [R1] the top bar shows the neutral WO Timeline wordmark and the app uses the wo-timeline storage keys; pixel: Schedule - Default 0.21% -> 0.23%, +311 px all in logo box; notes: docs/requirements/notes/r1-brand.md |

## Demo evidence

| | id | requirement | source | verify | priority | evidence |
|---|---|---|---|---|---|---|
| [x] | J1 | A second Playwright config records a video per requirement test: headed Chrome, slow motion, files under docs/demo/videos/. The fast config used by verify.mjs is not affected. | brief | manual | bonus | e2e: [J1] the demo config records a headed, slow video per requirement test under docs/demo/videos |
| [x] | J2 | npm run demo runs the suite headed with video recording and produces one video per requirement test. | brief | manual | bonus | e2e: [J2] npm run demo runs the suite with the demo config, test:all keeps the fast config |
| [x] | J3 | docs/demo-script.md gives the exact click path for the Loom recording, including how to trigger the overlap error. | brief | manual | must | manual: docs/demo-script.md, 14 timed sections (9:40), overlap trigger on Genesis Hardware (Tab 2 times from Work Order Name to End date, Cmd+A, 01.11.2026 vs Concentrix Ltd); full script walked in order in headless Playwright at 400 ms per step from clean localStorage on 2026-11-11, 46/46 checks pass incl. S4 and S6 errors (b16-fix, docs/requirements/notes/b16-script.md) |

## Sources

- **brief**: FE-technical-test-10-2026.md
- **owner**: docs/videos/fe-kickoff-and-handover.md (task owner kickoff)
- **sketch**: docs/design/tokens.json (extracted from the Sketch file)
- **ref**: docs/videos/fe-reference-implementation-walkthrough.md (candidate walkthrough, Renvil Dsa)
- **cand**: docs/videos/fe-work-order-timeline-overview.md (candidate walkthrough, Jacob Hamel)
- **lead**: lead decision 'Storybook for the main components' (bonus wave)
- **human**: human request 'a button to dump a lot of work orders and show how virtualization works' (2026-11-11)

## Verification kinds

- **unit**: covered by an automated unit test
- **e2e**: covered by a browser test (Playwright or equivalent)
- **visual**: measured against docs/design/tokens.json, or screenshot compared to the design
- **manual**: verified by a human looking at the running app
