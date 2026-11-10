# b1-storage verify (F5)

Spec: "localStorage persistence: Work orders survive page refresh" (FE-technical-test-10-2026.md:333).

## Checks

- F5 reload pass - e2e `[F5] create, edit and delete survive a reload` green; create, edit and delete each survive `page.reload()` - tests/e2e/storage.spec.ts:38
- F5 seed pass - empty storage shows the 8 sample bars and writes nothing on load - tests/e2e/storage.spec.ts:29
- F5 document shape pass - stored value is `{ docId, docType: 'workOrder', data }` - tests/e2e/storage.spec.ts:69
- F5 corrupt storage pass - not JSON, not array, `[null]`, bad status, unknown work centre, empty data: all fall back to the sample data, no page error (own Playwright run) - schedule.service.ts:103
- F5 corrupt storage, weak spots pass (advisory) - accepted without fallback: impossible date `2026-13-45`, end before start, duplicate docIds (2 bars render, no page error). Duplicate ids: `remove`/`save` match by docId, so one action hits both. Only reachable by hand-edited storage - schedule.service.ts:153
- F5 blocked/full storage pass - `storage()`, `getItem`, `setItem` each in try/catch (code read, not driven) - schedule.service.ts:119-151
- parity no read pass - storage `[]`, `/?parity=1` still shows the 4 fixture bars - tests/e2e/storage.spec.ts:113
- parity no write pass - delete in parity mode leaves storage `[]`; `persist()` guards on `PARITY_MODE` - tests/e2e/storage.spec.ts:113, schedule.service.ts:71
- pixel Schedule - Default pass - masks of session-handover-2026-11-10.md, mismatch 0.2% now; committed f641084 served on :4300 gives a byte-identical `app.png` (0 byte diffs, 1440x1024), so no change - scripts/pixel-check.mjs
- [F5] titles pass - 5 of 5 tests in storage.spec.ts carry `[F5]` - tests/e2e/storage.spec.ts
- scope pass - `jj diff --stat`: schedule.service.ts, storage.spec.ts, b1-storage.md, acceptance-criteria.json/.md (F5 row only). No unrelated file - jj diff
- evidence text pass (advisory) - F5 evidence names only the parity test; the reload test is the better proof - acceptance-criteria.json:642
- code pass - class first, helpers below (top-down), no dead code, no style literals (data-only change), key versioned `naologic.workOrders.v1` - schedule.service.ts
- build pass - `npm run build` clean, no warnings - npm
- vitest pass - 29 passed (5 files) - npx vitest run
- playwright pass - 62 passed - npx playwright test

Tooling note: Node 16 on PATH fails Playwright; ran with Node 22.14.0 from nvm.

## Failures

None.
