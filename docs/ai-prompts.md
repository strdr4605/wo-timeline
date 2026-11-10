# AI prompt log

This file is the index of the AI prompts that were used to build the Work Order Schedule
Timeline. The brief asks for it (`FE-technical-test-10-2026.md` l.7, l.350, l.403, l.475).

Every fact in this file comes from a file in this repo or from the jj log. Each section names
its source.

## History

| Date | Agent | Work | Result |
|---|---|---|---|
| 2026-11-08 | pi session `01a1bc8f-ba71-77d1-853b-0c85c4437d71`, MiniMax M3.1 Flash | waves 0, 1 and 2 | Waves 0 and 1 verified. Wave 2 not verified. Failed at pixel parity. |
| 2026-11-10 | Claude Opus lead (main session) with herdr-core (`hc`) children | units u1 to u6, bonus b1 to b4 | Every must item done and verified. 59 pass, 13 pending, 0 fail. |

Sources: [session-handover-2026-11-08.md](requirements/notes/session-handover-2026-11-08.md),
[session-handover-2026-11-10.md](requirements/notes/session-handover-2026-11-10.md) (section
"Who and how"), [session-handover-2026-11-10b.md](requirements/notes/session-handover-2026-11-10b.md).

## 1. How the work was delegated

### 2026-11-08: pi waves

- One builder agent got one wave. The wave prompt lists the items, the files to read first and
  the contract. Prompt template: [AGENT-PROMPTS.md](requirements/AGENT-PROMPTS.md).
- One verifier agent checked the wave. It reads only and writes no product code.
- A fix builder repaired the verifier failures of wave 1 (`builder-wave1-fix.md`).
- The Herdr layout of the agents: [HERDR-RUNBOOK.md](requirements/HERDR-RUNBOOK.md).
- The locked plan decisions that every prompt points to:
  [2026-11-08-grill-session.md](decisions/2026-11-08-grill-session.md).

At the end of the day, the process rule changed: one atomic unit per builder (about 50k tokens of
context), never a whole wave, and a fresh verifier after every builder.

### 2026-11-10: Claude lead and children

The lead writes no feature code. It starts herdr-core children with
`hc run --bg --name <unit> --cwd <repo> claude --permission-mode auto "<task>"`.

| Role | Contract | Task | Output |
|---|---|---|---|
| Lead | the handovers | Starts the children, answers their questions, takes design-vs-design calls, commits with `jj commit` after a verifier pass. Fixes small nits (1 to 3 lines). | commits, handovers |
| Builder | [claude-builder.md](requirements/prompts/claude-builder.md) | Builds one unit. Runs the pixel loop. Adds one Playwright test per item id. Does not commit. | `notes/<unit>.md` |
| Verifier | [claude-verifier.md](requirements/prompts/claude-verifier.md) | A fresh child. Does not trust the builder notes. Checks pixels, behaviour, regressions and code. Writes no feature code. | `notes/<unit>-verify.md` |
| Fix builder | claude-builder.md | Fixes the "Failures" section of the verify notes, with the lead decisions. | `notes/<unit>-fix.md` |
| Verify2 | claude-verifier.md | A second fresh verifier. Rechecks every earlier failure. | `notes/<unit>2-verify.md` or `<unit>-verify2.md` |

The task prompt of each child is the contract plus one message: the lead address, the unit name,
what is done, and the unit scope with the item ids and the lead decisions. The launch templates
are in [session-handover-2026-11-10.md](requirements/notes/session-handover-2026-11-10.md),
section "Launch templates". The notes file of each unit repeats its scope.

For the bonus wave, the human asked for one item per agent. The builder implements first, then
checks the result with the verify tools, and only then writes the e2e spec. The text that the
lead pastes into every bonus builder prompt is in
[session-handover-2026-11-10b.md](requirements/notes/session-handover-2026-11-10b.md), section
"Bonus rules".

## 2. Units, prompts, notes and commits

Commit is the jj change id (`jj log`).

### 2026-11-08 (pi)

| Unit | Prompt / contract | Notes | Commit | Item ids |
|---|---|---|---|---|
| wave0 | [builder-wave0.md](requirements/prompts/builder-wave0.md) | [builder-wave0.md](requirements/notes/builder-wave0.md) | nusoqzkq | A1 A5 G1 G5 |
| wave1 | [builder-wave1.md](requirements/prompts/builder-wave1.md) | [builder-wave1.md](requirements/notes/builder-wave1.md) | vwyyttwz | B1-B11 |
| wave 0+1 verify | [verifier.md](requirements/prompts/verifier.md) | [verifier.md](requirements/notes/verifier.md) | no own commit | A1 A5 G1 G2 G5 B1-B11 |
| wave1 fix | builder contract in AGENT-PROMPTS.md | [builder-wave1-fix.md](requirements/notes/builder-wave1-fix.md) | pquvvlxz | B6 B9 G2 G5 |
| wave2 | [builder-wave2.md](requirements/prompts/builder-wave2.md) | [builder-wave2.md](requirements/notes/builder-wave2.md) | qrrtlonr | C1-C8 F1-F4 |
| design export | - | [design-measurements.md](requirements/notes/design-measurements.md) | wuqqrlwn | - |
| process | [AGENT-PROMPTS.md](requirements/AGENT-PROMPTS.md) | - | tozvvvwr | - |
| parity (planned) | [builder-parity.md](requirements/prompts/builder-parity.md), [verifier-parity.md](requirements/prompts/verifier-parity.md) | no notes file | - | B3 B6 B9 B10 G2 G3 |

The parity prompts were written for the next session. On 2026-11-10, unit u1-top took over the
parity mode instead.

### 2026-11-10 (Claude)

| Unit | Prompt / contract | Notes | Commit | Item ids |
|---|---|---|---|---|
| tooling | (lead) | - | swoxyqxx | - |
| u1-top | claude-builder.md, claude-verifier.md | [u1-top.md](requirements/notes/u1-top.md), [u1-top-verify.md](requirements/notes/u1-top-verify.md) | xpyqxtsr | G2 G3 B3 |
| u2-grid | claude-builder.md, claude-verifier.md | [u2-grid.md](requirements/notes/u2-grid.md), [u2-grid-verify.md](requirements/notes/u2-grid-verify.md), [u2-fix.md](requirements/notes/u2-fix.md), [u2-grid2-verify.md](requirements/notes/u2-grid2-verify.md) | knvsouuo | B1 B5 B6 B7 B9 B10 B11 |
| u3-bars | claude-builder.md, claude-verifier.md | [u3-bars.md](requirements/notes/u3-bars.md), [u3-bars-verify.md](requirements/notes/u3-bars-verify.md), [u3-fix.md](requirements/notes/u3-fix.md) | rsnollyz | C1-C8 |
| u4-drawer | claude-builder.md, claude-verifier.md | [u4-drawer.md](requirements/notes/u4-drawer.md), [u4-drawer-verify.md](requirements/notes/u4-drawer-verify.md), [u4-fix.md](requirements/notes/u4-fix.md), [u4-drawer2-verify.md](requirements/notes/u4-drawer2-verify.md) | pwyrnypt | D1-D13 D15 |
| u5-actions | claude-builder.md, claude-verifier.md | [u5-actions.md](requirements/notes/u5-actions.md), [u5-actions-verify.md](requirements/notes/u5-actions-verify.md) | nzvlwqqx | D14 E1-E6 |
| u6-small | claude-builder.md, claude-verifier.md | [u6-small.md](requirements/notes/u6-small.md), [u6-small-verify.md](requirements/notes/u6-small-verify.md) | msusnqzo | A2 A3 A4 G4 I7 I8 H5 |
| b1-storage | claude-builder.md + bonus rules | [b1-storage.md](requirements/notes/b1-storage.md), [b1-storage-verify.md](requirements/notes/b1-storage-verify.md) | wrpruowm | F5 |
| b2-today | claude-builder.md + bonus rules | [b2-today.md](requirements/notes/b2-today.md), [b2-today-verify.md](requirements/notes/b2-today-verify.md) | omyuutpo | I2 |
| b3-a11y | claude-builder.md + bonus rules | [b3-a11y.md](requirements/notes/b3-a11y.md), [b3-a11y-verify.md](requirements/notes/b3-a11y-verify.md), [b3-a11y-verify2.md](requirements/notes/b3-a11y-verify2.md) | uwmxptsm | I5 |
| b4-resize | claude-builder.md + bonus rules | [b4-resize.md](requirements/notes/b4-resize.md), [b4-resize-verify.md](requirements/notes/b4-resize-verify.md) | utrvxlns | C9 |
| b5-prompts | claude-builder.md + bonus rules | [b5-prompts.md](requirements/notes/b5-prompts.md) | not committed yet | H4 H6 |

The handover commits are spqsqktq, lrputmuq (2026-11-10) and tzkluxzt (2026-11-10b). The
handover of 2026-11-08 is in commit uunsvymz.

## 3. Key decisions and why

Source: the sections "Decisions taken in this session" of
[session-handover-2026-11-10.md](requirements/notes/session-handover-2026-11-10.md) and
[session-handover-2026-11-10b.md](requirements/notes/session-handover-2026-11-10b.md). The plan
decisions of 2026-11-08 are in [2026-11-08-grill-session.md](decisions/2026-11-08-grill-session.md).

| Decision | Why |
|---|---|
| Auto-commit per verified unit. | The human approved it. |
| Timescale options: Hour, Day, Week, Month. Hour uses the Day column width. | The design dropdown has Hour, Day, Week, Month. |
| Open status uses the design cyan (`#f2feff`, `#cefbff`, `#e4fdff`, `#00b0bf`). | The handover names it the design cyan. |
| Current-period chip: Month "Current month", Week "Current week", Day and Hour "Today". | Not recorded in the handover. |
| Bar-end handle zone stays 8px. | "Timeline - Hover Options" is an older mock with no three-dot button. A wider zone would block the menu click (P11, design conflict). |
| Drawer: End Date above Start Date. Dates in DD.MM.YYYY. | The design shows this order and format. |
| Drawer chevron `#687196`. | The artboards are inconsistent. |
| `angular.json` `cli.analytics: false`. | Intended. |
| Today button in the top bar, right of the Timescale dropdown, chip tokens, hidden in parity mode. | The design has no Today button. Parity screenshots must not change. |
| Design text colours under 4.5:1 stay. They are excluded from the axe `color-contrast` rule only. | Pixel parity with the design. |
| Focus ring tokens: width 1, offset -1, on every `:focus-visible` outline. | Not recorded in the handover. |
| Resize (C9): handle zone 8px. Every timescale snaps to whole days. A bad range or an overlap reverts the drag. | Orders store `yyyy-mm-dd`. |
| Timers (`RESIZE_ERROR_MS`) are not design tokens. | A timer is behaviour, not design. |

## 4. What failed and what changed

### pi to Claude

The pi session of 2026-11-08 failed at pixel parity. Two causes are recorded:

1. `docs/requirements/measure.mjs` compares DOM CSS values with `tokens.json`. It does not
   compare pixels. Values could pass while the screen did not match the design.
2. Two builders used their full context on pixel scans of the artboard and delivered no code.

Sources: [session-handover-2026-11-08.md](requirements/notes/session-handover-2026-11-08.md)
("Process rules, changed today") and
[session-handover-2026-11-10.md](requirements/notes/session-handover-2026-11-10.md) ("Who and
how", History).

What changed:

- 2026-11-08, end of day: one atomic unit per builder, a fresh verifier after each builder, and
  builder prompts must not ask for a new measurement (commits tozvvvwr and wuqqrlwn).
- 2026-11-08: the official Sketch export went into the repo, with `scripts/design-diff.mjs` (commit tozvvvwr).
  `design-measurements.md` came after it (commit wuqqrlwn).
- 2026-11-10: the work moved to Claude children with the new contracts
  [claude-builder.md](requirements/prompts/claude-builder.md) and
  [claude-verifier.md](requirements/prompts/claude-verifier.md) (commit swoxyqxx).

### measure.mjs to pixel-check.mjs

`scripts/pixel-check.mjs` screenshots `http://localhost:4200/?parity=1`, diffs it with the
exported artboard, and lists the Sketch layers with the most wrong pixels, with their design
values. It also writes `compare.png`, `onion.png` and `zoom.png`. The builder fixes the worst
layer, then runs it again (the pixel loop in claude-builder.md). It came in commit swoxyqxx,
together with the shadow `spread` fix in `docs/design/extract.mjs`.

Mismatch per unit after the change (session-handover-2026-11-10.md): u1-top 0.02% above y 204,
u2-grid 0.09%, u3-bars 0.26-0.31%, u4-drawer 0.29-0.32%. No unit may go above its committed
value.

measure.mjs stays for G4 (`.drawer` border radius, fixed in u6-small).
