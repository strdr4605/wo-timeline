# b12-infinite verify (I1 infinite horizontal scroll)

Verifier, 2026-11-11. Lead: t38. Node 26 (`/opt/homebrew/opt/node@26/bin`). All browser checks are
headless. Scripts in the verifier scratchpad: `i1.mjs`, `day.mjs`, `gap.mjs`. Baseline: commit
`bd53520` (`git archive`) served on :4300. Mutation copy of the working copy served on :4301.

## Pixels (`scripts/pixel-check.mjs`)

- Schedule - Default, masks `437,249,463,38;556,352,463,38;945,352,463,38;677,401,533,38;715,330,25,25`
  pass - 0.2% on :4200 and 0.2% on baseline :4300, `app.png` byte-identical (`cmp`) - pixel-check
- Schedule - Default, same masks, `hover@727,322;wait@300` pass - 0.11% on :4200 and :4300,
  `app.png` byte-identical - pixel-check
- 0.2% vs 0.21% pass (no drift) - the builder value 0.21% is with the four bar masks only (no
  cursor mask `715,330,25,25`). I measured 0.21% with the four masks and 0.2% with five masks.
  b10 and b11 notes also give 0.21% for "bar masks". Same screenshot, different mask set - pixel-check

## Behaviour (Playwright, 1440x1024). Spec: "Dynamically load more date columns as user scrolls left/right (prepend past dates, append future dates)", "When prepending, adjust scroll position to maintain view"

- Range as offsets pass - `firstOffset`/`lastOffset` linkedSignals, `columnsInRange` loops
  `columnFor(offset)`, no stored column array - `src/app/timeline-grid/timeline-grid.ts`
- Named chunk pass - `EXTEND_CHUNK = 30` - timeline-grid.ts
- Load extends pass - Month 13 -> 73 columns at first paint (Nov 2023..Nov 2029) - i1.mjs
- Left extend, no jump pass - `scrollLeft = 300`: columns 73 -> 103, scrollLeft 300 -> 3720, bar x
  delta 0 on 6 rAF frames after the scroll - i1.mjs
- Right extend in Month pass - scroll to end: 103 -> 133 - i1.mjs
- Right extend in Day and Hour FAIL - bars past the rendered range set `scrollWidth`, so the
  right-edge test `scrollWidth - clientWidth - scrollLeft < clientWidth` stays false. Day: 59
  columns, last column right edge at content x 3214, scrollWidth 14661 (max bar right 14494).
  Hour: 97 columns, last column at 5038, scrollWidth 290853. Scrolled so the last column is at
  viewport x 701: no extend (59 and 97 columns after 600ms), the header and the grid end at x
  701-749 and bars run on into an empty area to x 1440. Screenshot `gap-Day.png` - gap.mjs
- Timescale change resets pass - Month 133 -> Day 59 (14+30 left, 14 right) -> Month 73;
  today centred after load (-0.5px) - day.mjs, i1.mjs
- Today resets pass - 193 columns after 4 left extends -> 73 after the Today button, today
  marker -0.5px from the grid centre - i1.mjs
- Bars after extend pass - `[I1] a bar stays at its date after a left extend` - e2e
- Today line after extend pass - marker centred after load extend and after Today - i1.mjs
- Hover placeholder after extend pass - placeholder shows on a row after extends (1 element);
  `cellHover.x` shift code reviewed - i1.mjs
- C9 drag after extend pass - `resize.spec.ts` with an injected left extend (73 -> 103) before the
  test body: passed - mutation copy
- I10 rail after extend pass - `rail.spec.ts` with the same injected extend: passed - mutation copy
- I5 keyboard after extend pass - `a11y.spec.ts` with the injected extend on its non-parity part:
  passed. The main I5 part runs in parity, so no extend there - mutation copy
- Parity fixed range pass - `?parity=1`: 13 columns, scrollLeft 570, still 13 after scroll to 0
  and to the end; no listener when `PARITY_MODE` - i1.mjs, `listenForEdges`
- No windowing pass - all columns render, no slice - timeline-grid.ts

## Relaxed B5 and B8 asserts

- B5 pass, relaxation justified - B5 is about labels. The first-cell wait uses `DAY_LABEL`
  `/^\d{1,2}$/` and `WEEK_LABEL` `/^[A-Z][a-z]{2} \d{1,2}$/`, which do not match the old
  timescale labels, so the wait proves the switch. Then every label is checked. A count is no
  longer a fixed value after I1 - tests/e2e/timeline.spec.ts:97
- B8 pass, relaxation justified with one weak point - the Month centre check is unchanged. The
  Day check is now ">= 14 on each side". Mutation `BUFFER.Day = 3`: B8 fails (right side 3).
  But it fails only because of the Day right-extend failure above. When the right extend works,
  each side gets +30 and B8 would pass with any buffer. The buffer stays guarded by
  `tests/unit/timeline.spec.ts:37-40` (Day index 16 from `buildColumns`, which reads `BUFFER`,
  the same constant the grid uses) - mutation copy, vitest

## Regressions

- `npm run build` pass - clean
- `npx vitest run` pass - 31 passed
- `npx playwright test` pass - 78 passed (15.3s)

## Code

- Tokens pass - column width read from `--column-width`, no new literals except `EXTEND_CHUNK`
- Top-down pass - public `centerOnToday` first, helpers below, constant at file end
- Dead code note - `buildColumns` has no caller in `src/` now; only unit tests call it
- Scope pass - changes in timeline.ts, timeline-grid.ts, two e2e specs, criteria and notes only
- Criteria note - `acceptance-criteria.json` sets I1 `pass`; this is wrong while the Day/Hour
  right-extend failure is open

## Failures

- I1 right extend in Day and Hour: bars past the rendered range inflate `scrollWidth`, so the
  right edge never triggers an extend. The user sees the header and grid end with empty space
  on the right (Day: columns end at content x 3214, scrollWidth 14661). Builder note "Wheel left /
  right in Hour, Day, Week, Month: columns grow" is not true for the right edge in Day and Hour.
  No e2e test covers the right edge outside Month.
