# Work Order Schedule Timeline

[![CI](https://github.com/strdr4605/wo-timeline/actions/workflows/ci.yml/badge.svg)](https://github.com/strdr4605/wo-timeline/actions/workflows/ci.yml)
[![e2e](https://img.shields.io/endpoint?url=https://strdr4605.github.io/wo-timeline/badges/e2e.json)](https://github.com/strdr4605/wo-timeline/actions/workflows/ci.yml)
[![unit](https://img.shields.io/endpoint?url=https://strdr4605.github.io/wo-timeline/badges/unit.json)](https://github.com/strdr4605/wo-timeline/actions/workflows/ci.yml)

[Live app](https://strdr4605.github.io/wo-timeline/) ·
[Storybook](https://strdr4605.github.io/wo-timeline/storybook/)

WO Timeline is a work-order schedule timeline. It is an Angular app.

The app shows the work centres in a fixed column on the left. It shows the work orders of each
work centre as bars on a timeline.

## Features

- Change the timescale: Hour, Day, Week or Month. Month is the default.
- Click an empty cell to create a work order. A drawer opens with the date of the click as the
  start date.
- Use the three-dot menu of a bar to edit or delete the order.
- Drag a bar end to change the dates of the order. The arrow keys also do this.
- Move the pointer on a bar to see a tooltip with the name, the status and the dates.
- Scroll the timeline to the left or to the right without limit.
- Click the Today button to go back to the current date.
- Drag the edge of the work centre column to change its width.
- The app saves the work orders and the column width in `localStorage`. They stay after a
  reload.

The app rejects an order that overlaps another order of the same work centre. The drawer then
shows an error message.

### URL options

| Option       | Effect                                                                                                                                          |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `?demo=1`    | Shows demo controls: load 5,000 orders, load 50 work centres, reset the data. A badge shows the bars and columns in the DOM and the frame time. |
| `?virtual=0` | Turns off the column and bar windowing. The grid then renders every column and every bar.                                                       |
| `?parity=1`  | Renders the fixed view of the design: September 2024 as today, design data, no `localStorage`.                                                  |

Parity mode is a test hook, not a product feature. It hides the controls that the design does
not show, for example the Today button. Refer to `src/app/parity.ts`.

## Requirements

| Tool    | Version                                                                 |
| ------- | ----------------------------------------------------------------------- |
| Node.js | The version in `.nvmrc` (22). `package.json` `engines` holds the range. |
| npm     | The version that comes with Node.js.                                    |

Playwright needs its Chromium browser. Install it one time:

```bash
npx playwright install chromium
```

## Set up and run

Use the Node.js version of `.nvmrc`:

```bash
nvm use
```

Install the dependencies from the lock file:

```bash
npm ci
```

Start the dev server:

```bash
npm start
```

Open <http://localhost:4200>.

## Tests

| Command               | What it does                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `npx vitest run`      | Runs the unit tests in `tests/unit/`. `npm run test:unit` does the same.                                           |
| `npx playwright test` | Runs the end-to-end tests in `tests/e2e/`, headless, in Chromium at 1440 x 1024. `npm run test:e2e` does the same. |
| `npm run test:all`    | Runs `npm run build`, the unit tests and the end-to-end tests, in that sequence.                                   |

The end-to-end tests use the dev server on port 4200. When no server answers, Playwright starts
one. When `BASE_URL` is set, Playwright starts no server and tests that URL. CI uses this to test
the production build.

## Lint

| Command                | What it does                                             |
| ---------------------- | -------------------------------------------------------- |
| `npm run lint`         | Runs the three checks below.                             |
| `npm run lint:ts`      | ESLint with `angular-eslint` on the TypeScript and HTML. |
| `npm run lint:scss`    | Stylelint with `stylelint-config-standard-scss`.         |
| `npm run format:check` | Prettier check. `npm run format` writes the fixes.       |

## Storybook

| Command                   | What it does                                        |
| ------------------------- | --------------------------------------------------- |
| `npm run storybook`       | Starts Storybook on <http://localhost:6006>.        |
| `npm run build-storybook` | Builds a static Storybook into `storybook-static/`. |

The stories show the bar (one story for each status), the timescale chip and the drawer.

## CI and GitHub Pages

`.github/workflows/ci.yml` runs on each pull request and on each push to `main`. The jobs run
in this sequence:

1. `lint`: `npm run lint`.
2. `unit`: Vitest. The job writes the test count badge.
3. `build`: the app with the base path `/wo-timeline/`, and Storybook under `storybook/`. The
   job copies `index.html` to `404.html`, so that a deep link gets the app.
4. `e2e`: Playwright against the production build. `tools/serve-pages.mjs` serves the build
   at `/wo-timeline/` the same way as GitHub Pages. The job writes the test count badge.
5. `deploy`: only on a push to `main`. The job publishes the site and the badges to GitHub
   Pages.

`tools/badge.mjs` turns a test report into a shields.io endpoint JSON file.

## Approach

### Code structure

| Folder or file                 | Contents                                                                                                 |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `src/app/app.ts`               | The page: top bar, timescale, Today button, drawer state.                                                |
| `src/app/timeline/timeline.ts` | The date maths of the columns: one column for each hour, day, week or month, and the position of a date. |
| `src/app/timeline-grid/`       | The work centre column, the header, the grid, the today line, scroll and windowing.                      |
| `src/app/work-order-bar/`      | One bar: name, status badge, tooltip, three-dot menu, resize handles.                                    |
| `src/app/timescale-chip/`      | The Timescale dropdown.                                                                                  |
| `src/app/work-order-drawer/`   | The create and edit drawer. `drawer-form.ts` holds the form defaults and the date format.                |
| `src/app/data/`                | Sample data, the overlap function and `ScheduleService` (the store).                                     |
| `src/app/demo.ts`              | The `?demo=1` and `?virtual=0` options.                                                                  |
| `src/app/parity.ts`            | Parity mode and its fixed data.                                                                          |
| `src/app/keyboard.ts`          | The keyboard model that the bar menu and the timescale menu share.                                       |
| `src/styles/`                  | Global SCSS and the design tokens. `_tokens.scss` is generated from `tokens.json`.                       |
| `tools/`                       | Node scripts: token generator, Pages server for CI, badge writer.                                        |

### Decisions

- **Standalone components and signals.** `ScheduleService` keeps the state in signals. The
  components read it with `computed`. Every component uses `ChangeDetectionStrategy.OnPush`.
  The templates track list items by a stable key, not by `$index`.
- **Design tokens.** `src/styles/tokens.json` holds the colours, sizes and fonts of the design.
  `npm run tokens` writes `src/styles/_tokens.scss` from it. The components use only token
  variables, not colour or size literals. A unit test makes sure that the SCSS and the JSON
  agree.
- **Overlap rule.** `overlaps()` in `src/app/data/overlap.ts` is a pure function. Two orders
  overlap when they are on the same work centre and their date ranges touch. Both dates are
  working days. Thus an order that ends on the start day of another order is an overlap. An
  edit ignores the order that you edit.
- **localStorage.** The keys are `wo-timeline.workOrders.v1` and `wo-timeline.railWidth.v1`.
  Parity mode does not use the storage.
- **Infinite scroll with logical offsets.** The grid keeps its range as two column offsets from
  today, not as an array of columns. A function builds a column from the timescale, today and
  the offset. When you scroll near an edge, the range grows. When the grid adds columns on the
  left, it moves the scroll position by the same width. Thus the view does not jump.
- **Windowing.** The grid uses a custom window with signals, not the CDK virtual scroll. The
  reason: the bars have an absolute position and go across many columns. A scroll signal gives
  the visible columns plus a buffer. Only the header cells, the grid columns and the bars in that
  window are in the DOM. A spacer keeps the full scroll width. The focused bar, the bar in a drag
  and the bar of the open drawer always stay in the DOM.
- **Accessibility.** The controls have accessible names. The bars and the menus work with the
  keyboard. The drawer keeps the focus while it is open. An axe test runs on the page and on the
  drawer. Some text colours of the design have a contrast below 4.5:1. The app keeps them to
  match the design. The axe test excludes only the `color-contrast` rule for them.
- **Default timescale is Month.** All the design screens show Month.

## Libraries

| Library                                             | Reason                                                                              |
| --------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `@angular/*` 20.3                                   | Standalone components, signals and TypeScript strict mode.                          |
| `@angular/forms`                                    | The drawer form uses Reactive Forms (`FormGroup`, `FormControl`, `Validators`).     |
| `@ng-bootstrap/ng-bootstrap` 19.0.1                 | `ngb-datepicker` for the start date and the end date.                               |
| `@popperjs/core` 2.11.8                             | Peer dependency of ng-bootstrap. It puts the datepicker popup in position.          |
| `@angular/localize`                                 | ng-bootstrap needs `$localize`. `angular.json` loads it as a polyfill.              |
| `@ng-select/ng-select` 20.7.0                       | The status field. The app styles it as the pill of the design.                      |
| `rxjs`, `zone.js`, `tslib`                          | Runtime dependencies of Angular.                                                    |
| `vitest` 5.1.0                                      | Fast unit tests for the pure functions without a browser.                           |
| `@playwright/test`, `playwright` 1.65.0             | End-to-end tests in a headless Chromium.                                            |
| `@axe-core/playwright`                              | Accessibility checks in the end-to-end tests.                                       |
| `storybook`, `@storybook/angular` 10.6.5            | Stories for the bar, the timescale chip and the drawer.                             |
| `eslint`, `angular-eslint`, `stylelint`, `prettier` | Lint and format checks.                                                             |
| `pixelmatch`, `pngjs`                               | Local screenshot comparison with the design. That script is not in this repository. |
| `typescript` 5.9                                    | The language of the app, in strict mode.                                            |

## AI workflow

AI coding agents built this app. A lead agent gave one unit of work to one builder agent. A
fresh verifier agent checked each unit before the commit. [AI-PROMPTS.md](AI-PROMPTS.md) shows
sample prompts.

## Trade-offs and known limits

- **Font.** The app uses the Circular Std font. The font files have a licence, so they are not
  in this repository. The app loads the font from a CDN. When the CDN is not available, the
  browser uses a fallback font.
- **Month view with many orders.** With `?demo=1` and 5,000 orders, the windowing in the Month
  view is slower than no windowing (frame median about 65 to 117 ms with windowing, 17 ms
  without). Each move of the window renders about 2,800 bars again. The extension of the range
  at an edge also causes a style recalculation.
- **Rows.** The windowing applies to columns and bars only. The work centre rows are not
  windowed.
- At 375 px width, the page keeps the 101 px left gutter of the design. The drawer subtitle
  wraps to 2 lines.
- The Hour timescale uses the Day column width. A resize snaps to whole days in every
  timescale, also in Hour. The reason: the orders store dates as `yyyy-mm-dd`.
- The resize zone at each bar end is 8 px. A wider zone would block the click on the
  three-dot menu.
- The Today button is not in the design. Parity mode hides it.
