# Session handover, 2026-11-10 (b)

Read `session-handover-2026-11-10.md` first: process, tools, launch templates, the loop, the
pitfalls and the pixel-check states. This file adds the bonus wave state. It is for the lead of
the next session.

## Overnight rules

- The next session runs overnight. The human is not there.
- Ask no questions. Do not use AskUserQuestion.
- When an item is blocked, skip it. Write the blocker in "Open notes" of a new handover, then go
  to the next item.
- Never push. Commit only with `jj commit`, one commit for each verified item.
- Keep the lead context under 150k tokens. Before that limit, stop. Then write a new handover
  (`session-handover-<date>.md`) and commit it.

## Done in this session (committed, verified)

| Change | Commit | Items | Notes |
|---|---|---|---|
| msusnqzo | u6-small | A2 A3 A4 G4 I7 I8 H5 | `notes/u6-small*.md` |
| wrpruowm | b1-storage | F5 | localStorage, off in parity mode |
| omyuutpo | b2-today | I2 | Today button, hidden in parity mode |
| uwmxptsm | b3-a11y | I5 | aria, keyboard, focus trap, axe, focus-ring tokens |
| utrvxlns | b4-resize | C9 (new id) | drag to resize, "Drag to resize" label, keyboard resize |
| mquzoqqr | b5-prompts | H4 H6 | `docs/ai-prompts.md` |
| nuvyutkx | b6-onpush | I6 | OnPush, stable track, static check |
| lsqwlqmo | b7-motion | I3 | transitions under 300 ms, reduced motion, motion tokens |

`node docs/requirements/verify.mjs`: 59 pass, 13 pending, 0 fail. Playwright: 65 passed.

Pixel values to keep (with the masks of the first handover): Default 0.2%, Default hover 0.11%,
View Selection 0.43%, Options CTA 0.31%, Edit and Delete Expanded 0.26%, drawer states
0.29-0.32%.

## Flow: one item for each agent

The human asked for this flow:

1. Start a fresh hc builder for one item only. Give it the builder contract, the rules below and
   the item scope with all lead decisions.
2. The builder implements first. Then it checks the result with the verify tools
   (`scripts/pixel-check.mjs`, `node docs/requirements/verify.mjs`, Playwright by hand). Only
   after that does it write the e2e spec, one test for each item id, with the id in brackets.
3. Start a fresh verifier (`claude-verifier.md`). On failures: fix small nits (1 to 3 lines)
   yourself, or start a fix builder and then a `<unit>-verify2`.
4. Commit the item together with its e2e spec. Add a "Lead fixes" section to the verify notes
   when you changed something.

## Bonus rules (paste into every builder prompt)

The lead kept this text in a scratchpad file. It is lost now, so copy it from here:

> Context: the Naologic timeline is done and verified for all must items (u1-u6 committed; see
> docs/requirements/notes/session-handover-2026-11-10.md, sections Decisions and Pixel-check
> states used). This is the bonus wave, one item per agent. Do not change other behaviour.
> Pixels must not change: before and after your change, run node scripts/pixel-check.mjs
> --artboard="Schedule - Default" with the bar masks from the handover; the mismatch must not go
> up. Parity mode (?parity=1) must keep working exactly as now: anything that would change
> parity screenshots (stored data, scroll position, new buttons) must be off or invisible in
> parity mode unless the design shows it. Order of work: 1) implement, 2) confirm the behaviour
> by hand with Playwright and the verify tools (pixel-check.mjs, node
> docs/requirements/verify.mjs with export PATH=/opt/homebrew/opt/node@26/bin:$PATH), 3) only
> then write the e2e spec(s), one test per item id with the id in brackets, 4) run npm run
> build, npx vitest run, npx playwright test, all green. Update the item row in
> docs/requirements/acceptance-criteria.md / .json with evidence when verify.mjs does not do it.

## Remaining bonus items, in this order

1. H4 and H6: AI prompt log. The brief asks for it (l.7, l.350, l.403, l.475). Collect the
   prompts that already exist (`docs/requirements/prompts/`, the unit notes, the two handovers,
   the pi session of 2026-11-08) in one Markdown index, for example `docs/ai-prompts.md`. Show
   the key decisions and why. A document item: no e2e. The verifier checks the links and that
   the facts match the commits.
2. I6: OnPush on every component and stable `track` expressions (by id, not `$index`) on the
   timeline lists. Evidence: one test titled `[I6]` that fails when a component has no OnPush (a
   static source check is fine). Risks: C9 live preview, the resize error timer, ng-select and
   ngb-datepicker. The first b5-onpush builder was stopped after it started; its partial change
   was discarded. Start again from zero.
3. I3: smooth animations (drawer slide in and out, bar hover transitions). Respect
   `prefers-reduced-motion`. pixel-check waits 400 ms after the steps, so a transition must end
   before that.
4. I4: the automated suite runs headless and passes. This is probably already true (vitest and
   Playwright are headless). Check it, and add an npm script `test:all` if there is none.
5. J1 and J2: a second Playwright config that records one video for each requirement test
   (headed Chrome, slow motion, files under `docs/demo/videos/`), and `npm run demo`. The fast
   config must not change.
6. I10 (new item, from the human, 2026-11-11): rail resize. The rail edge (right side of
   `grid__rail`) is the drag handle. Hover shows the 3px blue line and the "Drag to resize"
   label of "Timeline - Hover Options" (489,531). Pointer drag with min and max width, Escape
   cancels, `role="separator"` with arrow keys. The width is saved through the F5 storage path.
   Parity mode keeps 380 and saves nothing. Evidence: an e2e test titled `[I10]`. Unit b11-rail,
   notes `notes/b11-rail.md`.
7. Two units, in this order (plan change from the human, 2026-11-10). Same flow for each.
   a. I1: infinite horizontal scroll. More columns load when the user scrolls near an edge.
      Store the range as logical column offsets from today (`firstOffset..lastOffset`), not as
      an array of columns. Build columns with `columnFor(timescale, today, offset)`. Keep the
      scroll position when columns are added on the left. Parity mode keeps the fixed range.
   b. I9 (new item): virtualization. Add I9 to `acceptance-criteria.md` (bonus, e2e, source:
      brief l.439 "Consider virtual scrolling for performance with large ranges").
      - Custom windowing with signals. Do not use CDK virtual scroll: the bars are absolute and
        go across many rows.
      - Keep a scroll signal. Compute the visible column window plus a buffer of about one
        viewport on each side.
      - Render only the header cells and the grid columns in the window, moved with
        `translateX`. A spacer (logical column count x column width) keeps the scrollbar
        correct.
      - Render only the bars that overlap the window (a date test). Their left position stays
        relative to the logical origin.
      - Always render the focused bar, the bar in a drag and the bar of the open drawer. I5
        focus and C9 drag must not break.
      - The today line and the hover placeholder stay on logical positions.
      - Parity mode: fixed range, windowing off, pixel values do not change.
      - Evidence: an e2e test titled `[I9]`. Scroll about 2 years in Day view. The column DOM
        count stays at or below a bound. Far bars are not in the DOM. The scroll position stays
        the same on prepend. The focus stays after a scroll. A drag across the window edge
        works. Then run the full suite again (a11y, resize and today touch this code).
8. Storybook. It has no item id. Give it a new id in `acceptance-criteria.md` (bonus). Stories
   for the bar (each status), the timescale chip and the drawer. Storybook must not change the
   app build.

After the bonus wave come the deliverables (first handover, "Next" step 3): README (H1), demo
script (J3) and the public repo cut (H3). The human records the Loom (H2).

## Decisions taken in this session

- Today button: in the top bar, right of the Timescale dropdown, styled from the chip tokens,
  hidden in parity mode. The design has no Today button.
- Axe: the design text colours that are under 4.5:1 are kept for pixel parity. They are
  excluded from the `color-contrast` rule only: the chip label, the Complete badge and pill, and
  the Open badge and pill (`DESIGN_CONTRAST_NODES` in `tests/e2e/a11y.spec.ts`).
- Focus ring: tokens `layout.focusRing.width` 1 and `layout.focusRing.offset` -1, used by every
  `:focus-visible` outline.
- Resize (C9): the handle zone stays 8px. Every timescale snaps to whole days, Hour too, because
  orders store `yyyy-mm-dd`. A bad range or an overlap reverts the drag and shows a message.
  Keys: Shift+Arrow moves the end, Alt+Shift+Arrow moves the start. The progress, "Intrusion"
  and "Plastic chairs" text of the Hover Options mock is out of scope (not in the data model).
- A timer value (`RESIZE_ERROR_MS` in `app.ts`) is behaviour, not a design token. Do not put
  timers in `tokens.json`.

## a11y.spec race fix

The step "axe: no serious or critical violation in the drawer of an Open order" pressed Enter
two times with no wait. The second Enter came before the menu had the focus, so the drawer did
not open. The fix waits for the Edit menu item to have the focus before the second Enter, as
the other steps do. The fix is in the b3-a11y commit (moved there with `jj squash`). Use the
same pattern in new keyboard tests.

## Open notes

- `verify.mjs` prints `unknown item id in test title: P9`. A test title uses `[P9]` (a design
  conflict id, not an item id). Change the title or teach `verify.mjs` the P ids. Small.
- At 375px the page keeps the 101px left gutter. The drawer subtitle wraps to 2 lines. The brief
  accepts this (I7 pass).
- The "Timeline - Hover Options" artboard is an older mock. Do not use it for a full-artboard
  pixel diff; compare the label boxes only.
- The only live hc child of the lead is `devserver` (Angular on :4200, Node 26). The lead
  terminal was `t38`. A new session has a new id; use `$HC_TERMINAL_ID`. `devserver` ends with
  `t38`. When `curl -s -o /dev/null -w '%{http_code}' localhost:4200` is not 200, start it again
  (see "Pitfalls seen" in the first handover).
