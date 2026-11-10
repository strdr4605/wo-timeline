# b5-prompts: AI prompt log (H4, H6)

Builder, 2026-11-10. Lead: t38. Document item: no app code, no e2e spec, no pixel-check.

## What changed

- New `docs/ai-prompts.md`: history, delegation (lead, builder, verifier, fix builder, verify2),
  a table per session (unit, prompt or contract, notes, jj change id, item ids), key decisions
  with their reason, and what failed and what changed (pi to Claude, measure.mjs to
  pixel-check.mjs).
- `acceptance-criteria.json`: H4 and H6 set to pass with evidence `docs/ai-prompts.md`.
  `acceptance-criteria.md` rendered by `verify.mjs`.

## Checks

- Every relative link in `docs/ai-prompts.md` resolves to a file (shell loop with `test -e`).
- Every change id in the tables resolves with `jj log -r <id>`, and its first line matches the unit.
- `node docs/requirements/verify.mjs`: playwright exit 0, vitest exit 0, 61 pass, 11 pending, 0 fail.
  The known warning `unknown item id in test title: P9` stays (open note of the 10b handover).

## Facts that have no source

- The handover gives no reason for two decisions: the current-period chip labels and the focus
  ring tokens. The table says "Not recorded in the handover".
- No notes file exists for `builder-parity.md` and `verifier-parity.md`. The log says they were
  planned and that u1-top took over the parity mode.
