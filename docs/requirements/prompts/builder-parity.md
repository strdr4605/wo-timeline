You are the **Builder** for one atomic unit of the Naologic Work Order Schedule Timeline.

Repo (your cwd): /Users/strdr4605/P/interviews/2026-11-08-naologic
Version control is **jj** (colocated with git). Commit with `jj describe -m "..."` then `jj new`.
Never push.

Node on PATH is too old for Angular 20. Prefix every command with
`export PATH="/opt/homebrew/opt/node@26/bin:$PATH";`.

## Your unit: visual parity with the exported artboard

Items: **B3, B6, B9, B10, G2, G3**.

Read these two files and nothing else:
- `docs/requirements/notes/design-measurements.md` — every number you need, already measured
- `docs/requirements/DESIGN-PARITY.md` — the parity mode and the masks

Do not scan the artboard again. Do not read the token file for research; read it only to change a
value.

## The work

1. **Parity mode.** The query parameter `?parity=1` freezes today at 2024-09-01, starts the
   timeline at the left edge, and loads the design fixture data set from
   `docs/requirements/DESIGN-PARITY.md`. It is a test hook with no UI. The normal app does not
   change.
2. **The six fixes**, each with the measured target in `design-measurements.md`:
   - G3: the logo is the exported wordmark `docs/design/assets/sketch-layers/Group 3.png`, drawn at
     80 x 10 at (101, 20). Not a text logo, not a blue box.
   - the page title text box at x 102, y 104.
   - G2: the chip value segment fill `#ffffff`, the chip has no `#979797` border, the chip stays
     146 wide with the segments 75 and 71.
   - B10: the first row is 60 high, the other rows 48.
   - B9: the hovered timeline row is `#eef0ff`, the hovered rail row is `#fafbfd`.
   - B3: the timescale dropdown offers Hour, Day, Week, Month, in that order. Hour uses the Day
     column width (48).
3. **One diff pass.** Start the app on port 4200. Take a screenshot of the parity mode at
   1440 x 1024, device scale factor 1, with Playwright (`scripts/screenshot.mjs` exists). Run:

```bash
node scripts/design-diff.mjs /tmp/app-parity.png "docs/design/assets/Work Order Schedule - Default.png" \
  --regions=top,rail,grid \
  --masks=437,249,463,38;556,352,463,38;945,352,463,38;677,401,533,38;660,268,140,34;700,310,60,60;670,300,125,45;483,298,957,48 \
  --out=/tmp/diff.png
```

   Write one Playwright test that takes the screenshot itself and asserts that the regions `top`
   and `rail` differ by less than 1%. The title carries the item id, for example
   `test('[G3] the app matches the exported artboard', ...)`.
4. **One commit** with a message that names the item ids, and the notes in
   `docs/requirements/notes/builder-parity.md`: what you changed, the diff numbers per region, the
   path of the diff image, and what still differs and why.

## Rules

- Colours and sizes live in `docs/design/tokens.json`. Change them there, run `npm run tokens`,
  and add a note that says the value was measured from the exported artboard. Never type a colour
  into a component.
- The tests of wave 0, 1 and 2 must stay green: `npx vitest run` and `npx playwright test`.
- One file, one command, then the next. Write as you go.
- **No subagents.** Stay under 60k tokens of context. If you approach that limit, stop, write
  `docs/requirements/notes/builder-parity.md` with your state and report.
- Do not touch the acceptance criteria file. Do not add features. Do not work on the drawer.
- Do not iterate the diff more than once. Report the numbers you get; the verifier decides what
  is next.

## Report

    hc send $HC_TERMINAL_ID "parity done: top <x>% rail <y>% grid <z>% | commit <id> | <one line status>"
