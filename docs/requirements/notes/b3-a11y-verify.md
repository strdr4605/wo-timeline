# Unit b3-a11y: verify

Verifier, 2026-11-10. Lead: t38. Item: I5. Builder notes checked, not trusted.

## Pixels (`?parity=1`, steps of the session handover and `u4-fix.md`)

Schedule - Default (bar and cursor masks) pass - 0.2%, same as builder table, not above committed - pixel-check
Schedule - Default `hover@727,322;wait@300` pass - 0.11% - pixel-check
View Selection `click@200,167;wait@300` pass - 0.43% - pixel-check
Options CTA (`fixture=hover`, `hover@722,333;wait@300`, mask `710,325,32,32`) pass - 0.31%, committed 0.31% (u3-bars-verify P5) - pixel-check
Edit and Delete Expanded (`fixture=hover`, `hover@871,328;click@871,328;wait@300`, mask `859,320,32,32`) pass - 0.26%, committed 0.26% (u3-fix) - pixel-check
Create New Event - With Selection pass - 0.3%, committed 0.30% (u4-fix) - pixel-check
Create New Event - Placeholder and Defaults pass - 0.3%, committed 0.30% - pixel-check
Create New Event - Active Text Field pass - 0.32%, committed 0.32% - pixel-check
Create New Event - Status Dropdown pass - 0.29%, committed 0.29% - pixel-check
New rings at rest pass - all new outlines are `:focus-visible` only; no new element visible at rest; parity mode does not focus the name field (D11 state kept) - diff, e2e step

## Behaviour (spec: "Accessibility: ARIA labels, focus management"; "Keyboard navigation: Tab through form, Escape to close panel")

I5 names: three-dot button pass - "Actions for <name>", `aria-haspopup="menu"`, `tabindex -1` (the bar gives the same action) - Playwright
I5 names: timescale button and listbox pass - "Timescale: Month", listbox "Timescale" - Playwright
I5 names: Today button pass - "Today: scroll the timeline to today" (label starts with visible text) - Playwright
I5 names: drawer close pass - the drawer has no X; Cancel is "Cancel and close the drawer" - Playwright
I5 names: form fields pass - drawer-name, drawer-status, drawer-end, drawer-start all have a `<label for>` - Playwright `labels`
I5 names: bars pass - "Concentrix Ltd, Complete, Oct 18, 2026 to Feb 22, 2027" (tooltip content) - Playwright
I5 drawer focus in pass - open from bar keyboard, from three-dot click + Edit, and from an empty cell (non-parity) all focus `#drawer-name` - Playwright
I5 drawer focus back pass - Escape and Cancel return focus to the bar; empty-cell opener is body, focus goes to body - Playwright
I5 focus trap pass - Shift+Tab wraps name -> Save -> Cancel -> Start; Tab from Start -> Cancel; click on empty panel then Tab -> Cancel; datepicker popup is inside `.drawer`, Tab cycles its buttons and stays in the drawer - e2e + Playwright
I5 bar keyboard pass - Tab order: chip, Today, bars; Enter and Space open menu, focus on Edit; ArrowUp/Down/Home/End wrap; Tab out of menu closes it; Escape closes menu and focuses the bar - Playwright
I5 timescale keyboard pass - Enter/Space/ArrowDown open on selected option; arrows, Home, End move; Enter/Space select and refocus button; Escape closes and refocuses; pointer click keeps focus on button (no option ring) - e2e + Playwright
I5 axe default view, parity pass - 0 serious/critical outside the exclusion - e2e `[I5]`
I5 axe open drawer, parity pass - 0 serious/critical outside the exclusion - e2e `[I5]`
I5 axe open drawer, non-parity (create + status dropdown open) pass - only excluded nodes; moderate `landmark-no-duplicate-banner`, minor `aria-allowed-role` on `aside[role=dialog]` (pre-existing, not serious) - Playwright + axe
I5 axe default view, non-parity (`/`, sample data) fail - serious `color-contrast` on every Open badge: `#00b0bf` on `#e4fdff`, 2.48:1, `.work-order-bar[data-status="open"] > .work-order-bar__badge`; not in `DESIGN_CONTRAST_NODES`. The e2e runs axe only in parity, where no Open badge is in view - Playwright + axe
Contrast exclusion judgement fail (incomplete) - narrow: only rule `color-contrast`, only chip label and Complete badge/pill, other serious rules still fail the test; justified: both are design colours (4.42:1, 3.03:1), a fix changes design pixels. But the note "two design colours under 4.5:1" is false: Open badge `#00b0bf` on `#e4fdff` is 2.48:1 and is also a design colour (u3-bars-verify P7). In-progress `#3e40db` on `#d6d8ff` and Blocked `#b13600` on `#fceeb5` pass. Lead decision: add Open to the list and run axe on `/` too, or fix colours outside parity - axe, computed style
Datepicker open (observation, not an I5 required state) - serious `color-contrast` on ngb outside-month days `#b4b8cb` on `#ffffff`, 1.97:1 - axe
D9 pass - `[D9] Escape closes the drawer, but first closes an open dropdown`, `[D9] Escape and a click outside close an edit without a save`; also Playwright: Escape closes status panel first, then datepicker first, then drawer - npx playwright test
D10 pass - `[D10] Tab moves through the fields in order, End date above Start date` - npx playwright test
F5 pass - 5 `[F5]` tests in storage.spec.ts - npx playwright test
I2 pass - `[I2] the Today button centres the viewport on today in every timescale` - npx playwright test
e2e title carries [I5] pass - `a11y.spec.ts:20 [I5] controls have names, ...` - pw log

## Regressions

build pass - `npm run build` exit 0 - log
vitest pass - 29 passed (5 files) - log
playwright pass - 64 passed (12.6s) - log

## Code

Tokens fail (minor) - menu item and timescale option outlines use `t.$layout-grid-vertical-grid-line-width` as the focus-ring width (a grid-line token, wrong meaning; bar and drawer buttons use `$component-text-field-focus-ring-width`); `outline-offset: 1px` / `-1px` literals - `work-order-bar.scss`, `timescale-chip.scss`
Dead code pass - none found; `closeMenu` and `keyboard.ts` used - diff
Top-down order pass - public/protected handlers above private helpers in bar, chip, drawer - diff
Scope pass - only bar, chip, drawer, app.html, keyboard.ts, a11y spec, axe dev dependency, criteria files (script output) - `jj diff --stat`
Minor: `aria-controls="timescale-menu"` points to a missing id while closed (axe does not flag it) - `timescale-chip.html`

## Failures

1. I5 axe default view non-parity: Open badge `#00b0bf` on `#e4fdff` 2.48:1, serious, not excluded, not tested (`/` has no axe step).
2. Contrast exclusion incomplete: builder note says two design colours fail; there are three (chip label, Complete, Open). Lead decision on Open.
3. Code (minor): focus-ring width of menu items and timescale options uses grid-line token `$layout-grid-vertical-grid-line-width`; offset literals.
