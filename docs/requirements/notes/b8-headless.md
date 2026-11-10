# b8-headless: item I4

The automated suite runs headless and passes. No app code changed. No pixel work.

## What changed

- `playwright.config.ts`
  - `use.headless: true` is now explicit. It was the default before. The explicit value makes
    the I4 test able to check it.
  - `webServer.reuseExistingServer` changed from `!process.env['CI']` to `true`. Reason: with
    `CI=1` the old value tried to start a new server on the busy port :4200 and stopped at once:
    `Error: http://localhost:4200 is already used, make sure that nothing is running on the
    port/url or set reuseExistingServer:true in config.webServer.` (reproduced with the HEAD
    config). With `true`, Playwright uses the running server, and starts `npm run start` only
    when nothing answers on :4200.
- `package.json`: new script
  `"test:all": "npm run build && vitest run && playwright test"`. The `&&` chain stops at the
  first failed step. No new dependency.
- `tests/e2e/headless.spec.ts`: one test,
  `[I4] test:all runs build, vitest and playwright, and the suite is headless`. It reads
  `package.json` and `playwright.config.ts`. It checks that `test:all` is exactly the three
  steps in order, that `headless: false` is absent, that `headless: true` is present, and that
  `reuseExistingServer: true` is present.
- `vitest.config.ts`: no change. It uses `environment: 'node'`, no browser and no UI.

## Runs (Node 26, dev server already on :4200)

| Command | Result |
|---|---|
| `npm run test:all` | exit 0. Build complete. Vitest 5 files, 29 tests passed. Playwright 70 passed (13.8 s). |
| `CI=1 npm run test:all` | exit 0. Build complete. Vitest 29 passed. Playwright 70 passed (13.7 s), no retries used. |
| `npx playwright test tests/e2e/headless.spec.ts` | 1 passed. |
| `node docs/requirements/verify.mjs` | 64 pass, 8 pending. I4 marked pass by verify.mjs. |

Chromium ran with `--headless` (seen in `ps` during the run). No window opened.

## Pixel check

`node scripts/pixel-check.mjs --artboard="Schedule - Default"` with the bar masks
`437,249,463,38;556,352,463,38;945,352,463,38;677,401,533,38`:

- before: mismatch 0.21%
- after: mismatch 0.21%

Parity mode is not touched: no app file changed.

## Note

Run the suite with Node 20 or higher. The default shell Node here is 16.20.0, and Playwright
refuses it. Use `export PATH=/opt/homebrew/opt/node@26/bin:$PATH` first.
