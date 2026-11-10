# Unit b6-onpush: verify

Verifier, 2026-11-10. Lead: t38. Item: I6. Builder notes (`b6-onpush.md`) checked, not trusted.
Node 26 (`/opt/homebrew/opt/node@26/bin`). Scratch scripts: scratchpad `hand.mjs`, `hand2.mjs`,
`ts.mjs` (not in the repo).

## Code (I6)

I6 OnPush pass - `grep -rl @Component src/app` gives 5 files: `app.ts`, `timeline-grid.ts`, `timescale-chip.ts`, `work-order-bar.ts`, `work-order-drawer.ts`. All 5 have `changeDetection: ChangeDetectionStrategy.OnPush` - jj diff, grep
I6 track pass - 6 `@for` blocks. Tracks: `option` (timescale string, unique), `center.id` (x2), `column.key` (x2), `bar.order.docId`. No `track $index`. `let i = $index` at `timeline-grid.html:47` is an alias for the cell class, not the track - grep
I6 drawer `markForCheck` pass - `nameError()` and `dateError()` are plain methods that read the form, not signals, so a call on `valueChanges` is a valid OnPush guard. A run with the call removed did not show a stale error in my datepicker scenario (the click in the drawer marks the view). The call is defensive; it is not dead code - Playwright, `hand2.mjs`
Scope pass - `jj diff --stat`: 5 component files, `tests/e2e/onpush.spec.ts`, `acceptance-criteria.json/.md` (I6 only: pending -> pass, progress 61 -> 62), `notes/b6-onpush.md`. No other change - jj diff
Test order pass - `onpush.spec.ts`: test at top, `sourceFiles` and `read` helpers at the bottom - read

## [I6] test mutations

Baseline pass - `[I6] every component uses OnPush and no template tracks by $index` 1 passed - playwright
OnPush removed from `work-order-bar.ts` pass - test fails, `components without OnPush` lists `src/app/work-order-bar/work-order-bar.ts` - playwright
`track center.id` -> `track $index` at `timeline-grid.html:59` pass - test fails, `templates that track by $index` lists `timeline-grid.html` - playwright
Restore pass - both files restored by hand, `jj diff --stat` the same as before (9 files, +111 -9) - jj

## Pixels (`?parity=1`, states of `session-handover-2026-11-10.md`)

Schedule - Default (bar and cursor masks) pass - 0.2%, committed 0.2% (builder wrote 0.21%) - pixel-check
Schedule - Default `hover@727,322;wait@300` with masks pass - 0.11%, committed 0.11% - pixel-check
View Selection pass - 0.43%, committed 0.43% - pixel-check
Options CTA (`fixture=hover`, mask `710,325,32,32`) pass - 0.31%, committed 0.31% - pixel-check
Edit and Delete Expanded (`fixture=hover`, mask `859,320,32,32`) pass - 0.26%, committed 0.26% - pixel-check
Create New Event - With Selection / Placeholder and Defaults / Active Text Field / Status Dropdown pass - 0.3% / 0.3% / 0.32% / 0.29%, committed same - pixel-check (steps of `u4-fix.md`)

## Behaviour by hand (Playwright, dev server, OnPush build)

C9 live preview pass - during an end-handle drag the tooltip goes `Jan 29 -> Feb 6 -> Feb 13 -> Feb 21, 2027` and the bar width 465 -> 587 px before release; commit sets `aria-label` to `Sep 18, 2026 to Feb 21, 2027` - hand.mjs
C9 keyboard resize pass - focus bar, `Shift+ArrowRight`: end Jan 21 -> Jan 22, 2027 (rendered in 27 ms, no other input); `Alt+Shift+ArrowLeft`: start Sep 18 -> Sep 17, 2026; tooltip follows. (A first read without wait was too early; with a poll it passes.) - hand2.mjs
C9 resize error pass - drag the end 6 columns left: `.resize-alert` "The end date must be after the start date." shows, then goes after 4312 ms with no user input - hand.mjs
I2 Today pass - grid `scrollLeft` 0 -> 240 - hand.mjs
Timescale menu pass - Day / Week / Month picks: chip text and header change (Day "27", 29 cells; Week "Sep 28", 13 cells; Month "May 2026", 13 cells); outside click closes the list - ts.mjs, hand.mjs
Hover Options menu pass - hover shows the three-dot button; click opens Edit and Delete; Escape and an outside click close it - hand.mjs
Edit pass - drawer prefilled "Compleks Systems", rename to "Compleks Renamed" shows on the bar - hand.mjs
Delete pass - bars 8 -> 7 - hand.mjs
localStorage reload pass - resized Konsulting Inc dates and the delete survive F5 - hand.mjs
ng-select status pass - mouse pick shows "Complete"; keyboard pick (ArrowDown, Enter) shows a value, panel closes - hand2.mjs
ngb-datepicker pass - overlap alert "These dates overlap another order on Konsulting Inc." shows; a day pick in the popup writes `28.08.2024` and the alert goes; typed `31.13.2024` shows "Enter the date as dd.mm.yyyy.", a popup pick removes it - hand2.mjs
Console pass - no page errors, no console errors in all runs - hand.mjs

## Regressions

`npm run build` pass - bundle complete, 0 warnings - npm
`npx vitest run` pass - 5 files, 29 tests passed - vitest
`npx playwright test` pass - 66 passed (12.8 s) - playwright
`node docs/requirements/verify.mjs` pass - 0 fail, 62 pass, 10 pending. Prints `unknown item id in test title: P9` (old test, not this unit) - verify.mjs

## Notes (not failures)

- The `$index` regex catches only `track $index`. `let i = $index; track i` would pass. No such code exists now.
- The OnPush regex also matches the text inside a comment. Low risk.

## Failures

None.
