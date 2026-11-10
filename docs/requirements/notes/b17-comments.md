# b17-comments: H5 comments on date maths and key decisions

## What changed

Comments only. No code line changed (`git diff src` has only comment lines).

The earlier H5 check (u6-small) found the main rules already explained. This unit added comments
where a rule was not explained:

- `src/app/timeline/timeline.ts:95`: the Date constructor moves a month number outside 0 to 11 into
  the previous or next year (Month columns).
- `src/app/timeline/timeline.ts:115`: an hour column moves with the minutes; longer columns move per
  whole day, so a month of 28 to 31 days fills one column width.
- `src/app/timeline/timeline.ts:195`: two Mondays are 7 day numbers apart, so `/ 7` gives
  consecutive week numbers.
- `src/app/timeline/timeline.ts:244`: `addDays` adds calendar days, not 24 hours, and rolls over the
  month end. DST cannot change the result.
- `src/app/timeline-grid/timeline-grid.ts:570`: the column window is in offsets from today, so a left
  extend does not move it.
- `src/app/timeline-grid/timeline-grid.ts:705`: `dayInColumn` rounding gives 0 days for an hour column
  and absorbs the 23 or 25 hour DST day.
- `src/app/work-order-drawer/drawer-form.ts:45`: the +7 days default rolls over the month end.

Comments that were already there and are now guarded: see the H5 evidence in
`docs/requirements/acceptance-criteria.json`.

New spec `tests/e2e/comments.spec.ts`: `[H5]`, a static source check (same pattern as
`onpush.spec.ts`). It fails when a key comment phrase is removed.

## Results

- Pixel check `Schedule - Default`, handover masks: no steps 0.2% before and after;
  `hover@727,322;wait@300` 0.11% after (same as u6-small).
- `npm run build`: clean, 0 warnings.
- `npx vitest run`: 31 passed.
- `npx playwright test`: 88 passed.
- `node docs/requirements/verify.mjs`: 73 pass, 2 pending, H5 pass.
- Parity mode: not touched (comments only).

## Note for the lead

`verify.mjs` writes the test title as evidence. A new verify run replaces the file:line list in the
H5 evidence with `e2e: [H5] ...`. The status stays pass.
verify.mjs also prints `unknown item id in test title: P9` (existing, not from this unit).
