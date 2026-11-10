# Session handover, 2026-11-10

Read this first in the next session. It replaces the handover of 2026-11-08.

## Process

- The lead (main session) writes no feature code. It runs herdr-core (`hc`) children:
  `hc run --bg --name <unit> --cwd <repo> claude --permission-mode auto "<task>"`.
- One builder per unit, then a fresh verifier. A failed verify gets a fix builder, then a second
  verifier. The lead commits after the verifier passes (jj, `jj commit -m`, never push).
- Contracts: `docs/requirements/prompts/claude-builder.md` and `claude-verifier.md`.
- Notes per unit: `docs/requirements/notes/<unit>.md` and `<unit>-verify.md`.
- Dev server: hc terminal `devserver`. It needs Node 26:
  `export PATH=/opt/homebrew/opt/node@26/bin:$PATH; npm start`. The default `node` is v16.

## Tools

- `scripts/pixel-check.mjs --artboard="<name>" [--steps=...] [--mask=...] [--zoom=...]`:
  diff against the exported artboard, worst Sketch layers first, images in `.pixel-check/`.
- `?parity=1` freezes today at 2024-09-01, shows Aug 2024 first, loads the design fixture.
  `&fixture=hover` adds the two bars of the hover and menu artboards.
- `docs/design/extract.mjs` now writes the shadow `spread`. Most Sketch shadows have a negative
  spread. Use it as the 4th `box-shadow` length.

## Done (committed, verified)

| Commit | Items | Mismatch |
|---|---|---|
| tooling | pixel-check, spread fix, contracts | - |
| u1-top | G2 G3 B3 | 0.02% above y 204 |
| u2-grid | B1 B5 B6 B7 B9 B10 B11 | 0.09% |
| u3-bars | C1-C8 | 0.26-0.31% |
| u4-drawer | D1-D13 D15 | 0.29-0.32% |
| u5-actions | D14 E1-E6 | no regression |

Must items: 45 pass, 10 pending, 1 fail (`node docs/requirements/verify.mjs`).

## Decisions taken in this session

- Commits: auto-commit per verified unit (human approved).
- Timescale options: Hour, Day, Week, Month. Hour uses the Day column width.
- Open status uses the design cyan (`#f2feff`, `#cefbff`, `#e4fdff`, `#00b0bf`).
- Current-period chip: Month "Current month", Week "Current week", Day and Hour "Today".
- Bar-end handle zone stays 8px. The "Timeline - Hover Options" artboard is an older mock with
  no three-dot button; a wider zone would block the menu click (P11, design conflict).
- Drawer: End Date above Start Date, as the design. Dates in DD.MM.YYYY.
- Drawer chevron `#687196` (the artboards are inconsistent).
- `angular.json` `cli.analytics: false` is intended.

## Lead playbook (for the lead after compaction)

### Who and how

- The human owns the repo. Answers: telegraph style, at most 60 words, tables count.
- The human asked: push all work to herdr children to keep the lead context small. The lead
  builds tools and commits; it does not write features. Small nits (1 to 3 lines) the lead may
  fix itself.
- Escalate a real product decision to the human with a recommendation. Take design-vs-design
  calls yourself and record them (see "Decisions").
- The lead is hc terminal `t38`. Children die with it. Pass `$HC_TERMINAL_ID` as the lead
  address in every prompt.
- History: on 2026-11-08 a pi session (`01a1bc8f-ba71-77d1-853b-0c85c4437d71`, MiniMax M3.1
  Flash) ran waves 0 to 2. It failed at pixel parity: `measure.mjs` checks DOM CSS values, not
  pixels, and builders burned context on pixel scans. This session switched to Claude children
  and `pixel-check.mjs`.

### Launch templates

Builder:

```bash
cd /Users/strdr4605/P/interviews/2026-11-08-naologic && hc run --bg --name <unit> --cwd "$PWD" \
  claude --permission-mode auto "Read docs/requirements/prompts/claude-builder.md and follow it. \
Lead address: $HC_TERMINAL_ID. Unit name: <unit>. <what is done, do not touch>. \
Your unit: <scope, artboards, item ids, decisions>." | tail -1
```

Verifier: the same, with `claude-verifier.md`, the unit scope, the item ids, and "Builder notes:
docs/requirements/notes/<unit>.md (do not trust, check)".

Fix builder: "Fix the failures in docs/requirements/notes/<unit>-verify.md section 'Failures',
with these lead decisions: ...". Then a second verifier named `<unit>-verify2`, which rechecks
every earlier failure.

### Loop

1. Launch. 2. `hc wait <name> --timeout 590` (Bash timeout 600000). 3. The report arrives as a
message `<hc from="tXX name">...`. 4. `hc kill <name>; hc rm <name>`. 5. Read only the
`## Failures` section of the verify notes (`sed -n '/## Failures/,$p'`). 6. Commit with
`jj commit -m "<unit>: <summary> (<ids>)" ` plus the Co-Authored-By line.

### Pitfalls seen

- `hc wait --children any` returns at once on a late or duplicate message from a child that
  is already gone. Wait on the named child instead.
- A Bash call that the human rejects may still have started the hc child. Check `hc ls` before
  you launch again (`name_taken` error).
- Verifiers sometimes send a corrected count in a second message. Read the notes file.
- After a new npm dependency, restart the dev server: `kill $(lsof -ti :4200)`, `hc rm
  devserver`, then `hc run --bg --name devserver --cwd "$PWD" "export
  PATH=/opt/homebrew/opt/node@26/bin:\$PATH; npm start"`. If Angular asks about analytics,
  `hc keys devserver n enter`. Confirm with `curl -s -o /dev/null -w '%{http_code}' localhost:4200`.
- `jj log -T` templates need plain quotes, not `\"` inside single quotes.
- Children ask questions with `hc send` while they work. Answer with `hc send <name> "..."`, then
  wait again.

### Pixel-check states used

| Artboard | Steps | Masks |
|---|---|---|
| Schedule - Default | none, or `hover@727,322;wait@300` (placeholder box at x 675) | bars `437,249,463,38;556,352,463,38;945,352,463,38;677,401,533,38`, cursor `715,330,25,25` |
| View Selection | `click@200,167;wait@300` | - |
| Options CTA, Edit and Delete Expanded | from the Cursor layer; use `&fixture=hover` | cursor |
| Create New Event - 4 states | see `docs/requirements/notes/u4-fix.md` | cursor |

Mismatch numbers to keep: no unit may go above its committed value in the table above.

### Files worth knowing

- `src/app/parity.ts`: parity mode and fixtures.
- `src/app/data/overlap.ts`, `schedule.service.ts`: overlap function and the signal store.
- `src/app/timeline-grid/`, `work-order-bar/`, `timescale-chip/`, drawer component (see
  `docs/requirements/notes/u4-drawer.md` for its path).
- `docs/design/tokens.json` then `npm run tokens` then `src/styles/_tokens.scss` (generated).
- `docs/requirements/acceptance-criteria.json`, refreshed by `node docs/requirements/verify.mjs`
  (needs Node 26 on PATH and the dev server).

## Next

1. Small unit: tests titled with A2, A3, A4; fix the `measure.mjs` selector for G4 (`.drawer`);
   check I7 (responsive), I8 (Day and Week derived from Month), H5 (comments on date maths).
2. Bonus wave, needs human approval: localStorage, Today button, keyboard, a11y, OnPush, AI
   prompt log, then Storybook, then infinite scroll.
3. Deliverables: README (H1), demo script (J3), Playwright demo videos, public repo cut (H3).
   The human records the Loom (H2).
