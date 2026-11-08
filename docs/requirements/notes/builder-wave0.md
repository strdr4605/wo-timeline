# Builder wave 0 notes

Scaffold, design tokens, font and test harness. Items: **A1, A5, G1, G5**.

## Items done

| Item | Evidence |
|---|---|
| A1 | Angular 20.3.35 app at the repo root, standalone components, TypeScript strict, SCSS only, no SSR. Test: `[A1] app builds and serves the shell` (Playwright, `tests/e2e/smoke.spec.ts`). |
| A5 | Naologic CDN `<link>` in `src/index.html` plus local `@font-face` fallback from `docs/design/fonts` (served at `/fonts/*.otf`). `font-family: "Circular-Std"` comes from the token file. Test: `[A5] Circular Std comes from the Naologic CDN with a local fallback` (Playwright). Measurement `A5` in `measurements.json` checks the computed font family. |
| G1 | `src/styles/_tokens.scss` is generated from `docs/design/tokens.json` by `tools/generate-tokens.mjs` (`npm run tokens`). One variable per token, nothing else in the app may hold a colour or a size. Tests: `[G1] every SCSS token variable matches tokens.json` and `[G1] the app styles use no colour or size that the token file does not hold` (vitest, `tests/unit/tokens.spec.ts`). |
| G5 | The type scale of the token file is in `_tokens.scss` as `$type-<style>-size/-font/-font-weight/-color`. Test: `[G5] type scale matches the token file` (vitest). Measurement `G5` checks `.work-center-name` (14px, Circular-Std); the `.drawer__title` part of that measurement waits for the drawer (wave 3). |

Also passing by measurement, not claimed as mine: **G2** (chip height 25, radius 5), **B10** (row height 48), **B11** (grid line `#e6ebf0`).

## Items not done

Everything else. No bars, no drawer, no forms, no data set, no zoom behaviour.

## Commit

- Message: `wave0: Angular 20 scaffold, SCSS design tokens, Circular Std font, test harness (A1 A5 G1 G5)`
- Change id (stable): `nusoqzkqprnxsutwmtoslytqqkxnzltp`
- The repo had no finished commit before this wave, so this commit also carries the earlier import of `docs/` and the brief. Resolve it with `jj log -r 'nusoqzkqprnxsutwmtoslytqqkxnzltp'`.

## Commands run

```bash
npm install
npm run build                # clean
npx playwright test          # 2 passed
npx vitest run               # 3 passed
npm run demo                 # headed, slow motion, videos under docs/demo/videos/
node docs/requirements/measure.mjs    # 7 pass, 10 fail (missing selectors of later waves)
node docs/requirements/verify.mjs     # A1 A5 G1 G5 pass
```

Node: the system `node` is v16, too old for Angular 20. Use `/opt/homebrew/opt/node@26/bin` in PATH.

## What the next wave must know

- Ports and commands: `npm start` serves on 4200, `npm run test:unit`, `npm run test:e2e`, `npm run demo`.
- Tests live in `tests/unit` (vitest) and `tests/e2e` (Playwright). A test title must carry its item id in brackets, the harness reads the title.
- `tools/generate-tokens.mjs` writes `src/styles/_tokens.scss`. Run `npm run tokens` after any change to `docs/design/tokens.json`. Never type a colour or a size into a component: the vitest test scans every `.scss` file under `src/` and fails on a value the token file does not hold. Add a token to `tokens.json` first.
- The shell in `src/app/` is a placeholder: top bar with logo placeholder at (101, 20) 80x10, `Work Orders` title, timescale chip at y 155, left rail from x 102 with 380 width, grid header from x 483 with 114 wide month columns, rows of 48. Wave 1 owns the real grid, so expect to replace `app.html` and `app.scss`.
- The five work centre names in `app.ts` are placeholders. The sample data set belongs to wave 4.
- The chip is a standalone component (`src/app/timescale-chip/`). Its value segment is left aligned with the chevron at the right, as in the Sketch.
- `.drawer__title` does not exist yet, so that one G5 measurement fails until the drawer lands.
- Harness fixes made in this wave: `measure.mjs` now reads `measurements.measurements` and converts every `*-color` property to hex. Expected values were not touched.
