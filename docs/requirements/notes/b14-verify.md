# b14-verify (unit b14-storybook, I11)

Date 2026-11-11. Node 26.13.0 (`/opt/homebrew/bin`). Headless Chromium only.

## Checks

- pins-exact pass - `storybook` 10.6.5, `@storybook/angular` 10.6.5, `@angular-devkit/build-angular` 20.3.42, `@angular/platform-browser-dynamic` 20.3.35, no range prefix; installed versions match - package.json, node_modules
- pins-angular20 pass - `@storybook/angular@10.6.5` peers `@angular/core >=18 <23`, `@angular-devkit/build-angular >=18 <23`; app has core 20.3.35, build 20.3.42; `npm ls` no invalid or missing - `npm view @storybook/angular@10.6.5 peerDependencies`
- pins-age-storybook pass - `storybook` and `@storybook/angular` 10.6.5 released 2026-10-27 (15 days) - `npm view time`
- pins-age-build-angular pass (edge) - `@angular-devkit/build-angular` 20.3.42 released 2026-10-28T09:53Z, 14 days on 2026-11-11 - `npm view time`
- pins-age-platform-browser-dynamic fail - 20.3.35 released 2026-11-02T22:11Z, 9 days old, less than two weeks. It must equal `@angular/core` 20.3.35, which the repo had before this unit (core 20.3.35 also released 2026-11-02). Rule conflict, lead decision - `npm view @angular/platform-browser-dynamic time`
- peer-animations note - `@angular/animations` is a listed peer and is not installed; npm reports no error and the build works
- build-storybook pass - `npm run build-storybook` exit 0, "Storybook build completed successfully", no warnings except a Node `DEP0205` deprecation; `index.json` has the 8 ids `timeline-work-order-bar--{open,in-progress,complete,blocked}`, `timeline-timescale-chip--{closed,open-menu}`, `timeline-work-order-drawer--{create,edit}` - storybook-static/index.json
- render-headless pass - each `iframe.html?id=<id>` served from storybook-static by a local static server, headless Playwright: 0 page errors, 0 console errors, 0 failed requests in all 8; body background rgb(247,249,252) = `$color-surface-page`, body font `Circular-Std`, Circular font faces loaded - scratchpad sb-render.mjs, screenshots
- bar-open pass - bar fill rgb(242,254,255) = `#f2feff`, border `#cefbff`, badge `#e4fdff` / text `#00b0bf`, 342x38 px, absolute in row - computed style
- bar-in-progress pass - fill rgb(237,238,255), badge rgb(214,216,255) / text rgb(62,64,219) - computed style
- bar-complete pass - fill `#f8fff3`, border `#d1fab3`, badge `#e1ffcc` / text `#08a268` - computed style
- bar-blocked pass - fill `#fffcf1`, border `#fff5cf`, badge `#fceeb5` / text `#b13600`; screenshot shows name and badge in Circular Std - computed style, screenshot
- chip-closed pass - chip white, `Circular-Std`, no `.timescale-menu` - computed style
- chip-open-menu pass - `.timescale-menu` visible, items Hour, Day, Week, Month, Month selected - screenshot
- drawer-create pass - `.drawer--open`, white, right 0, 591 px, date values 12.11.2026 / 05.11.2026, primary button "Create" - computed style
- drawer-edit pass - `.drawer--open`, name "Concentrix Ltd", status Complete, dates 22.02.2027 / 18.10.2026, primary button "Save" - screenshot
- real-components pass - stories import `WorkOrderBar`, `TimescaleChip`, `WorkOrderDrawer` from the app and sample data from `src/app/data/sample-data.ts`; no copies - stories files
- global-styles pass - `angular.json` storybook targets have styles `src/styles.scss` + `.storybook/story-frame.scss`; `story-frame.scss` uses tokens only; fonts served from `storybook-static/fonts` (browserTarget assets) - angular.json, storybook-static/fonts
- app-build pass - `npm run build` exit 0, no warnings; no "stories"/"storybook" string in dist; content of `main` and `polyfills` bundles byte-identical (sha1) to a build of the parent commit 1da5afc; only the hash file names differ (build path in hash), `styles-GT6XJ7UY.css` same name - shasum diff
- tsconfig-app-exclude pass - `tsconfig.app.json` exclude has `src/**/*.stories.ts` - jj diff
- vitest-no-stories pass - `vitest.config.ts` unchanged, include `tests/unit/**/*.spec.ts`; `npx vitest list` has no stories file - vitest
- playwright-config pass - `jj diff --stat playwright.config.ts vitest.config.ts`: 0 files changed - jj
- I11-e2e pass - test runs, not skipped: with storybook-static present 1 passed; with storybook-static moved away 1 passed (ids made from the stories files). No `skip`/`fixme`. Limit: the test is static; it checks ids, scripts, pins (`storybook`, `@storybook/angular` only), styles, outputDir, ignore, excludes. It does not render a story and does not check the two Angular peer pins - tests/e2e/storybook.spec.ts
- gitignore pass - `git check-ignore -v storybook-static/index.json` -> `.gitignore:14:storybook-static/` - git
- pixel Schedule - Default pass - masks 437,249,463,38;556,352,463,38;945,352,463,38;677,401,533,38;715,330,25,25, `--max=0.2`: mismatch 0.2%, exit 0. No app source file changed in this unit - scripts/pixel-check.mjs
- npm run build pass - exit 0 - see app-build
- npx vitest run pass - 5 files, 31 passed
- npx playwright test pass - 87 passed (17.6s)
- code pass - top-down order in stories and spec (helpers at bottom), tokens in story-frame.scss, no change outside unit except acceptance-criteria I11 row and new source `lead` - jj diff
- note - drawer shows "End date" above "Start date"; drawer template not changed in this unit, not a b14 issue

## Failures

- pins-age-platform-browser-dynamic - `@angular/platform-browser-dynamic` 20.3.35 released 2026-11-02, 9 days old (rule: older than two weeks). Version is forced by `@angular/core` 20.3.35, which was already in the repo. Lead to accept or ask for a downgrade of all `@angular/*` to 20.3.34 (2026-10-14).

## Lead decision

- Accept the failure. `@angular/platform-browser-dynamic` must have the same version as the
  installed `@angular/core` (20.3.35). The two-week age rule is a lead rule for new libraries.
  It does not apply to a peer package that must match a version the app already uses.
