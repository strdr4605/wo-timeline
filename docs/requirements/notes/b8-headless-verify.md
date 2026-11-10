# b8-headless-verify: item I4

Verifier run on 2026-11-10. Node 26 (`/opt/homebrew/opt/node@26/bin`). The lead's dev server answered 200 on :4200 during all runs. It was not stopped.

## Checks

- I4 `npm run test:all` pass - exit 0. Build complete (1.598 s). Vitest 5 files, 29 tests passed. Playwright 70 passed (13.7 s). - run log
- I4 `CI=1 npm run test:all` pass - exit 0. Vitest 29 passed. Playwright 70 passed (13.7 s), 0 failed, 0 flaky. - run log
- I4 headless pass - `ps` sampled each 1 s during the run: 12 samples had `ms-playwright` Chromium processes, and all 12 had `--headless`. No window opened. Config `use.headless: true`; the project spreads `devices['Desktop Chrome']`, which has no `headless` key, so the value is kept. - `playwright.config.ts:14`, ps sample
- I4 stop on first failure pass - temporary `tests/unit/zz-verify-temp-fail.spec.ts` with `expect(1).toBe(2)`: `npm run test:all` exit 1, vitest `1 failed | 29 passed (30)`, Playwright did not start (no `[chromium]` line in the log). File removed after the run; `jj diff --stat` unchanged (6 files). The `&&` chain also stops after a failed `npm run build`. - run log
- I4 `reuseExistingServer: true` with no server on :4200 pass (reasoning, server not stopped) - Playwright first requests `webServer.url` `http://localhost:4200`. With no answer, it runs `npm run start` (`ng serve --port 4200`) and waits up to `timeout: 120_000` for the URL. `reuseExistingServer` only changes the case where a server already answers: `true` reuses it instead of the error "already used". So a clean machine still gets a server. Side effect: with `CI=1` a stale server on :4200 is now reused, not refused. Acceptable for this repo. - `playwright.config.ts:25-31`, `package.json` `start`
- I4 `[I4]` test meaningful pass - It checks that `test:all` is exactly `npm run build`, `vitest run`, `playwright test` in that order, that `headless: false` is absent and `headless: true` is present in `playwright.config.ts`. A removed step, a changed order, `||` or `;` in place of `&&`, or `headless: false` makes it fail. Limit: it is a text check; a comment that contains `headless: true` would also satisfy the regex. It does not read the resolved runtime value. Minor. - `tests/e2e/headless.spec.ts:8-22`
- verify.mjs pass - `node docs/requirements/verify.mjs`: vitest exit 0, `{ pass: 64, pending: 8 }`, 0 fail. Warning `unknown item id in test title: P9` comes from `tests/e2e/bars.spec.ts`, which is outside this unit and not in the diff. - verify.mjs output
- Scope pass - `jj diff --stat`: `acceptance-criteria.json` and `.md` (I4 pending to pass, with evidence), `notes/b8-headless.md`, `package.json` (+1 script), `playwright.config.ts` (+headless, reuseExistingServer), `tests/e2e/headless.spec.ts` (new). No app file changed. - jj diff
- Code pass - Top-down order in the spec (test first, `read` helper at the bottom). Comments explain each change. No dead code. `playwright.demo.config.ts` spreads `base` and keeps its own `headless: false` for the demo; `test:all` does not use it. - jj diff

## Failures

None.

## Notes (not failures)

- The `[I4]` test checks config text, not the runtime value. Optional hardening: read `test.info().project.use.headless`.
- The P9 warning from `verify.mjs` is outside I4. The lead can decide if P9 needs an id in the criteria.
