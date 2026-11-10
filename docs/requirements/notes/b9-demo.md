# b9-demo: demo videos (J1, J2)

## What changed

No app code change. `playwright.config.ts`, `package.json` and `.gitignore` did not change.
`npm run demo` and the `docs/demo/videos/` ignore line were already there from the scaffold.

- `playwright.demo.config.ts` (rewritten). It extends the fast config and sets:
  - `grep: /\[[A-Z]\d+\]/`: only the requirement tests with an item id in the title.
  - headed Chrome (`headless: false`), viewport 1440 x 1024, `video: { mode: 'on', size: 1440x1024 }`.
  - `workers: 1`, `fullyParallel: false`, `timeout: 120_000`, `retries: 1`.
  - Project `chromium`: `launchOptions.slowMo: 400` (`SLOW_MO_MS`), all specs except `motion.spec.ts`.
  - Project `chromium-motion`: `motion.spec.ts` with `slowMo: 0`.
  - `outputDir: 'docs/demo/videos/.raw'` (Playwright cleans it on each run).
  - Reporter `tests/demo/video-reporter.ts` copies each video to
    `docs/demo/videos/<id>-<title-slug>.webm`.
- `tests/demo/video-reporter.ts` (new). It is outside `tests/e2e`, so no run loads it as a spec.
  When a test opens more than one page (the axe check of I5 does), it keeps the largest video,
  which is the test page.
- `tests/e2e/demo-config.spec.ts` (new): `[J1]` and `[J2]`, static checks of the demo config,
  the fast config (no `video`, no `slowMo`, `headless: true`), `.gitignore` and the npm scripts.
- `docs/requirements/acceptance-criteria.md` / `.json`: J1, J2 set to pass by `verify.mjs`.

## Why two projects and one retry

- The `[I3]` motion tests read a CSS transition while it runs. A slowMo pause of 400 ms after a
  step outlasts the 300 ms transition, so they failed with slowMo. They record at normal speed.
- A headed window gets real OS mouse events when the pointer rests over it. Hover tests
  (`[B9]`, `[D9]`, `[I5]`) then lose the hover and fail. Each passed alone on a rerun. The demo
  config retries once; the reporter overwrites the video with the last attempt. Keep the mouse
  away from the window during `npm run demo`.

## Checks

- `node scripts/pixel-check.mjs --artboard="Schedule - Default"` with the handover bar and
  cursor masks: 0.2% before, 0.2% after.
- `npm run build` clean. `npx vitest run` 29 passed. `npx playwright test` 72 passed, 0 `.webm`
  in `test-results/`. `npx playwright test --list` uses only `playwright.config.ts` (70 tests
  before this unit, 72 after).
- `node docs/requirements/verify.mjs`: playwright exit 0, vitest exit 0, `{ pass: 66, pending: 6 }`.
  It reports `unknown item id in test title: P9` (not from this unit).
- `npm run demo`: 71 passed (3.4 min), 67 videos, 28 MB, 1440 x 1024 webm.
  The 4 tests with no page give no video: `[I4]`, `[I6]`, `[J1]`, `[J2]` (static checks).
  Ids with more than one test give one video per test (the title slug differs).

## Videos produced (docs/demo/videos/, gitignored)

- .rw-r--r--@ 151k 2026-11-10 23:57 A1-app-builds-and-serves-the-shell.webm
- .rw-r--r--@ 352k 2026-11-10 23:57 A2-the-drawer-form-is-a-reactive-forms-formgroup-with-validators.webm
- .rw-r--r--@ 356k 2026-11-10 23:57 A3-the-status-field-is-ng-select-restyled-with-no-system-dropdown.webm
- .rw-r--r--@ 477k 2026-11-10 23:57 A4-the-start-and-end-dates-use-ngb-datepicker.webm
- .rw-r--r--@ 170k 2026-11-10 23:56 A5-circular-std-comes-from-the-naologic-cdn-with-a-local-fallback.webm
- .rw-r--r--@ 157k 2026-11-10 23:56 B1-the-grid-is-a-card-from-the-header-line-to-the-page-bottom-with-a-white-rail.webm
- .rw-r--r--@ 208k 2026-11-10 23:57 B1-the-work-center-panel-stays-fixed-while-the-timeline-scrolls-sideways.webm
- .rw-r--r--@ 248k 2026-11-10 23:57 B2-the-timeline-grid-scrolls-horizontally.webm
- .rw-r--r--@ 234k 2026-11-10 23:57 B3-the-timescale-dropdown-offers-hour-day-week-and-month.webm
- .rw-r--r--@ 190k 2026-11-10 23:58 B4-the-default-timescale-is-month.webm
- .rw-r--r--@ 333k 2026-11-10 23:58 B5-the-header-row-re-labels-per-zoom-level.webm
- .rw-r--r--@ 156k 2026-11-10 23:56 B5-the-header-shows-work-center-and-centred-month-labels-without-separators.webm
- .rw-r--r--@ 691k 2026-11-10 23:57 B6-the-current-month-chip-sits-on-the-header-line-at-the-current-month.webm
- .rw-r--r--@ 157k 2026-11-10 23:57 B7-one-3px-d4d7ff-today-line-709-long-on-the-edge-of-the-current-month.webm
- .rw-r--r--@ 222k 2026-11-10 23:58 B8-the-initial-view-centres-on-today-with-a-buffer.webm
- .rw-r--r--@ 273k 2026-11-10 23:57 B9-row-hover-rail-and-timeline-row-the-placeholder-box-and-its-tooltip.webm
- .rw-r--r--@ 155k 2026-11-10 23:57 B10-the-first-row-is-60-high-the-next-rows-48-with-a-1px-divider.webm
- .rw-r--r--@ 501k 2026-11-10 23:57 B11-column-lines-run-747-down-from-the-header-line-in-every-timescale.webm
- .rw-r--r--@ 214k 2026-11-10 23:56 C1-the-bar-starts-at-the-start-date-and-ends-at-the-end-date.webm
- .rw-r--r--@ 167k 2026-11-10 23:56 C2-the-bar-shows-the-work-order-name-and-a-status-badge.webm
- .rw-r--r--@ 168k 2026-11-10 23:56 C3-every-status-has-the-colours-of-the-design.webm
- .rw-r--r--@ 166k 2026-11-10 23:56 C4-the-bar-is-38-high-has-a-radius-of-8-and-a-1px-border.webm
- .rw-r--r--@ 727k 2026-11-10 23:55 C5-delete-from-the-three-dot-menu-removes-the-order.webm
- .rw-r--r--@ 224k 2026-11-10 23:56 C5-the-three-dot-button-appears-on-hover-and-opens-a-menu-with-edit-and-delete.webm
- .rw-r--r--@ 261k 2026-11-10 23:56 C6-the-menu-is-the-menu-of-the-design-not-a-system-menu.webm
- .rw-r--r--@ 259k 2026-11-10 23:56 C7-the-bar-shows-a-tooltip-with-name-status-and-the-full-date-range.webm
- .rw-r--r--@ 205k 2026-11-10 23:56 C8-the-bar-shows-a-drag-handle-at-both-ends-on-hover.webm
- .rw-r--r--@ 1.1M 2026-11-10 23:57 C9-a-drag-on-a-bar-end-handle-resizes-the-order-snapped-to-days-with-checks-and-key.webm
- .rw-r--r--@ 314k 2026-11-10 23:56 D1-the-drawer-slides-in-from-the-right-591-wide-radius-12-the-design-shadow.webm
- .rw-r--r--@ 310k 2026-11-10 23:56 D2-the-header-shows-the-title-the-subtitle-and-the-line-under-them.webm
- .rw-r--r--@ 497k 2026-11-10 23:56 D3-a-click-on-an-empty-cell-opens-the-create-drawer-with-the-start-date-of-the-clic.webm
- .rw-r--r--@ 311k 2026-11-10 23:56 D4-the-end-date-is-the-start-date-plus-7-days.webm
- .rw-r--r--@ 311k 2026-11-10 23:56 D5-the-status-is-open-on-create.webm
- .rw-r--r--@ 432k 2026-11-10 23:56 D6-edit-fills-the-fields-with-the-order-and-the-button-reads-save.webm
- .rw-r--r--@ 529k 2026-11-10 23:56 D7-cancel-closes-the-drawer-without-a-new-order.webm
- .rw-r--r--@ 483k 2026-11-10 23:56 D8-a-click-outside-the-drawer-closes-it.webm
- .rw-r--r--@ 1.2M 2026-11-10 23:56 D9-escape-and-a-click-outside-close-an-edit-without-a-save.webm
- .rw-r--r--@ 657k 2026-11-10 23:56 D9-escape-closes-the-drawer-but-first-closes-an-open-dropdown.webm
- .rw-r--r--@ 413k 2026-11-10 23:56 D10-tab-moves-through-the-fields-in-order-end-date-above-start-date.webm
- .rw-r--r--@ 363k 2026-11-10 23:56 D11-the-text-field-shows-the-placeholder-state-and-the-focus-state-of-the-design.webm
- .rw-r--r--@ 404k 2026-11-10 23:56 D12-a-click-on-a-date-field-opens-the-calendar-there-is-no-calendar-button.webm
- .rw-r--r--@ 414k 2026-11-10 23:56 D13-the-status-is-a-pill-when-collapsed-and-plain-text-in-the-open-list.webm
- .rw-r--r--@ 320k 2026-11-10 23:55 D14-cancel-and-the-primary-button-66-x-32-at-the-top-right-white-and-5659ff.webm
- .rw-r--r--@ 302k 2026-11-10 23:56 D15-the-overlay-dims-the-page-behind-the-drawer.webm
- .rw-r--r--@ 541k 2026-11-10 23:55 E1-a-valid-form-creates-the-order-and-closes-the-drawer.webm
- .rw-r--r--@ 494k 2026-11-10 23:55 E1-every-field-is-required-no-order-an-inline-error-under-each-empty-field.webm
- .rw-r--r--@ 454k 2026-11-10 23:55 E1-the-end-date-must-be-after-the-start-date.webm
- .rw-r--r--@ 416k 2026-11-10 23:55 E2-an-overlap-on-the-same-work-centre-is-rejected-and-creates-no-order.webm
- .rw-r--r--@ 1.0M 2026-11-10 23:55 E3-edit-saves-in-place-and-ignores-the-old-dates-of-the-edited-order.webm
- .rw-r--r--@ 1.1M 2026-11-10 23:55 E3-edit-still-rejects-an-overlap-with-another-order-of-the-work-centre.webm
- .rw-r--r--@ 667k 2026-11-10 23:55 E4-the-overlap-error-names-the-work-centre-and-sits-between-the-buttons-and-the-fie.webm
- .rw-r--r--@ 534k 2026-11-10 23:55 E5-the-same-dates-on-another-work-centre-are-allowed.webm
- .rw-r--r--@ 566k 2026-11-10 23:57 F5-corrupt-or-wrong-shaped-storage-falls-back-to-the-sample-data.webm
- .rw-r--r--@ 1.2M 2026-11-10 23:57 F5-create-edit-and-delete-survive-a-reload.webm
- .rw-r--r--@ 169k 2026-11-10 23:57 F5-first-load-with-empty-storage-seeds-the-sample-data-and-writes-nothing.webm
- .rw-r--r--@ 264k 2026-11-10 23:57 F5-parity-mode-neither-reads-nor-writes-the-storage.webm
- .rw-r--r--@ 256k 2026-11-10 23:57 F5-the-stored-data-keeps-the-document-structure-of-the-brief.webm
- .rw-r--r--@ 168k 2026-11-10 23:58 G2-the-timescale-chip-is-146-wide-with-the-segments-at-75-and-71.webm
- .rw-r--r--@ 152k 2026-11-10 23:58 G3-the-naologic-wordmark-sits-at-101-20-80-x-10-on-a-top-bar-without-a-border.webm
- .rw-r--r--@ 964k 2026-11-10 23:58 I2-the-today-button-centres-the-viewport-on-today-in-every-timescale.webm
- .rw-r--r--@ 171k 2026-11-10 23:58 I3-prefers-reduced-motion-reduce-sets-every-duration-to-0s.webm
- .rw-r--r--@ 150k 2026-11-10 23:58 I3-the-bar-its-handles-the-three-dot-button-and-the-menus-have-short-transitions.webm
- .rw-r--r--@ 321k 2026-11-10 23:58 I3-the-drawer-and-the-overlay-slide-and-fade-on-open-and-on-close.webm
- .rw-r--r--@ 2.8M 2026-11-10 23:55 I5-controls-have-names-bars-and-menus-work-with-the-keyboard-the-drawer-keeps-the-f.webm
- .rw-r--r--@ 274k 2026-11-10 23:57 I7-a-phone-screen-keeps-the-timeline-the-scroll-and-the-drawer-usable.webm
- .rw-r--r--@ 336k 2026-11-10 23:57 I8-day-and-week-reuse-the-month-rows-bars-and-header-of-the-design.webm
- .rw-r--r--@ 223k 2026-11-10 23:56 P9-the-three-dot-button-uses-the-pressed-fill-while-its-menu-is-open.webm
