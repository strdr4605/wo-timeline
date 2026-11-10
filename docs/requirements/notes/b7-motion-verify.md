# Unit b7-motion: verify

Verifier, 2026-11-10. Lead: t38. Item I3 (smooth animations). Builder notes were checked, not
trusted. Node 26. Baseline = commit 7d52b88 (@-), exported to the scratchpad and served on port
4300 for the comparisons. That server is stopped.

## Checks

### Behaviour (Playwright by hand, `?parity=1`, 1440x900)

Spec line (FE-technical-test-10-2026.md, bonus): "Smooth animations: drawer slide in and out, bar hover transitions".

I3 drawer open pass - 60ms after Edit: drawer `translateX(376.852px)`, running transition `transform`; overlay opacity 0.4085, running `opacity`. At 460ms: `transform none`, no running animation - hand script
I3 drawer close pass - 60ms after Escape: drawer `visible`, `translateX(229.496px)`, `inert` true, running `transform, visibility`; overlay opacity 0.59. At 360ms: drawer `hidden`, `translateX(606px)`, inert, still in DOM (count 1); overlay `hidden`, opacity 0 - hand script
I3 drawer gone after close pass - drawer field `.focus()` after close does not take focus (inert + hidden) - hand script
I3 focus return pass - after close, focus is on `DIV.work-order-bar` "Konsulting Inc, In progress, Aug 21, 2024 to Nov 30, 2024" (the bar that opened the drawer) - hand script
I3 bar hover pass - 50ms after hover the three-dot button opacity 0.742647, at 350ms 1. Handle opacity 0.12s - hand script
I3 Options menu pass - 60ms after click opacity 0.378152, at 360ms 1. Box `903.19,387 200x80` same at 60ms and 360ms (fade only, no move) - hand script
I3 timescale menu pass - 40ms after open opacity 0.134821, animation `0.2s ease-out timescale-menu-enter`; at 340ms opacity 1. Close is instant (scope says "appear") - hand script
I3 under 300ms pass - every non-zero transition and animation on the page after the steps: 0.12s (bar colours, handle, button opacity and fill, menu rows, timescale rows), 0.2s (Options menu, overlay, drawer transform, timescale enter), `visibility 0s` with 0.2s delay. Max end 0.2s < 0.3s - hand script (all elements, computed style)
I3 reduced motion pass - `emulateMedia({reducedMotion:'reduce'})`: button opacity 1 at 50ms, Options menu opacity 1 at 60ms, drawer `transform none` at 60ms after open, `translateX(606px)` and overlay opacity 0 at 60ms after Escape, timescale animation `0s`. Only `visibility 0s +0.2s` remains on drawer and overlay: no visible motion, the drawer is off screen and inert - hand script
I6 OnPush kept pass - no `.ts` or `.html` file in `jj diff --stat`; `[I6]` e2e passes - jj diff, playwright

### Tokens

Tokens json pass - `layout.motion` `durationFast "120ms"`, `durationBase "200ms"`, `easing "ease-out"`; `layout.panel.slideDuration` removed, agentChoices entry added - docs/design/tokens.json
Tokens unit bug pass - `_tokens.scss` holds `"120ms"`, `"200ms"`, `"ease-out"` (strings, no `px`); computed 0.12s / 0.2s - _tokens.scss, computed style
Tokens generated pass - `tools/generate-tokens.mjs` run on a scratch copy gives a file identical to `src/styles/_tokens.scss` (diff empty) - generator
Tokens leftovers pass - no use of `layout-panel-slide-duration` left in `src` - grep

### Evidence tests

[I3] tests fail without the change pass - the spec run against the baseline server (port 4300): test 2 fails (`background-color in all`), test 3 fails (`toHaveCSS` transition-duration). Test 1 passes on the baseline: the drawer slide existed before this unit (builder notes say so) - playwright, scratch config
[I3] tests fail without transitions pass - the spec with an injected `*{transition:none!important;animation:none!important}` against 4200: test 1 fails (`transform in none`), test 2 fails (`background-color in none`). Test 3 passes, as expected (it asserts 0s) - playwright, scratch config

### Pixels (`scripts/pixel-check.mjs`, steps and masks of session-handover-2026-11-10.md and u4-drawer.md)

Schedule - Default (bar and cursor masks) pass - 0.2%, committed 0.2% - pixel-check
Schedule - Default `hover@727,322;wait@300` pass - 0.11%, committed 0.11% - pixel-check
View Selection `click@200,167;wait@300` pass - 0.43%, committed 0.43% - pixel-check
Options CTA (`fixture=hover`, `hover@722,333;wait@300`, mask `710,325,32,32`) pass - 0.31%, committed 0.31% - pixel-check
Edit and Delete Expanded (`fixture=hover`, `hover@871,328;click@871,328;wait@300`, mask `859,320,32,32`) pass - 0.26%, committed 0.26% - pixel-check
With Selection pass - 0.3%, committed 0.3% - pixel-check
Placeholder and Defaults pass - 0.31% (3 runs), b6 verify wrote 0.3%. The baseline (@-, port 4300) also gives 0.31%, and its `app.png` is pixel-identical to the b7 `app.png` (0 px differ). Not caused by this unit - pixel-check, pngjs compare
Active Text Field pass - 0.32%, committed 0.32% - pixel-check
Status Dropdown pass - 0.29%, committed 0.29% - pixel-check

### Regressions

npm run build pass - exit 0, no warning - build log
npx vitest run pass - 29 passed (5 files) - vitest
npx playwright test run 1 pass - 69 passed (13.4s) - playwright
npx playwright test run 2 pass - 69 passed (13.7s) - playwright
node docs/requirements/verify.mjs pass - 63 pass, 0 fail, 9 pending. It warns `unknown item id in test title: P9` (existing test, not this unit) - verify.mjs

### Code

Scope pass - `jj diff --stat`: tokens.json, _tokens.scss, styles.scss, 3 component scss, acceptance-criteria json/md, motion.spec.ts, b7-motion.md. All I3 - jj diff
Top-down, no literals pass - durations and easing come from tokens in all new transitions - jj diff
Bar transition dead code fail (minor) - `.work-order-bar` transitions `background-color, border-color, box-shadow` 0.12s. No hover or focus rule changes any of them: the hovered bar keeps `rgb(237, 238, 255)`, and the bar has no `box-shadow` in any rule (focus uses `outline`). Only a status change after a save changes the colours. `box-shadow` is dead. The bar "hover transition" really comes from the handles and the three-dot button - work-order-bar.scss:32-35, computed style
Overlay easing not tokenized fail (minor) - `.drawer-overlay` `opacity $duration` has no easing, so it uses the CSS default `ease`, while the drawer slide uses `t.$layout-motion-easing` (ease-out). Same timing as before this unit, but the new easing token is not applied there - work-order-drawer.scss:17,24

## Failures

- Bar transition dead code (minor): `box-shadow` in the `.work-order-bar` transition never changes; `background-color` and `border-color` change only on a status change, not on hover. work-order-bar.scss:32-35.
- Overlay easing not tokenized (minor): `.drawer-overlay` opacity transition does not use `t.$layout-motion-easing`. work-order-drawer.scss:17,24.

## Lead fixes

- Failure 1: the `.work-order-bar` transition was removed. The bar itself does not change on
  hover; the hover feedback is the fade of the handles and the three-dot button. The
  `expectMotion(bar, 'background-color')` line was removed from `tests/e2e/motion.spec.ts`.
- Failure 2: the overlay fade now uses `$fade` (`opacity`, base duration, `t.$layout-motion-easing`).
- After the fixes: e2e 69 passed, Default 0.2%, Default hover 0.11%, verify.mjs 63 pass, 9 pending.
