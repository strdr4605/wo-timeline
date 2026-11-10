# b9-demo verify (J1, J2)

Verifier: Claude, herdr child of t38. Date: 2026-11-11. Node: /opt/homebrew/opt/node@26.
Lead rule: no headed Chrome. The demo ran only as `DEMO_HEADLESS=1 npm run demo`. The headed
default was checked statically. The lead change (DEMO_HEADLESS switch) is included in this check.

## Checks

- J1 demo config pass - `playwright.demo.config.ts`: extends the fast config, `grep: /\[[A-Z]\d+\]/`, `workers: 1`, `video: { mode: 'on', size: 1440x1024 }`, `slowMo: 400` (project `chromium`), `slowMo: 0` (project `chromium-motion`, motion.spec.ts only), `outputDir: 'docs/demo/videos/.raw'`, reporter copies to `docs/demo/videos/<id>-<slug>.webm` - source read
- J1 DEMO_HEADLESS switch pass - line 13 `const headless = process.env['DEMO_HEADLESS'] === '1'`, used in top `use` (line 41) and in `demoBrowser` of both projects. No env: `headless: false` (headed default). `DEMO_HEADLESS=1`: headless and 67 videos recorded - static read + headless run
- J2 `DEMO_HEADLESS=1 npm run demo` pass - exit 0, `71 passed (3.3m)`, 67 new `.webm` (newer than a marker file), 0 old files left - run
- J2 file names pass - `<item id>-<title slug>.webm`, e.g. `C1-the-bar-starts-at-the-start-date-and-ends-at-the-end-date.webm`. 71 tests give 71 unique names. A human finds a video by item id - listing
- J2 video format pass - C1 video: 1440 x 1024, 2.12 s (ffprobe). Named videos 31 MB, `.raw` 27 MB - ffprobe, du
- J2 tests with no video pass (documented) - the 4 tests without a video are `[I4]`, `[I6]`, `[J1]`, `[J2]`. All 4 are static source checks with no `page` fixture, so Playwright records no video. Documented in `docs/requirements/notes/b9-demo.md` line 43. See note 1 - script mapping of `--list` titles to files
- Fast config pass - `playwright.config.ts` unchanged (not in `jj diff`), `headless: true`, no `video`, no `slowMo`. `npx playwright test --list`: 72 tests, project `chromium` only. After `npm run test:all`: 0 `.webm` in `test-results/` - run
- `npm run test:all` pass - build + vitest + playwright, exit 0, `72 passed (13.1s)` - run. A first run had 5 failures with `ENOENT ... test-results/.playwright-artifacts-2/...`; 3 other playwright processes ran at the same time (lead edit/run). The rerun was clean. Not a unit defect
- `node docs/requirements/verify.mjs` pass - `playwright exit: 0`, `vitest exit: 0`, playwright report expected 72, unexpected 0, flaky 0, `{ pass: 66, pending: 6 }`. Message `unknown item id in test title: P9` is not from this unit - run
- Videos not committed pass - `.gitignore` has `docs/demo/videos/`. `jj file list` has no `.webm` and no path under `docs/demo/videos`. `jj st` shows no video - jj
- Scope pass - `jj diff --stat`: acceptance-criteria.json/.md (J1, J2 only), notes/b9-demo.md, playwright.demo.config.ts, tests/demo/video-reporter.ts, tests/e2e/demo-config.spec.ts. No app code. No change outside J1/J2 - jj diff
- `[J1]`/`[J2]` tests meaningful pass (weak) - they lock the config, the switch, the fast config, `.gitignore` and the npm scripts against a later edit. They are regex checks on source text and do not prove that videos are produced. See note 2 - source read
- Code pass - top-down, constants at top, comments explain the two projects and the retry. `video-reporter.ts` is outside `tests/e2e`, so no run loads it as a spec - source read

## Notes (not failures)

1. The config comment (line 4-6, line 20) and the J1 test title say "one video per (requirement) test". 4 static tests have none. The exception is only in the builder notes. Recommend one comment line in `playwright.demo.config.ts` that says the tests with no page give no video.
2. No automated check counts the videos. A count check in the reporter (`onEnd`: tests with a page vs files) would make J2 testable.
3. The reporter never deletes old videos. If a test title changes, the old file stays in `docs/demo/videos/`. Only local (gitignored).
4. `docs/demo/videos/.raw` (27 MB) keeps a second copy of each video. Gitignored.

## Failures

None.

## Lead fixes

- The human asked for no headed Chrome on the screen during unattended runs. The lead added
  `const headless = process.env['DEMO_HEADLESS'] === '1'` to `playwright.demo.config.ts`. The
  default stays headed (J1). `DEMO_HEADLESS=1 npm run demo` records the same videos with no
  window. The `[J1]` test checks the switch.
- The four static tests [I4] [I6] [J1] [J2] open no page, so they have no video. This is
  accepted: they check files, not behaviour.
