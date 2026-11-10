# b2-today verify (I2)

Baseline: commit 0684a9a exported with `git archive`, built, served on port 4310. New: the dev server on port 4200.

- Pixels Schedule - Default pass - base 0.2%, new 0.2%, `app.png` byte-identical (`cmp`), worst layer Group 5 1450 px in both - `pixel-check.mjs --mask=<bars;cursor>`
- Pixels View Selection pass - base 0.43%, new 0.43%, `app.png` byte-identical, worst layer Rectangle 5110 px in both - `pixel-check.mjs --steps="click@200,167;wait@300"`
- Parity mode hides button pass - `?parity=1`: `.today-button` count 0 - Playwright
- Placement pass - chip box x101 w146, button box x255 (8px gap), same y155 h25 - Playwright `boundingBox`
- Styling from tokens pass - button and chip value: 25px, radius 5px, `#fff`, shadow `rgb(200,207,233) 1px 2.5px 3px -1.5px`, 13px 500 `rgb(62,64,219)` Circular-Std. Hover `rgb(241,243,248)` (`$color-surface-chip-bg`) - computed style
- Visual fit (normal mode, top bar zoom 2x) pass - looks like a second chip, same shadow and font - screenshot `top.png`, `focus.png` in the verifier scratchpad
- Text baseline vs chip fail (minor) - "Today" text top y159.5, "Month" text top y159.0. The chip uses padding `4px 8px 1px`; the button centres the text in 25px. Text is 0.5px lower (1 device px at 2x) - Playwright Range rects
- I2 Hour pass - offset from visible centre before 239.7px, after -0.7px - Playwright, spec line 337 "Quickly jump the viewport to center on today's date"
- I2 Day pass - before 1846.3px, after -0.5px - Playwright
- I2 Week pass - before 193.5px, after -0.2px - Playwright
- I2 Month pass - before 221.8px, after -0.3px - Playwright
- Keyboard pass - Tab from the chip value focuses the button; Enter gives offset -0.3px - Playwright
- Focus ring pass - `:focus-visible` outline solid 1px `rgb(62,64,219)` (`$color-border-focus`), visible in `focus.png` - computed style
- Smooth scroll pass - no reduced motion: scrollLeft per frame 0,3,13,44,106,...,240 (about 15 frames) - rAF trace
- prefers-reduced-motion pass - `reducedMotion: 'reduce'`: offset -0.3px right after click, no animation - Playwright
- e2e title pass - `today.spec.ts:10` "[I2] the Today button centres the viewport on today in every timescale" passes
- F5 pass - `storage.spec.ts:38` "[F5] create, edit and delete survive a reload" passes
- Build pass - `npx ng build` complete, no errors
- Unit tests pass - `npx vitest run` 29 passed
- e2e suite pass - `npx playwright test` 63 passed
- verify.mjs pass - 57 pass, 14 pending
- Code tokens fail (minor) - `app.scss:74` `outline-offset: 1px` is a literal. The chip uses `-1px` (also a literal), so the builder note "the chip focus ring with a 1px offset" is not exact: the button ring is outside, the chip ring is inside - `jj diff`
- Code structure pass - `centerOnToday` made public and moved above the protected helpers (top-down), old private copy removed, no dead code, `smooth` default `false` keeps first load instant - `jj diff`
- Scope pass - 8 files, all in the unit (app shell, grid, e2e, criteria, notes) - `jj diff --stat`

## Failures

- Text baseline: "Today" 0.5px lower than "Month". Fix option: the chip value padding (`4px 8px 1px`) on the button.
- `outline-offset: 1px` literal, and it is not the chip value (`-1px`).

## Lead fixes

- Text baseline: fixed. `.today-button` uses flex top alignment and the chip value padding-top; "Today" and "Month" text boxes both at y 159-175.
- Outline offset: now `-1px`, the chip value.
