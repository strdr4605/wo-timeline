# Unit b10-dates: verify

Verifier, 2026-11-11. Lead: t38. Item E1 (bonus wave). Node 26.13.0. Headless Playwright only.
Spec: "All fields required", "Create/Edit slide-out panel with form validation", "Click
Create/Save | Validate, save, and close panel" (`FE-technical-test-10-2026.md` lines 256, 18, 172).

## Pixels

Masks: bars from the handover on Default, cursor `715,330,25,25` on all. Steps from `u4-fix.md`.
The date steps Tab out of both date fields with valid values, so the new blur rule runs.

- Schedule - Default pass - 0.2% (handover 0.2%) - pixel-check
- With Selection pass - 0.3% (0.30%), End 30.12.2025 before Start 23.12.2025 shows no error at rest - pixel-check
- Placeholder and Defaults pass - 0.3% (0.30%) - pixel-check
- Active Text Field pass - 0.32% (0.32%) - pixel-check
- Status Dropdown pass - 0.29% (0.29%) - pixel-check

## Behaviour (by hand, headless, `/?parity=1`, 1440 x 1024)

Script: scratchpad `byhand2.mjs`, 400 ms wait after each blur. Blur to error: 12 ms.

- E1 parse pass - `parseDottedDate` null for 40.13.2024, 31.02.2025, 29.02.2025, 00.01.2025, 31.04.2025; 29.02.2024 valid; month 1-12 and last day from `new Date(y, m, 0)` - drawer-form.ts, vitest
- E1 create, End, Tab pass - while typing 31.02.2025 no error; after Tab `31.02.2025 is not a valid date.`, aria-invalid true, focus moves to Start - Playwright
- E1 create, Start, click-away pass - 40.13.2024 then click at 1100,700: `40.13.2024 is not a valid date.` - Playwright
- E1 Create blocked pass - drawer stays open, bars 4 = 4, name error shows on submit - Playwright
- E1 fix value pass - End 29.02.2024 + blur: End error gone; Start 01.02.2024 + blur: Start error gone - Playwright
- E1 name submit-only pass - empty name, Tab and click-away: no name error; error only after Create - Playwright
- E1 edit, Start, Tab pass - Konsulting Inc Edit, Start 31.04.2024 + Tab: `31.04.2024 is not a valid date.` - Playwright
- E1 edit, End, click-away pass - 1.13.2024: `1.13.2024 is not a valid date.` - Playwright
- E1 Save blocked pass - drawer stays open, bars 4 = 4 - Playwright
- E1 edit fix pass - Start 21.08.2024, End 30.11.2024: both errors gone - Playwright
- E1 datepicker pick pass - after 31.02.2025 error, open picker, pick day 20: value 20.11.2026, no error - Playwright
- E1 end before start pass - End 01.09.2024, Start 10.09.2024, blur: no error; Create: `The end date must be after the start date.` - Playwright
- E4 overlap pass - Konsulting row, End 25.08.2024, Create: alert `These dates overlap another order on Konsulting Inc.`, bars 4 = 4 - Playwright
- edge 00.01.2024 pass - `00.01.2024 is not a valid date.` - Playwright
- edge 01.00.2024 pass - `01.00.2024 is not a valid date.` - Playwright
- edge 1.1.2024 pass - valid, field shows 01.01.2024 - Playwright
- edge spaces pass - `  15.10.2024  ` valid, shows 15.10.2024; ` 31.02.2025 ` message trims to `31.02.2025 is not a valid date.` - Playwright
- edge wrong shape pass - 12.2024 and abc: `Enter the date as dd.mm.yyyy.` - Playwright
- edge empty pass - empty + Tab: `Enter a date.` on End and Start - Playwright
- edge leap centuries pass - 29.02.1900 invalid, 29.02.2000 valid - Playwright

## Regressions

- build pass - `npm run build` exit 0, no warnings - npm
- vitest pass - 31 passed, 5 files - npx vitest run
- playwright pass - 73 passed - npx playwright test
- verify.mjs pass - pass 66, pending 6, 0 fail; warning `unknown item id P9` exists before this unit - node docs/requirements/verify.mjs

## Code

- scope pass - `jj diff --stat`: drawer-form.ts, work-order-drawer.ts, 3 test files, acceptance-criteria.json/.md (E1 evidence row only), builder notes - jj
- order pass - `daysInMonth` and `invalidDateMessage` at the bottom, below their callers - review
- dead code pass - none - review
- literals pass - no style changes; messages are strings in the component, as before - review
- comment note - `DOTTED_DATE` has no doc comment; the constant above it has one. Not a failure - review
- year note - `new Date(y, m, 0)` maps years 0-99 to 1900-1999. Only 29.02.0000 differs (rejected). Not a failure - review
- test note - first by-hand run read errors with no wait and saw stale state; with a 400 ms wait all correct; measured blur to error 12 ms. Not an app defect - Playwright

## Failures

None.
