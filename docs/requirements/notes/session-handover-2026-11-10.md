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

## Next

1. Small unit: tests titled with A2, A3, A4; fix the `measure.mjs` selector for G4 (`.drawer`);
   check I7 (responsive), I8 (Day and Week derived from Month), H5 (comments on date maths).
2. Bonus wave, needs human approval: localStorage, Today button, keyboard, a11y, OnPush, AI
   prompt log, then Storybook, then infinite scroll.
3. Deliverables: README (H1), demo script (J3), Playwright demo videos, public repo cut (H3).
   The human records the Loom (H2).
