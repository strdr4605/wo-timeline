# b16-fix: demo script (J3)

Unit b16-fix fixes `docs/demo-script.md` for the 6 failures in `b15-verify.md`, section
"Failures J3". No app code changed.

## What changed in docs/demo-script.md

1. S4 steps 1 and 4: the script does not click "End date". A click opens the calendar and moves
   the focus into it, so typed keys do not reach the field. The new path: from "Work Order
   Name", push Tab 2 times (Status, then End date), push Cmd+A, type the date, push Tab. Step 4
   first clicks "Work Order Name", because "Create" has the focus after step 2.
2. S6 steps 2, 4, 6, 8: the same path. Step 4 ends on "Start date" (after Tab), so step 6 uses
   Shift+Tab to go back to "End date". Step 8 clears the name with Cmd+A and Backspace.
3. Time budget: the total is now 9:20 (the sum of the rows). The intro says 9 minutes 20
   seconds. The limits are 5 and 10 minutes.
4. S14: "one video per requirement test that opens a page", with no number.
5. Minor numbers:
   - S7 step 3: no exact end date. "About 2 weeks later than 21.01.2027; the exact day depends
     on the grab point". Measured: 05.02.2027 (Feb 5, 2027) with the handle centre.
   - S7 step 9: rail 480 px (from 380 px).
   - S8 step 3: today line "about x 1010" with the 480 px rail. Measured marker centre x 1010.5,
     the same as the centre of the timeline area.
   - S9 step 6: "the other 7 bars, then the rail edge".
   - S10 step 3: "about 33 header cells" (measured 33 with the 560 px rail).
   - S11 step 2: "the new Konsulting Inc end date of section 7", no fixed date.
6. J3 row in `acceptance-criteria.md` and `.json`: new evidence (below). H1 row not changed.

## Walkthrough

Script: `docs/requirements/notes/b16-walk.mjs`. Headless Chromium, 1440 x 1024,
`http://localhost:4200`, `localStorage.clear()` first, 400 ms after each step, keys typed with
80 ms between characters. Script order S0 to S12. It clears the storage at the end.

Result: 46 checks, 0 failures. The checks that matter for J3:

| Step | Check | Result |
|---|---|---|
| S3.3 | start 16.08.2026, end 23.08.2026 | OK |
| S4.1 | focus in `#drawer-end` after 2 Tab from name; value 01.11.2026 | OK |
| S4.3 | drawer open, "These dates overlap another order on Genesis Hardware.", no bar | OK |
| S4.4-6 | name click, 2 Tab, 15.10.2026, Create: drawer closes, "Demo Overlap" bar shows | OK |
| S6.2-3 | 01.10.2026, Save: "The end date must be after the start date.", drawer open | OK |
| S6.4-5 | 40.13.2026, Tab: focus in start date, "40.13.2026 is not a valid date." | OK |
| S6.6-7 | Shift+Tab to end date, 12.2026, Tab: "Enter the date as dd.mm.yyyy." | OK |
| S6.9-10 | empty name, Save: "Enter a work order name."; Escape closes, nothing saved | OK |
| S7 | bar +57 px: end Feb 5, 2027; drag to x 1430: overlap alert, bar reverts | OK |
| S7 rail | drag x 482 -> 582: 380 -> 480 px | OK |
| S9 | Tab order chip, Today, Concentrix Ltd Edited; menu keys; 8 Tab = 7 bars + rail edge; rail keys 500, 240, 560 | OK |
| S10-12 | scroll grows (8997 -> 15837 px), reload keeps data and rail 560, parity shows 4 bars and no Today button | OK |

S1, S13, S14 are terminal and editor steps. They were not walked in the browser.

## Verify tools

- Pixel check `Schedule - Default` with the handover bar masks: 0.2% before, 0.2% after.
- `node docs/requirements/verify.mjs`: playwright exit 0, vitest exit 0, 72 pass, 3 pending.
  It warns about `[P9]` (unknown id), which is not from this unit.
- `npm run build`: clean. `npx vitest run`: 31 passed. `npx playwright test`: 87 passed.
- No e2e spec added: J3 is a manual item (a document). The walkthrough script is the evidence.
