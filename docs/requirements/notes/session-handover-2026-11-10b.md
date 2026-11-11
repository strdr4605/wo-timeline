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
| upkppvkt | b8-headless | I4 | `npm run test:all`, `reuseExistingServer: true` |
| klklvwtm | b9-demo | J1 J2 | `playwright.demo.config.ts`, `npm run demo`, `DEMO_HEADLESS=1` |
| vrsqoyqk | b10-dates | E1 (bug fix) | impossible dates rejected, date errors on blur |
| lnpyvlwl | b11-rail | I10 (new id) | rail resize by drag and keys, saved width |
| kpqvonnq | b12-infinite | I1 | logical offsets, extend at both edges, bar layer clipped to the columns |
| uspnxumk | b13-virtual | I9 (new id) | signal windowing of columns and bars, spacer |
| qppunust | b14-storybook | I11 (new id) | Storybook, stories for bar statuses, chip, drawer |
| oqpyloym | b15-readme | H1 | `README.md` |
| ptnurkzy | b16-script | J3 | `docs/demo-script.md`, 9:40, walk script `notes/b16-walk.mjs` |
| wmnkywwm | b17-comments | H5 | comments on date maths, static check `tests/e2e/comments.spec.ts` |
| vktzkmrt | b18-datepicker | D12 (bug fix) | click keeps focus in the date input, typed date selects the calendar day, errors only after blur |

`node docs/requirements/verify.mjs`: 73 pass, 2 pending, 0 fail. Playwright: 88 passed. Vitest: 31.
The 2 pending items are H2 (Loom, human) and H3 (public repo, blocked).

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
> Never run headed Chrome: windows flash on the human screen. For npm run demo use
> DEMO_HEADLESS=1 npm run demo.

## Remaining items

The bonus wave and the deliverables H1 and J3 are done. These items stay:

1. H3, public repository with a clean commit history. Blocked overnight: it needs a push and a
   public repo, and the overnight rules forbid a push. The human must decide the repo name and
   the history cut (for example, squash the unit commits or keep them).
2. H2, the Loom. The human records it with `docs/demo-script.md`.

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

- No headed Chrome in unattended runs. `playwright.demo.config.ts` reads `DEMO_HEADLESS=1`.
  The default stays headed (J1). Give this rule to every builder and verifier.
- The static tests [I4] [I6] [J1] [J2] open no page, so the demo has no video for them
  (71 demo tests, 67 videos). This is accepted.
- Dates: `parseDottedDate` returns null for an impossible date. A date field shows its error on
  blur. The name field keeps the submit rule.
- Rail width (I10) in parity mode: it starts at 380, a drag changes it for the page only, and
  nothing is saved. This is the same rule as work orders in parity mode (F5).

## Context control

- The lead context grows by about 20k tokens for each item. Keep it under 150k.
- At the limit, update this handover and commit it. Then send `hc send t4f "ready-to-compact"`.
  t4f runs /compact for the lead. Then continue from this handover.

- Storybook (I11): `@angular/platform-browser-dynamic` 20.3.35 is 9 days old. It must match the
  installed `@angular/core` 20.3.35, so the two-week rule does not apply to it.
- I1: the bar layer is clipped to the column extent, so bars past the range do not make the scroll
  area wider. The edge test uses the column extent, not `scrollWidth`.

## a11y.spec race fix

The step "axe: no serious or critical violation in the drawer of an Open order" pressed Enter
two times with no wait. The second Enter came before the menu had the focus, so the drawer did
not open. The fix waits for the Edit menu item to have the focus before the second Enter, as
the other steps do. The fix is in the b3-a11y commit (moved there with `jj squash`). Use the
same pattern in new keyboard tests.

## Open notes

- H3 is blocked (see "Remaining items").
- I9: bars far from the view are not in the DOM, so Tab does not reach them. Accepted cost of
  virtualization.
- The b15 verifier saw one flake of a B3 test under load in `npm run test:all`. It passed on rerun.

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
