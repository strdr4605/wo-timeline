# b14-storybook (I11)

## What changed

- devDependencies, exact pins: `storybook` 10.6.5 and `@storybook/angular` 10.6.5 (released
  2026-10-27), `@angular-devkit/build-angular` 20.3.42 (released 2026-10-28, same version as
  `@angular/build`), `@angular/platform-browser-dynamic` 20.3.35 (same version as `@angular/core`).
  The last two are peer dependencies of `@storybook/angular`.
- `angular.json`: targets `storybook` and `build-storybook` (builder `@storybook/angular`,
  `browserTarget` `wo-timeline:build`, compodoc off, styles `src/styles.scss` and
  `.storybook/story-frame.scss`, output `storybook-static`). The old trailing comma after
  `extract-i18n` is gone, so the file is now strict JSON.
- `package.json` scripts: `storybook`, `build-storybook`.
- `.storybook/`: `main.ts` (stories `src/**/*.stories.ts`, telemetry off), `preview.ts`,
  `tsconfig.json`, `preview-head.html` (the Circular Std font faces of `src/index.html`, with
  relative URLs; Storybook does not use `src/index.html`), `story-frame.scss` (one grid row with
  the month column width from the tokens, because the bar takes its place from the grid).
- Stories, with the real components and `src/app/data/sample-data.ts`:
  - `work-order-bar.stories.ts`: Open, InProgress, Complete, Blocked (first sample order of each
    status).
  - `timescale-chip.stories.ts`: Closed, OpenMenu (a `play` function clicks the chip; the menu
    state is internal).
  - `work-order-drawer.stories.ts`: Create, Edit.
- `tsconfig.app.json` excludes `src/**/*.stories.ts`. `.gitignore` has `storybook-static/`.
- `tests/e2e/storybook.spec.ts`: `[I11]`. Static. It reads the ids from
  `storybook-static/index.json` when a build exists, else it makes the ids from the stories files
  with the Storybook id rule. Both paths checked (with and without the build). It also checks the
  scripts, the pins, the styles, the output dir, the ignore and the exclude.
- `acceptance-criteria.md` / `.json`: new item I11 and new source `lead`. `verify.mjs` set it to
  pass.

## Checks

- `npm run build-storybook`: success. `index.json` has the 8 ids:
  `timeline-work-order-bar--{open,in-progress,complete,blocked}`,
  `timeline-timescale-chip--{closed,open-menu}`, `timeline-work-order-drawer--{create,edit}`.
- Each story rendered headless with Playwright from a static server of `storybook-static`: no
  page or console errors, Circular Std font, status colours, open menu, drawer create and edit.
- `npm run build`: clean, no stories in `dist`. `npx vitest run`: 31 passed.
  `npx playwright test`: 87 passed. `verify.mjs`: 70 pass, 5 pending (unchanged pending).

## Pixel check

`Schedule - Default` with the bar masks: mismatch 0.21% before, 0.21% after. No app file changed.

## Open points

- `npm install` warns about install scripts that need approval (`esbuild`, `lmdb`,
  `@parcel/watcher`, `msgpackr-extract`, `fsevents`). The Storybook build works without them.
- `npm audit` reports 25 issues in the new dev tree (webpack based). Dev only.
