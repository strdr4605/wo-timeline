# Plan: Work Order Schedule Timeline

Orchestrator plan. The agent that owns this file writes no product code. It plans, dispatches,
verifies, and reports. State lives in `docs/requirements/acceptance-criteria.json`.

Decisions that came out of the grilling session are in `docs/decisions/2026-11-08-grill-session.md`.
Where this plan and that file disagree, that file wins.

## 1. Scope

40 `must` items, all of them. 28 bonus items, all of them except I1 (infinite scroll), which is
the last item and only runs if the earlier waves finish early. Storybook is a bonus-class extra
that needs the human's approval before it starts.

## 2. Stack and pins

| Package | Version | Reason |
|---|---|---|
| `@angular/cli` / `@angular/core` | 20.3.42 / 20.3.35 | Angular 17 or newer is required. Version 20 is pinned because the latest ng-select and ng-bootstrap need Angular 22. |
| `@ng-select/ng-select` | 20.7.0 | Mandatory library for the status dropdown. |
| `@ng-bootstrap/ng-bootstrap` | 19.0.1 | Mandatory library for the date picker. |
| `vitest` | 5.1.0 | Unit tests for pure logic. `verify.mjs` reads `vitest-report.json`. |
| `playwright` | 1.65.0 | E2E and visual checks. Browsers are already cached. |
| `@storybook/angular` | 10.6.6 | Bonus. Supports Angular 18 to 22. |

TypeScript strict mode. Standalone components. SCSS only. Reactive Forms only.

Two Playwright configs:

- `playwright.config.ts` — fast run. `verify.mjs` calls it with `npx playwright test`.
- `playwright.demo.config.ts` — headed Chrome, slow motion, video per test, output to
  `docs/demo/videos/`. Run with `npm run demo`. Never called by `verify.mjs`.

## 3. Tokens to SCSS

One source of truth: `docs/design/tokens.json`. A SCSS file exposes the tokens as variables.
No value is written twice. No value is edited to make a test pass.

| Token group | SCSS variables | Used by |
|---|---|---|
| `colors.text` | `--text-primary #030929`, `--text-secondary #687196`, `--text-heading #2f3059`, `--text-on-brand #ffffff`, `--text-on-tooltip #f9faff` | all text |
| `colors.brand` | `--brand-primary #3e40db`, `--brand-element #5659ff`, `--brand-light #aaafff`, `--brand-tint #d4d7ff`, `--brand-surface #edeeff`, `--brand-border #dee0ff`, `--scale-chip-bg #f1f3f8` | bars, buttons, chips, current-month marker |
| `colors.surface` | `--surface-page #f7f9fc`, `--surface-panel #ffffff`, `--surface-row-alt #fafbfd`, `--surface-row-hover #f1f3f8` (alpha 0.75), `--surface-control #f0f1f5`, `--chip-selected #3e40db` | grid, rail, row hover |
| `colors.border` | `--border-grid #e6ebf0`, `--border-divider #d8d8d8`, `--border-focus #3e40db` | grid lines, dividers, focus ring |
| `colors.status.*` | per status: `barFill`, `barBorder`, `badgeFill`, `text` for open, in-progress, complete, blocked | bars and badges |
| `typography` | body 14 Book, drawer title 20 Medium, chip 13, label 16, bar text 14, badge 13 | all text |
| `radii` | bar 8, panel 12, menu 5, tooltip 8, chip 5 | all corners |
| `layout.grid` | left rail 380, row height 48, header 204 to 237, month column 114, timeline origin x 483 | grid |
| `layout.panel` | panel x 849, width 591, radius 12, shadow y 5 blur 15 `#d8dceb`, field width 542, control height 38, buttons 66x32 | drawer |
| `layout.dropdownMenu` | width 200, radius 5, row height 28, row padding 12, shadow y 4.5 | three-dot menu |
| `layout.tooltip` | height 26, radius 8, padding 8, background `#687196` | bar tooltip |
| `layout.bar` | height 38, text padding left 8, badge height 22, badge gap 8 | bars |

Day column width 48, week column width 114. Both are agent choices; the design has no Day or
Week artboard. Check them later against the reference implementation video frames.

## 4. Requirement map

| Group | Items | Wave |
|---|---|---|
| Stack and scaffold | A1, A2, A3, A4, A5 | 0 and 3 |
| Timeline grid and zoom | B1 to B11 | 1 |
| Work order bars | C1 to C8 | 2 |
| Drawer and forms | D1 to D15 | 3 |
| Validation and data | E1 to E5, F1 to F4 | 4 |
| Bonus features | F5, I1 to I8 | 5, 6, 7 |
| Deliverables | H1 to H6 | 8 |
| Demo evidence | J1 to J3 | 8 |

Wave detail:

- **Wave 0, scaffold and tokens**: jj repo colocated with git, Angular 20 app, SCSS token file,
  fast and demo Playwright configs, root vitest config, CDN font link. Items A1, A5, G1, G5.
- **Wave 1, grid and zoom**: header, rail, fixed-width month columns with interpolation inside a
  column, Day 48 and Week 114, today marker, current-month pill, row hover, horizontal scroll.
  Items B1 to B11. B4 becomes a pass when a test named `[B4] default timescale is Month` passes.
- **Wave 2, bars**: date to pixel, label, status badge, three-dot menu, menu styling, tooltip,
  drag handles. Items C1 to C8.
- **Wave 3, drawer and forms**: in-DOM overlay and drawer, reactive form, `ng-select` restyled,
  `ngb-datepicker` restyled, all drawer states, buttons. Items D1 to D15, A2, A3, A4.
- **Wave 4, validation and data**: validators, overlap detection as a pure function in a service,
  sample data from the Sketch with the days moved to 2026-11. Items E1 to E5, F1 to F4.
- **Wave 5, bonus, part 1**: needs human approval. localStorage, Today button, tooltip, keyboard
  navigation, accessibility, animations, OnPush and trackBy, AI prompt log. Items F5, I2, I3, I5,
  I6, H4, H6.
- **Wave 6, Storybook**: needs human approval. Stories for the 8 token components plus the app
  components. Fallback: a hand-written style guide page.
- **Wave 7, infinite scroll**: last, only if time is left. Item I1.
- **Wave 8, deliverables and demo**: README, code comments, responsive check, Day and Week
  consistency, demo recordings, demo script. Items H1, H2 script, H3 cut, H5, I7, I8, J1 to J3.

## 5. Pixel-perfection track

`docs/requirements/measurements.json` lists every element that is measured against
`tokens.json`. `measure.mjs` opens the app on port 4200 and writes the result into the
acceptance criteria file. The Builder may change a selector when the DOM changes. The Builder
may never change an expected value.

Current coverage: G2 chip geometry, G4 drawer width and radius, G5 type scale, B10 row height,
B11 grid line colour, C3 status fills, C4 bar geometry and fill, C5 action button fill.

Gaps to close in wave 0: G3 logo position (box size only, so the position needs a Playwright
assertion), D1 drawer shadow, D15 button colours, D13 pill and plain-text states, B6 current-month
marker, C6 menu geometry, C7 tooltip geometry, D11 field placeholder and focus states.

## 6. Roles

**Builder** implements the items it is given and nothing else. It writes one test per item,
with the item id in brackets in the test title. It runs `node docs/requirements/verify.mjs` and
`node docs/requirements/measure.mjs`. It never edits the acceptance criteria file.

**Verifier** writes no features. It checks each item against the source order: written spec, then
owner video, then tokens, then the prior art. It quotes the source line for each verdict. It
reports one line per item.

Both children stay inside the smart zone of about 100k tokens of context. A child that nears the
ceiling stops, reports its state, its diff and its item ids, and waits for a decision.

## 7. Definition of done per wave

1. `npm run build` is clean.
2. Every item in the wave has a test whose title carries its id, and that test passes.
3. `node docs/requirements/verify.mjs` writes `pass` with the evidence string for each item.
4. `node docs/requirements/measure.mjs` reports no difference for the visual items of the wave.
5. The work is committed as one jj commit with a message that names the item ids.
6. The child reports: items done, items not done, the commit id, the commands it ran.

## 8. Human gates

The human approves the move from one wave to the next. Extra items (wave 5, 6, 7) need a
separate approval each.

Three things only the human can do:

1. **Loom recording**, 5 to 10 minutes. The script is `docs/demo-script.md`. The Playwright demo
   videos under `docs/demo/videos/` are the rehearsal.
2. **Public repository.** The build repo stays private. The public cut holds the app, the README,
   the AI prompt log, `docs/design/tokens.json` and `docs/requirements/`. It leaves out
   `docs/videos/`, `docs/design/source/` and `docs/design/fonts/`.
3. **Final visual sign-off.** The human looks at the running app against the Sketch artboards and
   signs off.

## 9. Later decisions

Not built in version 1, listed in the README:

- Local `@font-face` fallback for the Circular Std font. Version 1 uses the Naologic CDN link.
- Default timescale switched to Day. One constant changes.
- Day and Week column widths checked against the reference implementation video frames.
