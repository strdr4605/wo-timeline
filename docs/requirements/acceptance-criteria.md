# Acceptance criteria

Work Order Schedule Timeline (Naologic front-end take-home). Generated from `acceptance-criteria.json` - edit the JSON, then run `node docs/requirements/render.mjs`.

Progress: 16 pass, 4 fail, 0 open decision, 51 pending.

Legend: `[x]` pass, `[ ]` pending, `[?]` open decision. An item may only be marked pass with an evidence command (test name, screenshot path or measurement output) in the JSON `evidence` field.

## Stack and scaffold

| | id | requirement | source | verify | priority | evidence |
|---|---|---|---|---|---|---|
| [x] | A1 | Angular 17+, standalone components, TypeScript strict mode, SCSS | brief | unit | must | e2e: [A1] app builds and serves the shell |
| [ ] | A2 | Drawer form uses Reactive Forms (FormGroup, FormControl, Validators) | brief | unit | must |  |
| [ ] | A3 | Status dropdown uses ng-select, restyled to match the design (no system dropdown) | brief, owner | visual | must |  |
| [ ] | A4 | Start and end dates use ngb-datepicker | brief | unit | must |  |
| [x] | A5 | Circular Std loaded from the CDN with the local docs/design/fonts fallback | brief, sketch | visual | must | e2e: [A5] Circular Std comes from the Naologic CDN with a local fallback |

## Timeline grid and zoom

| | id | requirement | source | verify | priority | evidence |
|---|---|---|---|---|---|---|
| [x] | B1 | Work center panel on the left stays fixed while the timeline scrolls horizontally | brief, owner, ref | e2e | must | e2e: [B1] the work center panel stays fixed while the timeline scrolls sideways |
| [x] | B2 | Timeline grid scrolls horizontally | brief | e2e | must | e2e: [B2] the timeline grid scrolls horizontally |
| [x] | B3 | Timescale dropdown offers Day, Week, Month (Hour is optional extra) | brief, owner, ref | e2e | must | e2e: [B3] the timescale dropdown offers Day, Week and Month |
| [x] | B4 | Default timescale is Month. The written brief says Day; the owner video, both candidate demos and every Sketch artboard show Month. The decision is recorded in docs/decisions/2026-11-08-grill-session.md (Q1). Month is the default; switching to Day later is a one-constant change. | owner, ref, cand | e2e | must | e2e: [B4] the default timescale is Month |
| [x] | B5 | Header row re-labels per zoom level (month names, week starts, day numbers) | brief, sketch | visual | must | e2e: [B5] the header row re-labels per zoom level |
| [x] | B6 | Current period indicator: highlighted current month pill in the header plus a vertical line on the grid | sketch, ref | visual | must | e2e: [B6] the current period shows a pill in the header and a vertical line |
| [x] | B7 | Current day indicator line on the grid | brief | e2e | must | e2e: [B7] the grid shows a line for the current day |
| [x] | B8 | Initial view centres on today with a buffer (about two weeks either side in Day view) | brief | e2e | must | e2e: [B8] the initial view centres on today with a buffer |
| [x] | B9 | Row hover highlights the row background | brief, owner, ref | e2e | must | e2e: [B9] hovering a row highlights the row background |
| [x] | B10 | Row height 48, bars aligned with their work center row, left panel width 380 | sketch, ref | visual | must | e2e: [B10] rows are 48 high and the work center panel is 380 wide |
| [x] | B11 | Grid lines 1px #e6ebf0, column dividers per timescale | sketch | visual | must | e2e: [B11] grid lines are 1px #e6ebf0 and columns follow the timescale |

## Work order bars

| | id | requirement | source | verify | priority | evidence |
|---|---|---|---|---|---|---|
| [ ] | C1 | Bar start position equals work order start date, end position equals end date | brief | unit | must |  |
| [ ] | C2 | Bar shows the work order name and a status badge | brief, sketch | visual | must |  |
| [ ] | C3 | Status colours: open and in-progress #3e40db, complete #08a268, blocked #b13600, on the badge fills #d6d8ff / #e1ffcc / #fceeb5 | sketch, brief | visual | must | measure: selector not found: .work-order-bar[data-status='blocked'] |
| [ ] | C4 | Bar height 38, radius 8, 1px border #dee0ff / #d1fab3 / #fff5cf by status | sketch | visual | must | measure: selector not found: .work-order-bar |
| [ ] | C5 | Three-dot actions button appears on bar hover and opens a menu with Edit and Delete | brief, owner, ref | e2e | must | measure: selector not found: .work-order-bar__actions |
| [ ] | C6 | Menu styled like the design (width 200, rows 28, radius 5), not a system menu | owner, sketch | visual | must |  |
| [ ] | C7 | Hover tooltip on the bar shows name, status and the full date range | brief, ref, cand | e2e | bonus |  |
| [ ] | C8 | Drag handles at both ends of the bar on hover (design shows them) | sketch, ref | e2e | bonus |  |

## Create and edit drawer

| | id | requirement | source | verify | priority | evidence |
|---|---|---|---|---|---|---|
| [ ] | D1 | Drawer slides in from the right, width 591, radius 12, with the drop shadow from the design | owner, sketch, ref | visual | must |  |
| [ ] | D2 | Header shows Work Order Details and the subtitle Specify the dates, name and status for this order | brief, sketch | visual | must |  |
| [ ] | D3 | Clicking an empty timeline cell opens the create drawer with the start date pre-filled from the click position | brief, owner, ref | e2e | must |  |
| [ ] | D4 | End date defaults to start date plus 7 days | brief, ref | unit | must |  |
| [ ] | D5 | Status defaults to Open on create | brief | unit | must |  |
| [ ] | D6 | Edit mode pre-fills the fields and the submit button reads Save instead of Create | brief | e2e | must |  |
| [ ] | D7 | Cancel closes the drawer without saving | brief | e2e | must |  |
| [ ] | D8 | Clicking outside the drawer closes it | brief | e2e | must |  |
| [ ] | D9 | Escape closes the drawer | ref | e2e | bonus |  |
| [ ] | D10 | Tab moves between the fields | ref | e2e | bonus |  |
| [ ] | D11 | Text field shows the placeholder state and the active/focused state from the design | owner, sketch | visual | must |  |
| [ ] | D12 | Date picker opens when the field is clicked; no separate calendar button | owner | e2e | must |  |
| [ ] | D13 | Status dropdown is a pill when collapsed and plain text when expanded | owner, sketch | visual | must |  |
| [ ] | D14 | Button geometry: primary #5659ff and secondary white, 66x32, top right of the drawer | sketch | visual | must |  |
| [ ] | D15 | Overlay behind the drawer dims the timeline | owner, sketch | visual | must |  |

## Validation

| | id | requirement | source | verify | priority | evidence |
|---|---|---|---|---|---|---|
| [ ] | E1 | All fields required, end date must be after start date, invalid form blocks save | brief | unit | must |  |
| [ ] | E2 | Overlapping work order on the same work center is rejected and no order is created | brief, owner, ref | unit | must |  |
| [ ] | E3 | Edit ignores the order being edited when checking overlap | brief | unit | must |  |
| [ ] | E4 | Overlap error is shown to the user with a clear message | brief, owner | e2e | must |  |
| [ ] | E5 | Overlapping orders on different work centers are allowed | brief | unit | must |  |

## Data

| | id | requirement | source | verify | priority | evidence |
|---|---|---|---|---|---|---|
| [ ] | F1 | At least 5 work centers with realistic manufacturing names | brief | unit | must |  |
| [ ] | F2 | At least 8 work orders across the centres, all 4 statuses present, one centre with several non-overlapping orders | brief | unit | must |  |
| [ ] | F3 | Documents follow the docId / docType / data structure | brief | unit | must |  |
| [ ] | F4 | Overlap detection lives in a service as a pure, testable function | brief, ref | unit | must |  |
| [ ] | F5 | localStorage persistence: work orders survive a reload | brief, ref | e2e | bonus |  |

## Visual fidelity

| | id | requirement | source | verify | priority | evidence |
|---|---|---|---|---|---|---|
| [x] | G1 | Every colour and size comes from docs/design/tokens.json, no guessed values | owner, sketch | visual | must | unit: design tokens [G1] every SCSS token variable matches tokens.json |
| [x] | G2 | Timescale chip geometry: label segment 75, value segment 71, height 25, radius 5 | sketch | visual | must | measure: .timescale-chip border-radius = "5px" (expected "5px") |
| [ ] | G3 | Logo top left with the spacing from the design | ref, sketch | visual | must |  |
| [ ] | G4 | Measure the rendered DOM against the token values (a script prints differences) | sketch, owner | visual | must | measure: selector not found: .drawer |
| [x] | G5 | Type scale matches: body 14 Book, drawer title 20 Medium, chip 13 | sketch | visual | must | unit: design tokens [G5] type scale matches the token file |

## Deliverables

| | id | requirement | source | verify | priority | evidence |
|---|---|---|---|---|---|---|
| [ ] | H1 | README with run steps, setup, approach and the libraries used with reasons | brief | manual | must |  |
| [ ] | H2 | Loom demo of 5 to 10 minutes covering every feature, overlap error and the code structure | brief | manual | must |  |
| [ ] | H3 | Public repository with a clean commit history | brief | manual | must |  |
| [ ] | H4 | Prompts used with AI saved as markdown files | brief | manual | bonus |  |
| [ ] | H5 | Comments explain the date maths and the key decisions | brief | manual | must |  |
| [ ] | H6 | AI prompt log for this build kept in the repo | brief | manual | bonus |  |

## Bonus features

| | id | requirement | source | verify | priority | evidence |
|---|---|---|---|---|---|---|
| [ ] | I1 | Infinite horizontal scroll: more columns load as the user scrolls | brief, ref, cand | e2e | bonus |  |
| [ ] | I2 | Today button centres the viewport on today | brief, ref, cand | e2e | bonus |  |
| [ ] | I3 | Smooth animations: drawer slide in and out, bar hover transitions | brief | manual | bonus |  |
| [ ] | I4 | Automated test suite runs headless and passes | brief | unit | bonus |  |
| [ ] | I5 | Accessibility: aria labels on controls, focus management, keyboard reachable menu | brief | e2e | bonus |  |
| [ ] | I6 | OnPush change detection and trackBy on the timeline lists | brief | manual | bonus |  |
| [ ] | I7 | Responsive: layout does not break on smaller screens, horizontal scroll acceptable | brief | manual | must |  |
| [ ] | I8 | The design covers Month only; Day and Week layouts are derived from the same tokens and look consistent | sketch | visual | must |  |

## Demo evidence

| | id | requirement | source | verify | priority | evidence |
|---|---|---|---|---|---|---|
| [ ] | J1 | A second Playwright config records a video per requirement test: headed Chrome, slow motion, files under docs/demo/videos/. The fast config used by verify.mjs is not affected. | brief | manual | bonus |  |
| [ ] | J2 | npm run demo runs the suite headed with video recording and produces one video per requirement test. | brief | manual | bonus |  |
| [ ] | J3 | docs/demo-script.md gives the exact click path for the Loom recording, including how to trigger the overlap error. | brief | manual | must |  |

## Sources

- **brief**: FE-technical-test-10-2026.md
- **owner**: docs/videos/fe-kickoff-and-handover.md (task owner kickoff)
- **sketch**: docs/design/tokens.json (extracted from the Sketch file)
- **ref**: docs/videos/fe-reference-implementation-walkthrough.md (candidate walkthrough, Renvil Dsa)
- **cand**: docs/videos/fe-work-order-timeline-overview.md (candidate walkthrough, Jacob Hamel)

## Verification kinds

- **unit**: covered by an automated unit test
- **e2e**: covered by a browser test (Playwright or equivalent)
- **visual**: measured against docs/design/tokens.json, or screenshot compared to the design
- **manual**: verified by a human looking at the running app
