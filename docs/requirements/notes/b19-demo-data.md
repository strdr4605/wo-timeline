# b19-demo-data (I12)

Bonus unit. Source: human request "a button to dump a lot of work orders and show how
virtualization works". Scope: core + extra A + extra B of `session-handover-2026-11-10b.md`.
Extra C is not done.

## What changed

| File | Change |
|---|---|
| `src/app/demo.ts` (new) | Flags `DEMO_MODE` (`?demo=1`, false in parity mode) and `VIRTUAL_MODE` (`?virtual=0` gives false). Seeded generator (mulberry32, fixed seed) for orders and work centres. |
| `src/app/demo-badge/` (new) | Fixed badge, bottom right: `Orders N · bars in DOM N · columns in DOM N · frame N ms`. Chip tokens only. |
| `src/app/app.html`, `app.ts` | Buttons "Load 5,000 orders", "Load 50 work centres", "Reset data" after the Today button, and the badge. Only with `DEMO_MODE`. |
| `src/app/data/schedule.service.ts` | `workCenters` is now a private writable signal (read-only outside). `loadDemo()`, `resetData()`. While demo data shows, `persist()` writes nothing. |
| `src/app/timeline-grid/timeline-grid.ts` | `updateWindow()` returns at once when `VIRTUAL_MODE` is false. The window stays null, so every column and bar renders. Extend at the edges still works. |
| `tests/e2e/demo-data.spec.ts` (new) | 6 tests `[I12]`. |
| `tests/unit/demo.spec.ts` (new) | 4 tests `[I12]`: 5,000 orders, all statuses, no overlap (the real `overlaps()`), end after start, span, same seed gives same data. |
| `acceptance-criteria.json` / `.md` | Row I12 and source `human`. |

### Behaviour

- "Load 5,000 orders": 5,000 orders on the current work centres. Load replaces the orders.
- "Load 50 work centres": the 5 sample centres and 50 new ones (55 rows), with 5,000 orders
  spread over all 55.
- "Reset data": the data of a fresh load (the saved orders, or the sample data), the 5 sample
  centres. Same as a reload.
- Load and reset close an open drawer.
- An edit or a delete on demo data is not saved (tested with a delete).

### Generator

Each work centre gets a row of equal slots. Each order sits inside its own slot, so two orders of
one centre never touch. The slot length is `max(2, floor(1460 / ordersPerCentre))` days, centred
on today. Order length 2 days or more (the brief: the end is after the start).

- 55 centres: 91 orders a centre, 16-day slots, about 730 days before and after today.
- 5 centres: 1,000 orders a centre, 2-day slots. 1,000 orders of 2 days do not fit in 4 years,
  so the span grows to about 1,000 days (2.7 years) before and after today.

## Verification

- Pixel check `Schedule - Default`, bar and cursor masks of the handover: **0.2% before, 0.2%
  after**.
- Parity mode: `?parity=1&demo=1` shows no demo button and no badge (e2e).
- `npm run build` clean. `npx vitest run` 35 passed. `npx playwright test` 97 passed.
- `node docs/requirements/verify.mjs`: 74 pass, 0 fail, 2 pending.

## Extra B effect (DOM count, frame time)

Headless Chromium, 1440 x 1024, dev server. "Load" is the time from the click to the second
frame after it. Scroll: 160 frames of 60 px each, left and right around today, frame gap
median / p95 / max in ms. Bars and nodes: in the DOM after the load.

### Day view (48 px columns)

| Rows | Virtual | Load ms | Bars in DOM | Columns in DOM | DOM nodes | Frame median / p95 / max |
|---|---|---|---|---|---|---|
| 5 | on | 109 | 205 | 81 | 4,663 | 16.9 / 26.4 / 45.9 |
| 55 | on | 134 | 298 | 81 | 6,766 | 16.6 / 36.5 / 54.7 |
| 5 | off | 869 | 5,000 | 89 to 209 | 105,382 | 16.7 / 34.5 / 283.9 |
| 55 | off | 968 | 5,000 | 89 to 209 | 105,532 | 16.8 / 41.1 / 280.9 |

### Month view (114 px columns, the default)

| Rows | Virtual | Load ms | Bars in DOM | Columns in DOM | DOM nodes | Frame median / p95 / max |
|---|---|---|---|---|---|---|
| 5 | on | 628 | 2,825 | 37 | 59,551 | 116.9 / 185.1 / 237.2 |
| 55 | on | 826 | 3,905 | 37 | 82,381 | 132.1 / 240.0 / 404.3 |
| 5 | off | 974 | 5,000 | 73 to 133 | 105,334 | 17.1 / 51.9 / 248.6 |
| 55 | off | 1,092 | 5,000 | 73 to 133 | 105,484 | 16.7 / 51.5 / 256.4 |

Base (sample data, 8 orders): bars 4 to 8, about 400 to 500 DOM nodes, frame median 16 ms.

### Reading

1. **Day view shows the windowing well.** 205 bars instead of 5,000 (4%), 22x fewer DOM nodes,
   load 8x faster, worst frame 46 ms instead of 284 ms.
2. **55 rows vs 5 rows:** rows are not windowed, so all 55 rows and their bars inside the column
   window are in the DOM. Day view: 298 bars instead of 205, worst frame 55 ms instead of 46 ms.
   The cost grows with the rows, but stays small at 55 rows. Row windowing would matter at
   hundreds of rows.
3. **Month view with windowing on is slower than off (finding, not fixed).** The window holds
   37 months, about 3 years, so with this dense data 2,825 of 5,000 bars stay in the DOM. During a
   scroll the window moves about once a viewport and each move re-renders the ~2,800 bars in it
   (127,387 DOM mutations in 40 frames, against 10,161 with windowing off). The CDP profile puts
   2.0 s of 2.9 s in `extendAtEdges` (forced style recalc of `getComputedStyle` after the
   mutations): 26 style recalcs, 1.85 s. With windowing off, the scroll is compositor-only.
   This is code of b13 (I9), out of this unit's scope. Possible fixes for a later unit: keep
   the bar position independent of the window start, so a window move does not touch the
   bars that stay; read `--column-width` once per timescale instead of on every scroll; a
   narrower window in Month view.
4. The demo data is much denser than real data (on 5 rows a 2-day order every 2 days). The sample
   data and the normal app are not affected.

## Notes for the lead

- `verify.mjs` keeps only the first test result per item id as evidence. It replaced the
  hand-written D12 evidence (from b18) with the unit-test title only, and the I12 evidence with
  one unit-test title. I restored both rows by hand after the run. A later fix of `verify.mjs`
  could keep the existing evidence when it already names the test.
- The source legend of the `.md` comes from `sources` in the `.json`. I added `human` there.
- A new timescale or the Today button sets the window to null until the next scroll measure (b13
  behaviour). With 5,000 orders that can render all bars for one render. Not measured in this
  unit (the probes changed the timescale before the load).
- Not committed.
