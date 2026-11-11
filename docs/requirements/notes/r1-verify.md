# r1-verify: neutral branding (release item R1)

Verifier: Claude, herdr child of t38. Scope: working copy (`jj diff`), section R1 of the release
plan. Builder notes not trusted; every line below is re-checked.

## Checks

- R1.grep pass - `grep -rni naologic src tests public .storybook` finds 3 lines, all the font CDN URL: `src/index.html:43`, `.storybook/preview-head.html:32`, `tests/e2e/font.spec.ts:3` - grep
- R1.logo-file pass - `public/naologic-logo.svg` deleted; `public/wo-timeline-logo.svg` new, 80 x 10, `<title>WO Timeline</title>`, fill #3e40db (same as the old path); GET `/naologic-logo.svg` now gets the SPA HTML fallback - jj diff, Playwright
- R1.logo-box pass - `/`: src `wo-timeline-logo.svg`, alt `WO Timeline`, natural 80 x 10, box {101, 20, 80, 10} - Playwright headless
- R1.pixels pass - Schedule - Default, handover bar masks + cursor mask, same run conditions: HEAD copy on port 4301 0.20%, working copy on 4200 0.22%. App screenshots before and after differ in 670 px, all inside 101,20,80,10, 0 px outside. Report diff per layer: only `Group 3` (+ its paths) 0 -> 311 and the top bar `Rectangle 0,0,1440,50` 0 -> 311 (the same pixels); 39 other layers same count - pixel-check.mjs, scratch compare of before/app.png and after/app.png
- R1.zoom pass (accepted change) - zoom 101,20,80,10: design NAOLOGIC wordmark, app "WO Timeline" text, same colour and box; the mismatch is the text change only - zoom.png
- R1.keys pass - `schedule.service.ts:120,122` = `wo-timeline.workOrders.v1`, `wo-timeline.railWidth.v1`; tests `rail`, `resize`, `storage`, `demo-data`, `brand` use the new keys; no `naologic.` key in src, tests, .storybook, scripts - grep
- R1.keys-runtime pass - old key `naologic.railWidth.v1=300` plus new key `=260`: rail reads 260; ArrowRight writes `wo-timeline.railWidth.v1=280`, the old key is not touched (no migration, as planned) - Playwright headless
- R1.parity pass - `/?parity=1`, empty storage, rail ArrowRight: localStorage stays `[]` - Playwright headless
- R1.titles pass - `[A5] ... font CDN ...`, `[G3] the wordmark sits at ...`; IDs kept; criteria JSON/MD evidence updated to match; new row R1 - jj diff
- R1.code pass - change limited to logo, alt, 2 key constants, test keys and titles, new spec, criteria; spec reads top-down; no dead code - jj diff
- build pass - `npm run build` exit 0 - npm
- vitest pass - 6 files, 35 tests - npx vitest run
- playwright pass - 98 passed (27.3 s) - npx playwright test

## Notes (not failures)

- The total mismatch goes up 0.20% -> 0.22% (builder measured 0.21% -> 0.23%). The release plan
  accepts this: the design shows the company wordmark. All new bad pixels are in the logo box.
- `verify.mjs` not run: the builder reports that it rewrites hand-written evidence (D12, I12).
  Tests were run directly instead.
- Old keys are still named in `README.md:125` (R6) and `docs/demo-script.md:183-184` (docs/, R2
  scope). The demo script line is now wrong if the demo script stays in the tree.
- The SVG text uses a system font stack (Helvetica, Arial), because an `<img>` SVG cannot load
  the web font. The glyphs can differ per OS; `textLength="80"` keeps the box.

## Failures

(none)

## Lead fixes

- docs/demo-script.md: the storage keys in section 11 now use the wo-timeline prefix.
