# b15-readme (H1)

## What changed

- New `README.md` at the repo root: what the app is, requirements, setup and run, parity mode
  and why, tests and verify tools, code structure, decisions, libraries with reasons, bonus
  items, AI workflow pointer (`docs/ai-prompts.md`), known limits.
- H1 row in `acceptance-criteria.json` set to pass with manual evidence. `verify.mjs` rendered
  the `.md`.
- No source, test or config file changed. No e2e spec: H1 is a manual item.

## Facts to know

- The repo has no `.nvmrc` and no `engines` field. The README gives Node 22.12 or later, from
  the engines of `vitest` 5.1.0 (`^22.12.0 || ^24.0.0 || >=26.0.0`). Tested with Node 26.13.0,
  npm 11.20.0. Adding `.nvmrc` or `engines` was out of scope.
- The `J3` row in the `.json`/`.md` diff is not mine. The demo-script agent wrote it at the same
  time.

## Commands run (Node 26.13.0)

| Command | Result |
|---|---|
| `npm install` | ok (warnings on install scripts only) |
| `npx playwright install chromium` | ok |
| `npm run build` | ok |
| `npx vitest run` | 31 passed |
| `npx playwright test` | 87 passed |
| `npm run test:all` | 87 passed |
| `DEMO_HEADLESS=1 npm run demo` | 86 passed, exit 0 |
| `npm run build-storybook` | ok |
| `npm run storybook` | HTTP 200 on :6006, then stopped |
| `node docs/requirements/verify.mjs` | 72 pass, 3 pending, 0 fail |
| `node scripts/pixel-check.mjs --artboard="Schedule - Default"` (bar and cursor masks) | 0.2% before and after |

`npm start` was not started again: the lead dev server on :4200 answers 200.
