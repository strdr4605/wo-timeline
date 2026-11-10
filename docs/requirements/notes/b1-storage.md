# b1-storage: localStorage persistence (F5)

## What changed

- `src/app/data/schedule.service.ts` stays the single store. It now loads the work orders from
  localStorage key `naologic.workOrders.v1` and writes them after each `save` and `remove`.
- The stored value is the document list of the brief: `{ docId, docType: 'workOrder', data }`.
- A missing key gives the sample data. The app does not write on load, so a first visit stores
  nothing until the first change.
- Corrupt storage (not JSON, not an array, an unknown status or work centre, a bad date) gives the
  sample data. The next change overwrites the bad entry. A stored `[]` stays empty (the user
  deleted all orders).
- A blocked or full storage is caught. The change then stays in memory only.
- Parity mode (`?parity=1`) never reads or writes the storage. It always uses the design fixture.
- Outside a browser (vitest, `environment: node`) the storage is absent and the service uses the
  sample data, as before.

## Tests

`tests/e2e/storage.spec.ts`, 5 tests titled `[F5]`: seed on empty storage, create/edit/delete
survive a reload, document structure, corrupt storage fallback, parity isolation.

## Checks

- Pixel check "Schedule - Default", bar and cursor masks: mismatch 0.2% before, 0.2% after.
- `npm run build` clean, `npx vitest run` 29 passed, `npx playwright test` 62 passed.
- `node docs/requirements/verify.mjs`: F5 pass (it updated the md and json rows).

## Still differs

Nothing in this unit. `verify.mjs` warns about an unknown id `P9` in an older test title; that
is not from this unit.
