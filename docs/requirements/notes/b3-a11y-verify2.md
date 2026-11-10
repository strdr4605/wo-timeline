# Unit b3-a11y: verify 2

Verifier, 2026-11-10. Lead: t38. Item: I5. Recheck of the failures in `b3-a11y-verify.md`
against the lead decisions. Builder notes (`b3-a11y.md`, section "Fix") checked, not trusted.

## Failures of verify 1, rechecked

F1 axe on `/` (non-parity) pass - new e2e step "axe: no serious or critical violation on the default view, sample data" waits for an Open bar, then runs axe. Own run on `/` (open 3, in-progress 2, complete 2, blocked 1 bars): serious/critical nodes are only `color-contrast` on chip label (4.42:1), Complete badges (3.03:1), Open badges (2.48:1), all excluded; 0 not excluded - `a11y.spec.ts:121`, Playwright + axe
F2 contrast exclusion pass - `DESIGN_CONTRAST_NODES` lists `.timescale-chip__label`, `[data-status="complete"] > .work-order-bar__badge`, `.drawer-status__pill[data-status="complete"]`, `[data-status="open"] > .work-order-bar__badge`; narrow (class + status), rule `color-contrast` only (`seriousViolations` checks `violation.id`); comment names the three colours and ratios - `a11y.spec.ts:9-20`, `:163-184`
F2b Open pill in drawer fail - not in the lead list, but same design colour: open the drawer from an Open bar on `/` (keyboard Enter, Edit), axe gives serious `color-contrast` on `.drawer-status__pill` (`data-status="open"`), `#00b0bf` on `#e4fdff`, 2.48:1, NOT excluded. The Complete pill is excluded, the Open pill is not. The e2e does not catch it: its drawer axe runs only in parity on a Complete order - Playwright + axe
F3 focus-ring tokens pass - `layout.focusRing.width` 1, `layout.focusRing.offset` -1 in `tokens.json` (+ `agentChoices` note), `$layout-focus-ring-width` / `$layout-focus-ring-offset` in `_tokens.scss`. All 6 `:focus-visible` outlines use them: `.today-button`, `.timescale-chip__value`, `.timescale-menu__item`, `.work-order-bar`, `.work-order-menu__item`, `.drawer-button`. `grep outline src`: no other outline except `outline: none` on the drawer field (box-shadow ring, u4). No grid-line token, no offset literal - grep, diff
F3 computed rings pass - keyboard focus on chip button, Today button, bar, timescale option, menu item, drawer Save, drawer Cancel: each `solid 1px rgb(62, 64, 219)`, offset `-1px`, `:focus-visible` true - Playwright computed style

## Short rechecks

I5 e2e pass - `a11y.spec.ts:22 [I5] controls have names, bars and menus work with the keyboard, the drawer keeps the focus` - npx playwright test
D9 pass - `drawer.spec.ts:120 [D9] Escape closes the drawer, but first closes an open dropdown`, `actions.spec.ts:228 [D9] Escape and a click outside close an edit without a save` - npx playwright test
D10 pass - `drawer.spec.ts:139 [D10] Tab moves through the fields in order, End date above Start date` - npx playwright test
I2 pass - `today.spec.ts:10 [I2] the Today button centres the viewport on today in every timescale` - npx playwright test
F5 pass - 5 `[F5]` tests in `storage.spec.ts` - npx playwright test

## Pixels (`?parity=1`, states of `session-handover-2026-11-10.md`)

Schedule - Default (bar and cursor masks) pass - 0.2%, verify 1 0.2% - pixel-check
Schedule - Default `hover@727,322;wait@300` with masks pass - 0.11%, verify 1 0.11% (no masks: 0.25%, builder table 0.25%) - pixel-check
View Selection pass - 0.43%, committed 0.43% - pixel-check
Options CTA (`fixture=hover`, mask `710,325,32,32`) pass - 0.31%, committed 0.31% - pixel-check
Edit and Delete Expanded (`fixture=hover`, mask `859,320,32,32`) pass - 0.26%, committed 0.26% - pixel-check
Create New Event - With Selection pass - 0.3%, committed 0.30% - pixel-check
Create New Event - Placeholder and Defaults pass - 0.3%, committed 0.30% - pixel-check
Create New Event - Active Text Field pass - 0.32%, committed 0.32% - pixel-check
Create New Event - Status Dropdown pass - 0.29%, committed 0.29% - pixel-check

## Regressions

build pass - `npm run build` exit 0 - log
vitest pass - 29 passed (5 files) - log
playwright pass - 64 passed (12.7s) - log

## Failures

1. F2b: drawer Open status pill `.drawer-status__pill[data-status="open"]`, `#00b0bf` on `#e4fdff`, 2.48:1, serious `color-contrast`, not excluded. Seen on `/` with the drawer open for an Open order. Same design colour as the Open badge. Fix: add `.drawer-status__pill[data-status="open"]` to `DESIGN_CONTRAST_NODES` (and the comment), and add an axe step on a non-parity drawer of an Open order. Lead decision needed: the lead list named only the Open badge.

## Lead fixes

- F2b: `.drawer-status__pill[data-status="open"]` added to `DESIGN_CONTRAST_NODES` (same design cyan, lead decision). New axe step on the drawer of an Open order in non-parity mode. Full playwright: 64 passed.
