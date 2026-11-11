# Unit b18-verify2: verifier notes for b18-fix

Verifier, 2026-11-11. Lead: t38. Row D12. Change: jj working copy (7 files, +453 -8), after
b18-fix. ng-bootstrap 19.0.1, Node 26 (`/opt/homebrew/opt/node@26/bin`). Headless Chromium only.

Walk scripts (scratchpad, not in the repo):

- `walk.mjs`: the b18-verify script, unchanged. 2 modes x 2 flows x 2 fields. 350 ms between
  steps, one `keyboard.press` per character, mouse down/up with 80 ms.
- `extra.mjs`: new. Switch Start -> End, submit, live errors, mouse pick -> partial -> blur,
  Enter on a day. Same timing.

## Regressions

- build pass - `npm run build` exit 0, no warning, no error - Node 26
- vitest pass - `npx vitest run`: 5 files, 31 passed
- playwright pass - `npx playwright test`: 91 passed (20.7 s), includes the 3 D12 tests

## Pixels (no style change in the unit)

- Default pass - 0.2% with the 5 masks `437,249,463,38;556,352,463,38;945,352,463,38;677,401,533,38;715,330,25,25`
- With Selection pass - 0.3%
- Placeholder and Defaults pass - 0.3%
- Active Text Field pass - 0.32%
- Status Dropdown pass - 0.29%

Steps from `u4-fix.md`. Same values as the builder before/after table.

## Behaviour, spec 1: a click opens the calendar, the focus stays in the input

Runs: parity/Create, parity/Edit, normal/Create, normal/Edit, for End date and Start date.

- click-open-focus pass - 8/8: calendar open, focus in the input 700 ms after the click - walk.mjs
- mouse pick pass - 8/8: a click on March 17, 2027 closes the calendar, writes `17.03.2027`,
  focus back in the input, no error - walk.mjs
- toggle pass - parity and normal: click 1 opens, click 2 closes, click 3 opens, focus in input -
  walk.mjs
- switch Start -> End pass - 4/4 (2 modes x Create/Edit): Start open, click End, wait 700 ms:
  1 calendar, focus in End. Cmd+A and `05.05.2025` key by key: End `05.05.2025`, month
  `May 2025`, selected `Monday, May 5, 2025`, Start unchanged (for example `01.09.2024`), no
  error. b18-verify failure 1 is fixed - extra.mjs
- Escape after switch pass - 4/4: Escape 1 closes the End calendar, drawer open, focus in End;
  Escape 2 closes the drawer - extra.mjs
- switch End -> Start pass - parity and normal: 1 calendar, focus in Start - walk.mjs

## Behaviour, spec 2: typing selects the date in the open calendar

- typed-date-selects pass - 8/8: `07.03.2027` key by key gives value `07.03.2027`, month
  `March 2027`, selected `Sunday, March 7, 2027`, focus in input, no error - walk.mjs
- partial-no-change pass - 8/8: the 9 partial states (`0` ... `07.03.202`) keep the start month
  and the selected day, no error, focus in input - walk.mjs
- invalid-no-change pass - 8/8: `31.02.2027` leaves the calendar on the last valid date
  (`March 9999`, from the script's own `07.03.9999` step), no error before blur. The script
  reports FAIL because it expects March 2027. Script artefact, known from b18-verify - walk.mjs
- E1 blur, fresh field pass - 8/8: `31.02` shows no error while focused, the error after blur -
  walk.mjs
- mouse pick -> partial -> blur pass - 8/8 (2 modes x Create/Edit x Start/End): after the pick,
  Cmd+A and `1.1` key by key: 0 errors at each key, focus in the field. Tab:
  `Enter the date as dd.mm.yyyy.`. b18-verify failure 2 is fixed - extra.mjs. Also 8/8 in
  walk.mjs (step 5: pick, `31.02`, error 0 before blur, 1 after).
- Create/Save blocked pass - 4/4: Start `31.02`, Create (or Save): drawer stays open, error
  `Enter the date as dd.mm.yyyy.`, bar count unchanged (4 -> 4 parity, 8 -> 8 normal) - extra.mjs
- live errors after submit pass - 4/4 (accepted lead decision): after the blocked submit, click
  Start, Cmd+A, `10.09.2024` key by key: error count per key `1111111110` while focused;
  Backspace shows the error again at once - extra.mjs

## Behaviour, spec 3: keyboard

- D10 Tab order pass - calendar closed: name > status > end > start > Cancel > primary > name
  (wraps, I5 trap), parity and normal - walk.mjs
- Tab into calendar pass - after a click on End: Tab > Previous month > Next month > focused day;
  ArrowRight and ArrowDown move the day; 4 more Tabs stay inside the popup - walk.mjs
- Enter on a day pass - parity and normal: Tab x3 to the day, ArrowRight, Enter: calendar closed,
  value set (`31.10.2024`, `23.02.2027`), focus in End - extra.mjs. The walk.mjs
  `enter-selects-day` FAIL is a script artefact: after the 4 trap Tabs the focus is on
  `Previous month`, so Enter moves the month.
- Escape order pass - Escape 1 closes the calendar, drawer open, focus in the field; Escape 2
  closes the drawer, parity and normal - walk.mjs, extra.mjs
- console pass - no page errors in all runs

## Code

- no racing timers pass - the diff of `src/` has no `setTimeout`, `setInterval`,
  `requestAnimationFrame`, debounce or delay. The word `setTimeout` is only in a comment.
  `closeOtherCalendars()` closes the other picker synchronously, with the public `restoreFocus`
  input set to the clicked field, then puts the old value back.
- ng-bootstrap API pass with note - `toggle()`, `close()`, `isOpen()`, `navigateTo()`,
  `restoreFocus`, `NgbDatepicker.writeValue()` are public. `_cRef` is private (documented,
  covered by the D12 e2e). The one-shot `focus` override is consumed by ng-bootstrap's own
  `open()` timer; Tab and arrows in the calendar still move the focus.
- `editedDate` signal pass - set on `(focus)` and `(input)`, cleared on `(blur)`. `dateError()`
  hides the error of the focused field only before the first submit. The comment on
  `dateError()` states the after-submit rule.
- tokens, dead code, order pass - no style change, no literals, private helper
  `closeOtherCalendars()` below the public methods, `calendarOf()` at the bottom; only drawer
  files, the D12 row, the new spec and the notes changed
- D12 e2e pass - 3 tests: focus and typing, switch Start -> End, pick -> partial -> blur ->
  Create blocked

## Failures
