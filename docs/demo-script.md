# Demo script: Loom recording of the Work Order Schedule Timeline

This script gives the exact click path for the Loom recording. The total time is 9 minutes 40 seconds. The
limits are 5 and 10 minutes.

Each step was done in headless Playwright against `http://localhost:4200` on 2026-11-11, with a
browser window of 1440 x 1024. All pixel positions in this script are for that window size. The
dates in the app come from the date of the recording, so the "current" month moves. The dates of
the sample data do not move.

## Time budget

| # | Section | Time |
|---|---|---|
| 0 | Preparation (not recorded) | - |
| 1 | Start the app | 0:20 |
| 2 | Timeline and timescales | 0:50 |
| 3 | Create an order from an empty cell | 0:40 |
| 4 | The overlap error | 0:40 |
| 5 | Edit and delete from the three-dot menu | 1:10 |
| 6 | Date validation | 0:40 |
| 7 | Drag to resize a bar and the rail | 0:50 |
| 8 | Today button | 0:20 |
| 9 | Keyboard and focus | 0:40 |
| 10 | Infinite scroll and virtualization | 0:30 |
| 11 | Reload: the data stays (localStorage) | 0:20 |
| 12 | Parity mode | 0:20 |
| 13 | Code structure tour | 1:40 |
| 14 | Tests and demo videos | 0:40 |
| | Total | 9:40 |

## 0. Preparation (not recorded)

1. Set the browser window to 1440 x 1024.
2. Make sure that the storage is empty. Open the DevTools console on `http://localhost:4200` and
   type `localStorage.clear()`. Then close the DevTools.
3. Open the repository in the editor. Close all files.

## 1. Start the app (0:20)

1. In a terminal, type `npm start`. This runs `ng serve --port 4200`.
2. Open `http://localhost:4200`.
3. Say: "Angular 20, standalone components, signals, SCSS. The data is the sample data of the
   brief: 5 work centres and 8 work orders."

## 2. Timeline and timescales (0:50)

1. Show the page: the "Work Center" rail on the left, the month columns on the right.
2. Show the "Current month" chip over the current month column and the vertical today line.
3. Hover a bar. A tooltip shows the name, the status and the dates.
4. Show the four status colours: "Complete" (Concentrix Ltd), "Open" (Rodriques Electrics),
   "In progress" (Konsulting Inc), "Blocked" (McMarrow Distribution).
5. Click the "Timescale Month" chip. The menu shows Hour, Day, Week and Month.
6. Click "Week". The chip over the current column says "Current week".
7. Open the chip again and click "Day". The chip says "Today".
8. Open the chip again and click "Hour". The columns show hours ("17:00", "18:00"). The chip says
   "Today".
9. Open the chip again and click "Month".

## 3. Create an order from an empty cell (0:40)

1. Move the pointer over the empty "Genesis Hardware" row, in the "Aug 2026" column (x 638,
   y 268). A placeholder box shows with the tooltip "Click to add dates".
2. Click. The drawer "Work Order Details" opens from the right. The focus is in "Work Order Name".
3. Show the values: Start date is the clicked day (16.08.2026). End date is 7 days later
   (23.08.2026). Status is "Open". The button says "Create".
4. In "Work Order Name", type `Demo Overlap`.
5. Do not click "Create" yet. Go to section 4.

## 4. The overlap error (0:40)

This uses the sample data: on "Genesis Hardware", "Concentrix Ltd" runs from 18.10.2026 to
22.02.2027.

Do not click "End date": a click opens the calendar and moves the focus into it, so typed keys
do not reach the field. Use the keyboard to get to the field.

1. The focus is in "Work Order Name" (section 3). Push Tab 2 times. The focus is in "End date"
   (Tab 1 goes to "Status", Tab 2 goes to "End date"). Push Cmd+A and type `01.11.2026`. Push
   Tab.
2. Click "Create".
3. Result: the drawer stays open. Under the buttons, the message "These dates overlap another
   order on Genesis Hardware." shows. No bar is added.
4. Click "Work Order Name". Push Tab 2 times. The focus is in "End date". Push Cmd+A and type
   `15.10.2026`. Push Tab.
5. Click "Create".
6. Result: the drawer closes. The new bar "Demo Overlap" shows on "Genesis Hardware", from
   16.08.2026 to 15.10.2026. It touches no other order.

## 5. Edit and delete from the three-dot menu (1:10)

1. Move the pointer over the "Concentrix Ltd" row. The row gets the hover highlight. Hover the
   "Concentrix Ltd" bar. The three-dot button shows at the right end of the bar.
2. Click the three-dot button. The menu shows "Edit" and "Delete".
3. Click "Edit". The drawer opens with the values of the order: name "Concentrix Ltd", end date
   22.02.2027, start date 18.10.2026. The button says "Save".
4. Click "Cancel". The drawer closes and nothing changes.
5. Open "Edit" again (steps 1 to 3). Click the timeline to the left of the drawer, outside the
   panel. The drawer closes and nothing changes.
6. Open "Edit" again (steps 1 to 3). Change the name to `Concentrix Ltd Edited`. Open "Status"
   and select "In progress".
7. Click "Save". The drawer closes. The bar shows the new name and the new status colour.
8. Hover the "Demo Overlap" bar. Click its three-dot button. Click "Delete".
9. Result: the "Demo Overlap" bar is removed.

## 6. Date validation (0:40)

1. Hover the "Concentrix Ltd Edited" bar. Click its three-dot button. Click "Edit".
2. Click "Work Order Name". Push Tab 2 times. The focus is in "End date". Push Cmd+A and type
   `01.10.2026` (before the start date). Click "Save".
3. Result: under "End date", the error "The end date must be after the start date." shows. The
   drawer stays open.
4. Click "Work Order Name". Push Tab 2 times. Push Cmd+A and type `40.13.2026`. Push Tab. The
   focus goes to "Start date".
5. Result: the error "40.13.2026 is not a valid date." shows when the field loses the focus.
6. Push Shift+Tab. The focus is in "End date" again. Push Cmd+A and type `12.2026`. Push Tab.
7. Result: the error "Enter the date as dd.mm.yyyy." shows.
8. Click "Work Order Name". Push Cmd+A and Backspace. Click "Save".
9. Result: the error "Enter a work order name." shows.
10. Push Escape. The drawer closes and nothing is saved.

## 7. Drag to resize a bar and the rail (0:50)

Bar:

1. Move the pointer to the right end of the "Konsulting Inc" bar (the last 8 px). The label
   "Drag to resize" shows over the handle.
2. Push the mouse button and move the pointer about 57 px to the right. Release the button.
3. Result: the end date moves about 2 weeks later than 21.01.2027. The exact day depends on the
   point where you grab the handle. The bar snaps to whole days. Hover the bar to show the new
   date in the tooltip.
4. Drag the same right end far to the right, onto the "Compleks Systems" bar (x 1430). Release
   the button.
5. Result: the bar goes back to its old dates. The alert "These dates overlap another order on
   Konsulting Inc." shows at the bottom for 4 seconds.
6. Optional: start a drag and push Escape before you release. The bar goes back.

Rail:

7. Move the pointer to the right edge of the "Work Center" rail (x 482). The label "Drag to
   resize" shows.
8. Push the mouse button and move the pointer 100 px to the right. Release the button.
9. Result: the rail is wider (480 px, from 380 px). The limits are 240 px and 560 px.

## 8. Today button (0:20)

1. Scroll the timeline far to the right (Shift and the mouse wheel, or the trackpad).
2. Click "Today", next to the timescale chip.
3. Result: the timeline scrolls back with a smooth scroll. The today line is in the centre of
   the timeline area (about x 1010 with the 480 px rail of section 7).

## 9. Keyboard and focus (0:40)

1. Click the page title "Work Orders", so that no control has the focus.
2. Push Tab. The focus is on the timescale chip. Push Tab. The focus is on "Today".
3. Push Tab. The focus is on the first bar, "Concentrix Ltd Edited". A focus ring shows.
4. Push Enter. The menu opens and the focus is on "Edit". Push the Down arrow. The focus is on
   "Delete". Push Escape. The menu closes and the focus goes back to the bar.
5. Push Shift and the Right arrow. The end date moves one day later (22.02.2027 to 23.02.2027).
   Push Shift and the Left arrow to put it back. Alt, Shift and an arrow move the start date.
6. Push Tab 8 times. The focus moves through the other 7 bars, then to the rail edge ("Work center
   column width"). A mouse click does not put the focus on the rail edge.
7. Push the Right arrow: the rail grows 20 px. Push Home: the rail goes to 240 px. Push End: the
   rail goes to 560 px.
8. Say: "The drawer keeps the focus inside while it is open, and gives it back to the bar when
   it closes."

## 10. Infinite scroll and virtualization (0:30)

1. Scroll the timeline to the left edge. New months are added on the left, and the view does not
   jump.
2. Scroll to the right edge. New months are added on the right.
3. Open the DevTools Elements panel and show `.grid__window`. Say: "73 columns in the start
   range, but only about 33 header cells are in the DOM. Bars far from the view are not in the
   DOM. A spacer keeps the full scroll width."
4. Close the DevTools.

## 11. Reload: the data stays (0:20)

1. Push Cmd+R (or F5).
2. Result: "Concentrix Ltd Edited" and the new "Konsulting Inc" end date of section 7 are still
   there. The rail keeps its width.
3. Say: "The orders are saved in localStorage under `wo-timeline.workOrders.v1`, in the document
   structure of the brief. The rail width is saved under `wo-timeline.railWidth.v1`."

## 12. Parity mode (0:20)

1. Open `http://localhost:4200/?parity=1`.
2. Result: the view of the Sketch artboard "Schedule - Default". The current month is September
   2024. The four bars of the design show. There is no "Today" button.
3. Say: "Parity mode is a test hook for the pixel check against the design. It does not read or
   write the storage, so it does not change the normal data."

## 13. Code structure tour (1:40)

Open the files in this order. Say one sentence for each file.

1. `src/app/data/sample-data.ts`: the document types (`docId`, `docType`, `data`) and the sample
   data.
2. `src/app/data/overlap.ts`: the overlap rule. One pure function, unit tested.
3. `src/app/data/schedule.service.ts`: the signal store. Save, remove, the overlap check and
   localStorage.
4. `src/app/timeline/timeline.ts`: the timescales, the columns and the date-to-position mapping.
5. `src/app/app.ts` and `src/app/app.html`: the page shell. It connects the grid, the drawer and
   the resize errors.
6. `src/app/timeline-grid/timeline-grid.ts`: the grid. Cell click, infinite scroll, column
   window, rail resize.
7. `src/app/work-order-bar/work-order-bar.ts`: one bar. Tooltip, three-dot menu, resize handles,
   keyboard.
8. `src/app/work-order-drawer/work-order-drawer.ts`: the drawer. Reactive form, ng-select,
   ngb-datepicker, validation, focus trap.
9. `src/app/timescale-chip/timescale-chip.ts`: the timescale menu.
10. `src/app/parity.ts`: parity mode and the design fixtures.
11. `docs/design/tokens.json` and `src/styles/_tokens.scss`: the design tokens. The SCSS file is
    generated with `npm run tokens`.

## 14. Tests and demo videos (0:40)

1. In the terminal, show the command `npm run test:all`. It runs `ng build`, the Vitest unit
   tests (`tests/unit/`) and the Playwright tests (`tests/e2e/`).
2. Say: "Each Playwright test has the item id of the acceptance criteria in brackets, for example
   `[E1]`. See `docs/requirements/acceptance-criteria.md`."
3. Show `docs/demo/videos/`: one video per requirement test that opens a page. `npm run demo` records
   them. Use `DEMO_HEADLESS=1 npm run demo` to record with no browser window.
4. Open one video, for example `B3-the-timescale-dropdown-offers-hour-day-week-and-month.webm`.
5. Optional: `npm run storybook` shows the stories for the bar statuses, the timescale chip and
   the drawer.

## Reset after the recording

Open the DevTools console on `http://localhost:4200` and type `localStorage.clear()`. Reload. The
sample data shows again.
