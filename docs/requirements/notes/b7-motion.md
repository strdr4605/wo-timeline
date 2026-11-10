# Unit b7-motion: builder notes

Builder, 2026-11-10. Lead: t38. Item I3 (smooth animations). Node 26
(`/opt/homebrew/opt/node@26/bin`).

## What existed before

The drawer already slid in and out (`transform` 200ms ease-out) and the overlay already faded.
The drawer stays in the DOM: on close it slides out, then `visibility: hidden` after 200ms. This
unit keeps that behaviour. It only moves the duration to the new motion tokens.

## What changed

- `docs/design/tokens.json`, `src/styles/_tokens.scss` (`npm run tokens`): new group
  `layout.motion` with `durationFast` 120ms, `durationBase` 200ms, `easing` ease-out. The token
  `layout.panel.slideDuration` (200ms) is removed; the drawer uses `durationBase`. The reason is in
  `agentChoices["layout.motion (b7-motion)"]`.
- `work-order-drawer.scss`: uses the motion tokens. No change in value.
- `work-order-bar.scss`:
  - The bar transitions `background-color`, `border-color` and `box-shadow` (120ms). It does not
    transition `left` or `width`, so a resize drag follows the pointer at once.
  - The handles fade in (opacity, 120ms).
  - The three-dot button fades in, and its pressed fill changes, in 120ms.
  - The Options menu fades in and out (opacity, 200ms).
  - The menu rows change their hover fill in 120ms.
- `timescale-chip.scss`: the timescale menu is created by `@if`, so it fades in with the CSS
  animation `timescale-menu-enter` (200ms). It closes at once. The row hover fill takes 120ms.
- `src/styles.scss`: `prefers-reduced-motion: reduce` sets `transition-duration` and
  `animation-duration` to 0s with `!important` on every element. The delays stay: the tooltip
  dwell (800ms) is a wait, not a motion.

## Decisions

- The menus only fade. A first version also moved them 4px down into place. Two specs measure the
  menu box right after the open (`bars.spec.ts` C5, `timeline.spec.ts` B3), so the move broke
  them. A fade keeps the box at its place from the first frame.
- Parity mode keeps the motion. Every motion ends in 200ms or less, and the pixel check waits at
  least 400ms after the last step, so the screenshots do not change (see below). No stored data,
  scroll or new button.
- The tooltip and the resize label are not in scope. They keep their current behaviour.

## Checks by hand (Playwright, before the spec)

- Computed transitions: bar `background-color, border-color, box-shadow` 0.12s; handle and button
  `opacity` 0.12s; menu `opacity` 0.2s; drawer `transform` 0.2s plus `visibility 0s 0.2s` on close;
  timescale menu animation 0.2s.
- Close: 60ms after Escape the drawer is `visible` at `translateX(296px)` and the overlay opacity is
  0.42. At 360ms the drawer is `hidden` at `translateX(606px)`.
- Reduced motion: every duration above is 0s. 60ms after Escape the drawer is already at
  `translateX(606px)`, overlay opacity 0.

## Evidence

`tests/e2e/motion.spec.ts`, 3 tests titled `[I3]`:

1. The drawer and the overlay run a transition on open and on close. During the close the drawer
   is visible, then hidden, and it stays in the DOM.
2. Bar, handle, three-dot button and Options menu have a transition under 300ms. A hover starts
   the opacity transition of the button. The timescale menu has the enter animation.
3. With `page.emulateMedia({ reducedMotion: 'reduce' })` every transition duration is 0s, the
   timescale menu animation is 0s, and the opened drawer runs no transition.

The spec passed 5 of 5 runs with `--repeat-each=5`. `verify.mjs` set I3 to pass.

## Final gate

- `npm run build`: clean.
- `npx vitest run`: 29 passed.
- `npx playwright test`: 69 passed (66 before plus 3 new).
- `node docs/requirements/verify.mjs`: 63 pass, 0 fail, 9 pending.

## Pixel check, before and after (same values)

| State | Before | After |
|---|---|---|
| Schedule - Default (bar and cursor masks) | 0.2% | 0.2% |
| Schedule - Default `hover@727,322;wait@300` | 0.11% | 0.11% |
| View Selection | 0.43% | 0.43% |
| Options CTA (`fixture=hover`) | 0.31% | 0.31% |
| Edit and Delete Expanded (`fixture=hover`) | 0.26% | 0.26% |
| With Selection / Placeholder and Defaults / Active Text Field / Status Dropdown | 0.3 / 0.3 / 0.32 / 0.29% | 0.3 / 0.3 / 0.32 / 0.29% |

Steps and masks are those of `session-handover-2026-11-10.md` and `u4-fix.md`.

## What still differs

Nothing new. The design has no motion, so no artboard can check the durations.
