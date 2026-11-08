# Decision record: grilling session 2026-11-08

Session type: design-tree grilling of the Work Order Schedule Timeline plan.
Participants: human (repo owner), agent (orchestrator).
Outcome: every open decision in the handoff was settled. This file is the memory for those
decisions. It stays in the build repo. The public repo cut may include it later.

## Decisions

| # | Question | Decision |
|---|---|---|
| Q1 | Default timescale (acceptance item B4) | **Month**. The Sketch artboards, the owner video and both reference demos all show Month. Day is the written-spec default, so the conflict is recorded in the README and the demo narration. Switching to Day later is a one-constant change. |
| Q2 | Framework and unit runner | **Angular 20** (standalone components), **plain vitest at repo root**. `verify.mjs` reads `vitest-report.json` only, so the Angular vitest builder is not used. |
| Q3 | Bonus scope | All 40 `must` items. All 28 bonus items **except I1 (infinite scroll)**. I1 is the last item, only if the waves finish early. |
| Q4 | Orchestration shape | One **Builder** and one **Verifier** child agent, sequential waves. No parallel builders: they would collide on SCSS tokens, `tokens.json` and the Playwright config. Verification is the cheap parallel win. |
| Q5 | Public repo | The build repo stays **private**. A separate clean public repo is cut at the end. |
| Q6 | Details the design does not define (row hover, overlap error copy, empty state, Day/Week widths, panel radius) | The **agent picks from the existing token set** and documents each choice. The human overrides only for copy. |
| Q7 | Version control | **jj colocated with git** (`jj git init --colocate`). The clean public repo uses git. |
| Q8 | Unit-test strategy | **Plain vitest** at the repo root for pure logic: date maths, overlap detection, store reducers. No Angular TestBed. Component behaviour is covered by Playwright. |
| Q9 | Date to pixel mapping | **Fixed column width per column, interpolated inside the column.** Month columns are a fixed 114px, matching `tokens.json` `grid.header.columnWidthMonth`. |
| Q10 | Sample data | Take the **Sketch sample data** (5 work centres, 6 bars) and shift the days to **2026-11**. The Sketch has no `open` status bar, so extra bars are added. |
| Q11 | Dropdowns | **No system dropdowns.** `ng-select` and `ngb-datepicker` stay, restyled to the design. |
| Q12 | Drawer DOM | **In-DOM**: overlay plus `.drawer`, rendered in the app root, outside the horizontally scrolling grid. Reason: the design tokens (591 width, 12 radius, #d8dceb shadow) are measured on the panel element itself. |
| Q13 | Fonts | **CDN link only in version 1.** Local `@font-face` fallback from `docs/design/fonts/*.otf` is a documented later decision. |
| Q14 | Month column map | Fixed 114px columns, interpolation inside a column. |
| Q15 | Day and Week column widths | **Day 48px, Week 114px** (a week column is as wide as a month column). To be checked later against the frames of the reference implementation video (Loom `728c42f5b9a341a88c1a5fad167df398`). |
| Q16 | Sample data set | Sketch set **plus 3 added bars** (2 open, 1 blocked) on the Spartan and McMarrow rows, dated inside 2026-11 to 2027-01, non-overlapping. Sketch names are kept; the brief names are examples only. |
| Q17 | Storybook | **Storybook 10 with Angular 20.** Stories for the 8 token components (bar, badge, scaleChip, textField, buttonPrimary, buttonSecondary, menuItem, tooltip) plus the app components. Time-boxed to one wave; fallback is a hand-written style guide page. |
| Q18 | Drawer DOM | In-DOM, as Q12. |
| Q19 | Deferred list | Font local fallback and the switch to a Day default are written up in the README, not built now. |
| Q20 | Version pins | `@angular/cli` 20.3.42, `@angular/core` 20.3.35, `@ng-select/ng-select` 20.7.0, `@ng-bootstrap/ng-bootstrap` 19.0.1, `@storybook/angular` 10.6.6, `vitest` 5.1.0, `playwright` 1.65.0. The latest majors of ng-select and ng-bootstrap require Angular 22, so the pins are deliberate. |
| Q21 | Build order | Build in steps. The human **approves each move to the next extra item**. Order: must items, then bonus items, then Storybook, then infinite scroll. |
| Q22 | Public repo content | Include `docs/design/tokens.json`, `docs/requirements/`, the app, the README and the AI prompt log. Exclude `docs/videos/`, `docs/design/source/`, `docs/design/fonts/`. |
| Q23 | Demo evidence | Every requirement gets a **Playwright demo recording**: headed Chrome, slow motion, video per test, files under `docs/demo/videos/`. A separate demo Playwright config keeps the fast verification run untouched. |
| Q24 | This file | Keep in the build repo. Add to the public repo only if the human asks. |

## Facts established while grilling

- Repo has no version control, no application code, no Playwright suite, no README.
- Tooling present: node v26.13.0, `hc` (herdr-core), Playwright 1.65.0 with browsers cached. No Angular CLI installed globally.
- `verify.mjs` parses a Playwright JSON report and `vitest-report.json`. It needs a root `playwright.config.ts` and a root `vitest.config.ts`.
- `measure.mjs` reads `docs/requirements/measurements.json` and compares the rendered DOM against `docs/design/tokens.json`.
- The Sketch covers the Month timescale only. Day and Week are derived.
- Sample data read from `docs/design/artboards.json`, artboard `Work Order Schedule - Default`:
  work centres Genesis Hardware, Rodriques Electrics, Konsulting Inc, McMarrow Distribution,
  Spartan Manufacturing; bars Concentrix Ltd (complete), Konsulting Inc (in progress),
  Compleks Systems (in progress), McMarrow Distribution (blocked), plus two bars in the hover
  artboard. No open-status bar in the design.

## Open points carried into the build

- Day and Week widths are unverified. The reference implementation video frames are the check.
- The overlap error copy, the row hover colour and the empty state are agent choices from tokens.
- The public repo cut happens after the last wave.
