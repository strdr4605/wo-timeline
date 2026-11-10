# b5-prompts verify (H4, H6)

Verifier, 2026-11-10. Lead: t38. Document item: no pixel check, no e2e. Scope: `docs/ai-prompts.md`,
brief `FE-technical-test-10-2026.md` l.7, l.350, l.403, l.475.

## Checks

- Brief lines pass - l.7 "save those prompts in a markdown file", l.350 "Save prompts used in markdown files", l.403 "AI prompt documentation", l.475 "(Bonus) Markdown files with AI prompts you used"; the doc cites the 4 lines correctly - sed
- Links pass - 47 unique relative links, all resolve with `test -e` from `docs/` - shell loop
- Change ids pass - all 21 change ids in the doc exist in `jj log` (nusoqzkq ... tzkluxzt) - jj log
- Unit tables, item ids pass - wave0, wave1, wave1 fix, wave2, u1-u6, b1-b4 item ids match the commit first lines - jj log
- wave 0+1 verify ids pass - "A1, A5, G1, G2, G5, B1 to B11" - notes/verifier.md l.3
- parity (planned) ids pass - B3 B6 B9 B10 G2 G3 - prompts/builder-parity.md, verifier-parity.md
- Handover commits pass - uunsvymz adds session-handover-2026-11-08.md, spqsqktq + lrputmuq the 2026-11-10 file, tzkluxzt the 10b file - jj diff -r <id> --stat
- swoxyqxx pass - adds pixel-check.mjs, claude-builder.md, claude-verifier.md, extract.mjs spread fix - jj diff -r swoxyqxx --stat
- "process" row fail - the doc links AGENT-PROMPTS.md to commit wuqqrlwn. wuqqrlwn does not touch AGENT-PROMPTS.md. It changes prompts/builder-parity.md, prompts/verifier-parity.md and notes/design-measurements.md. AGENT-PROMPTS.md changed only in nusoqzkq and tozvvvwr; its section "2026-11-08: one atomic unit per builder" came in tozvvvwr - `jj log -r "files('docs/requirements/AGENT-PROMPTS.md')"`
- "design export" row and section 4 fail - the doc says design-measurements.md came in tozvvvwr ("with scripts/design-diff.mjs and design-measurements.md (commit tozvvvwr)"). tozvvvwr has design-diff.mjs, screenshot.mjs, DESIGN-PARITY.md, the artboards; design-measurements.md first comes in wuqqrlwn (then uunsvymz) - `jj log -r "files('docs/requirements/notes/design-measurements.md')"`
- Section 4 "commit wuqqrlwn" for the atomic-unit rule pass (note) - the commit first line says it, but the rule text in AGENT-PROMPTS.md is from tozvvvwr. "Builder prompts must not ask for a new measurement" traces to session-handover-2026-11-08.md and the rewritten builder-parity.md in wuqqrlwn - jj diff
- History table pass - pi session id, MiniMax M3.1 Flash, waves 0 to 2, 59 pass, 13 pending, 0 fail - session-handover-2026-11-10.md "Who and how", 10b "Done"
- Delegation section pass - hc run command, roles, verify2 names (u2-grid2-verify, u4-drawer2-verify, b3-a11y-verify2), bonus rules - session-handover-2026-11-10.md "Process", "Launch templates"; 10b "Flow", "Bonus rules"; claude-builder.md l.23, l.50, l.52
- Decisions table pass - each row matches "Decisions taken in this session" of both handovers. Hour/Day/Week/Month reason - session-handover-2026-11-08.md deviation 6. DD.MM.YYYY - notes/u4-fix.md l.9
- "Not recorded in the handover" rows pass (note) - true for the handovers, but reasons exist in notes: chip labels fix the u2-grid verify failure 9 ("Current month" shown in Week and Day, notes/u2-grid-verify.md l.32, u2-fix.md l.17); focus-ring tokens fix the b3-a11y verify finding of a grid-line token and offset literals used as focus ring (notes/b3-a11y-verify.md l.51) - grep
- pixel-check description pass - parity URL, compare.png, onion.png, zoom.png - scripts/pixel-check.mjs l.18-20, l.64
- measure.mjs description pass - compares DOM with tokens.json - measure.mjs l.3
- Mismatch numbers pass - u1-top 0.02% above y 204, u2 0.09%, u3 0.26-0.31%, u4 0.29-0.32% - session-handover-2026-11-10.md "Done"
- measure.mjs for G4 pass - notes/u6-small.md l.10, l.35-40
- Nothing invented pass, with the 2 commit errors above as the only wrong facts - cross-read
- ASD-STE100 style pass - short sentences, active voice, one idea per sentence, no idioms - read
- H4 row pass - .json status pass, evidence "manual: docs/ai-prompts.md indexes the prompts and contracts in docs/requirements/prompts/*.md"; .md row `[x]` - jj diff
- H6 row pass - .json status pass, evidence "manual: docs/ai-prompts.md, AI prompt log: ..."; .md row `[x]` - jj diff
- verify.mjs pass - playwright exit 0, vitest exit 0, 61 pass, 11 pending, 0 fail; known warning `unknown item id in test title: P9` - node docs/requirements/verify.mjs (Node 26)
- jj diff scope pass - 4 files, all under docs/: ai-prompts.md, acceptance-criteria.json, acceptance-criteria.md, notes/b5-prompts.md; verify.mjs run left the diff unchanged - jj diff --stat

## Failures

1. `docs/ai-prompts.md` section 2, row "process": AGENT-PROMPTS.md is linked to commit wuqqrlwn. wuqqrlwn does not change AGENT-PROMPTS.md (it changes builder-parity.md, verifier-parity.md, design-measurements.md). The atomic-unit section of AGENT-PROMPTS.md came in tozvvvwr.
2. `docs/ai-prompts.md` section 2, row "design export", and section 4 "What changed" bullet 2: design-measurements.md is said to come in tozvvvwr. It first came in wuqqrlwn.

Notes (not failures): the two "Not recorded in the handover" reasons can be traced to notes/u2-grid-verify.md l.32 and notes/b3-a11y-verify.md l.51.

## Lead fixes

- Failure 1: the AGENT-PROMPTS.md row now points to tozvvvwr. The "What changed" bullet 1 now
  names tozvvvwr and wuqqrlwn.
- Failure 2: the design-measurements.md row now points to wuqqrlwn. Bullet 2 now says that the
  file came in wuqqrlwn.
