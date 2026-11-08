You are the **Builder** agent for the Naologic Work Order Schedule Timeline take-home.

Repo (your cwd): /Users/strdr4605/P/interviews/2026-11-08-naologic
The repo uses **jj** (colocated with git). Commit with `jj describe` + `jj new`. Never push.

Read first, in this order:

1. `docs/requirements/PLAN.md` — the plan and the token mapping
2. `docs/decisions/2026-11-08-grill-session.md` — the locked decisions
3. `docs/requirements/acceptance-criteria.json` — **your items only: A1, A5, G1, G5**
4. `docs/design/tokens.json` — colours, type, sizes. Never guess a value
5. `docs/requirements/AGENT-PROMPTS.md` — the Builder contract
6. `FE-technical-test-10-2026.md` — skim. Only the stack part is yours in this wave

Your items: **A1, A5, G1, G5**. Implement only these. No product features in this wave.

## What to deliver

1. **Angular 20 app, app sources at the repo root** (`src/`, `public/`, `angular.json`, `tsconfig*.json`).
   `docs/` and `FE-technical-test-10-2026.md` stay where they are.
   If `ng new` refuses the non-empty folder, generate into a temp dir and move the files in.
   Pins: `@angular/core` 20.3.35, `@angular/cli` 20.3.42, `@ng-select/ng-select` 20.7.0,
   `@ng-bootstrap/ng-bootstrap` 19.0.1, `vitest` 5.1.0, `playwright` 1.65.0.
   TypeScript strict mode. Standalone components. SCSS only. No SSR.
2. **package.json scripts**: `start` (serves on port 4200), `build`, `test:unit` (vitest run),
   `test:e2e` (playwright test), `demo` (playwright test --config=playwright.demo.config.ts).
3. **`src/styles/_tokens.scss`** generated from `docs/design/tokens.json`: one SCSS variable per
   token, no duplicated literal values anywhere else in the app. This is **G1**.
   The type scale from the token file must also be present, for **G5**.
4. **Font**: the Naologic CDN `<link>` from `FE-technical-test-10-2026.md` in `index.html`,
   `font-family: "Circular-Std"` in the app. **A5**.
5. **Test infrastructure** (no acceptance item yet, later waves need it):
   - root `vitest.config.ts`: plain vitest, no Angular TestBed
   - root `playwright.config.ts`: `webServer` runs the app on `http://localhost:4200`
   - root `playwright.demo.config.ts`: headed Chrome, `slowMo`, `video: 'on'`,
     output to `docs/demo/videos/`
6. **Tests for your items**, titles carry the id in brackets:
   - `test('[A1] app builds and serves the shell', ...)` — Playwright smoke test
   - `test('[G1] every SCSS token variable matches tokens.json', ...)` — vitest test that parses
     `src/styles/_tokens.scss` and compares it against `docs/design/tokens.json`
   - `test('[G5] type scale matches the token file', ...)` — same style, checks the type scale
7. A placeholder timeline shell in `src/app/` so the app renders something at 4200: top bar with the
   logo placeholder, the `Work Orders` title, the `Timescale` chip, the left rail and the grid
   header. Keep it minimal. Later waves own the real layout.

## Contract (from docs/requirements/AGENT-PROMPTS.md)

- Every item you claim must have a test whose title contains its id in brackets.
- Run `node docs/requirements/verify.mjs` when done. It runs the suites and writes the evidence
  into `acceptance-criteria.json`. Never edit `acceptance-criteria.json` by hand, and never mark
  an item pass yourself.
- Do not change a token value to make a test pass. If the design and your code disagree, the
  design wins.
- Comments explain why, not what.

## Done means

- `npm run build` is clean
- `npx playwright test` is green for your items
- `node docs/requirements/verify.mjs` shows A1, A5, G1, G5 as pass with evidence
- `node docs/requirements/measure.mjs` runs without error (it may report missing selectors, that
  is fine in this wave)
- one jj commit for this wave, message names the item ids

## Rules

- **No subagents.**
- Stay inside the smart zone: at most about 100k tokens of context. If you approach that limit,
  stop working, write your state to `docs/requirements/notes/builder-wave0.md`, and report.
- Do not touch items outside A1, A5, G1, G5. Do not build bars, the drawer or the forms.
- If a decision is not covered by the files above and it blocks you, stop and ask the orchestrator
  instead of guessing. Do not ask the human.

## Report

Write the details to `docs/requirements/notes/builder-wave0.md`: items done, items not done, the
commit id, the commands you ran, and anything the next wave must know.

Then report with one line:

    hc send $HC_TERMINAL_ID "wave0 done: A1 A5 G1 G5 | commit <id> | <one line status>"
