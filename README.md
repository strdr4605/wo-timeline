# Work Order Schedule Timeline

This repository contains the Naologic front-end take-home: a Work Order Schedule Timeline.
The brief is `FE-technical-test-10-2026.md`.

The app shows work centres in a fixed column on the left. It shows the work orders of each work
centre as bars on a timeline. You can do these tasks:

- Change the timescale: Hour, Day, Week or Month. Month is the default.
- Click an empty cell to create a work order. A drawer opens with the start date of the click.
- Use the three-dot menu of a bar to edit or delete the order.
- Drag a bar end to change the dates of the order.

The app rejects an order that overlaps another order of the same work centre. It shows an error
message in the drawer.

## Requirements

| Tool | Version |
|---|---|
| Node.js | 22.12 or later. Tested with 26.13.0. |
| npm | Tested with 11.20.0. |

The repository has no `.nvmrc` file and no `engines` field in `package.json`. The minimum comes
from the dependencies: Vitest 5.1.0 needs Node `^22.12.0 || ^24.0.0 || >=26.0.0`, and Angular
20.3 needs Node `^20.19.0 || ^22.12.0 || >=24.0.0`.

Playwright needs its Chromium browser. Install it one time:

```bash
npx playwright install chromium
```

## Setup and run

```bash
npm install
npm start
```

`npm start` runs `ng serve --port 4200`. Open <http://localhost:4200>.

### Parity mode

Open <http://localhost:4200/?parity=1> to see the view of the Sketch artboards.

The artboards show August 2024 to March 2025, with September 2024 as the current month. Parity
mode makes the app render the same view, so that a screenshot can be compared with the artboard
pixel by pixel. In parity mode, the app:

- uses 2024-09-01 as today;
- starts the timeline at August 2024 and keeps a fixed range of columns;
- uses the work orders of the artboard, not the sample data;
- does not read or write `localStorage`;
- hides controls that the design does not show (for example the Today button);
- renders every column (no virtualization).

Parity mode is a test hook, not a product feature. Refer to `docs/requirements/DESIGN-PARITY.md`
and `src/app/parity.ts`.

## Tests

The Playwright suite uses the dev server on port 4200. When no server answers, Playwright
starts one with `npm run start`.

| Command | What it does |
|---|---|
| `npm run build` | Builds the app into `dist/`. |
| `npx vitest run` | Runs the unit tests in `tests/unit/` (date maths, overlap, sample data, tokens, drawer form). |
| `npx playwright test` | Runs the end-to-end tests in `tests/e2e/`, headless, in Chromium at 1440 x 1024. |
| `npm run test:all` | Runs the three commands above, in that sequence. |
| `DEMO_HEADLESS=1 npm run demo` | Runs the suite with `playwright.demo.config.ts` (slow motion, one video for each requirement test, in `docs/demo/videos/`). Without `DEMO_HEADLESS=1`, a Chrome window opens. |
| `npm run storybook` | Starts Storybook on <http://localhost:6006>. |
| `npm run build-storybook` | Builds a static Storybook into `storybook-static/`. |

The design checks need the dev server on port 4200:

```bash
node scripts/pixel-check.mjs --artboard="Schedule - Default" \
  --mask="437,249,463,38;556,352,463,38;945,352,463,38;677,401,533,38;715,330,25,25"
node docs/requirements/verify.mjs
```

- `scripts/pixel-check.mjs` takes a screenshot of `/?parity=1` and compares it with the artboard
  PNG in `docs/design/assets/`. It prints the mismatch and the layers with the most wrong pixels.
  It writes the images to `.pixel-check/<artboard>/`. The masks hide the bar text, which is
  different from the design text.
- `docs/requirements/verify.mjs` runs Vitest and Playwright. It writes the result of each test
  into `docs/requirements/acceptance-criteria.json` and renders
  `docs/requirements/acceptance-criteria.md`. Each test title holds the item id in brackets,
  for example `[C9]`.

## Approach

### Code structure

| Folder or file | Contents |
|---|---|
| `src/app/app.ts` | The page: top bar, timescale, Today button, drawer state, resize messages. |
| `src/app/timeline/timeline.ts` | The date maths of the columns: one column for each hour, day, week or month, and the position of a date in its column. |
| `src/app/timeline-grid/` | The work centre rail, the header, the grid, the today line, scroll and virtualization. |
| `src/app/work-order-bar/` | One bar: name, status badge, tooltip, three-dot menu, resize handles. |
| `src/app/timescale-chip/` | The Timescale dropdown. |
| `src/app/work-order-drawer/` | The create and edit drawer. `drawer-form.ts` holds the form defaults and the date format. |
| `src/app/data/` | Sample data, the overlap function, and `ScheduleService` (the store). |
| `src/app/parity.ts` | Parity mode and the design fixtures. |
| `src/app/keyboard.ts` | The keyboard model that the bar menu and the timescale menu share. |
| `src/styles/` | Global SCSS. `_tokens.scss` is generated. |

### Decisions

- **Standalone components and signals.** The state is in `ScheduleService` as signals. The
  components read it with `computed`. Every component uses `ChangeDetectionStrategy.OnPush`.
  The templates track list items by a stable key, not by `$index`.
- **Design tokens from the Sketch file.** `docs/design/artboards.json` holds the layer data of
  every artboard. `docs/design/tokens.json` holds the colours, sizes and fonts that the app
  uses. `npm run tokens` writes `src/styles/_tokens.scss` from `tokens.json`. The components use
  only token variables, not colour or size literals. A unit test makes sure that the SCSS and
  the JSON agree.
- **Overlap rule.** `overlaps()` in `src/app/data/overlap.ts` is a pure function. Two orders
  overlap when they are on the same work centre and their date ranges touch. Both dates are
  working days, so an order that ends on the day that another order starts is an overlap. An
  edit ignores the order that you edit.
- **localStorage.** The work orders and the rail width are saved in `localStorage` (keys
  `naologic.workOrders.v1` and `naologic.railWidth.v1`). They stay after a reload. Parity mode
  does not use the storage.
- **Infinite scroll with logical offsets.** The grid keeps its range as two column offsets from
  today (`firstOffset..lastOffset`), not as an array of columns. `columnFor(timescale, today,
  offset)` builds a column. When you scroll near an edge, the range grows. When columns are
  added on the left, the scroll position is moved by the same width, so the view does not jump.
- **Virtualization.** A custom window with signals, not the CDK virtual scroll: the bars are
  absolute and go across many columns. A scroll signal gives the visible columns plus a buffer.
  Only the header cells, the grid columns and the bars in that window are in the DOM. A spacer
  keeps the full scroll width. The focused bar, the bar in a drag and the bar of the open drawer
  always stay in the DOM.
- **Accessibility.** The controls have accessible names. The bars and the menus work with the
  keyboard. The drawer keeps the focus while it is open. An axe test runs on the page and on the
  drawer. Some text colours of the design are below 4.5:1. They are kept for pixel parity and
  are excluded from the `color-contrast` rule only.
- **Default timescale is Month.** The written brief says Day. The owner video, the candidate
  demos and every artboard show Month. Refer to `docs/decisions/2026-11-08-grill-session.md`
  (Q1).

## Libraries

Only the libraries in `package.json` are used.

| Library | Reason |
|---|---|
| `@angular/*` 20.3 | The brief asks for Angular 17 or later, standalone components and TypeScript strict mode. |
| `@angular/forms` | The drawer form uses Reactive Forms (`FormGroup`, `FormControl`, `Validators`), as the brief asks. |
| `@ng-bootstrap/ng-bootstrap` 19.0.1 | The brief asks for `ngb-datepicker` for the start and end dates. |
| `@popperjs/core` 2.11.8 | Peer dependency of ng-bootstrap. It places the datepicker popup. |
| `@angular/localize` | ng-bootstrap needs `$localize`. It is loaded as a polyfill in `angular.json`. |
| `@ng-select/ng-select` 20.7.0 | The brief asks for ng-select for the status field. It is restyled to the design pill. |
| `rxjs`, `zone.js`, `tslib` | Runtime dependencies of Angular. |
| `vitest` 5.1.0 | Fast unit tests for the pure functions (date maths, overlap, data, tokens) without a browser. |
| `@playwright/test`, `playwright` 1.65.0 | End-to-end tests in a headless Chromium, and the demo videos. |
| `@axe-core/playwright` | Accessibility checks in the e2e suite. |
| `pixelmatch`, `pngjs` | `scripts/pixel-check.mjs` compares the app screenshot with the artboard PNG. |
| `storybook`, `@storybook/angular` 10.6.5 | Stories for the bar (one for each status), the timescale chip and the drawer. |
| `typescript` 5.9 | The language of the app, in strict mode. |

## Bonus items done

The full list with evidence is in `docs/requirements/acceptance-criteria.md`.

| Id | Item |
|---|---|
| C7 | Tooltip on bar hover: name, status, full date range. |
| C8, C9 | Drag handles at both bar ends. A drag resizes the order, snapped to days, with checks and keys. |
| D9, D10 | Escape closes the drawer. Tab moves through the fields. |
| F5 | localStorage persistence. |
| H4, H6 | AI prompt log in the repo. |
| I1 | Infinite horizontal scroll. |
| I2 | Today button. |
| I3 | Animations under 300 ms. `prefers-reduced-motion` turns them off. |
| I4 | Automated test suite, headless. |
| I5 | Accessibility: names, keyboard, focus trap, axe. |
| I6 | OnPush and stable track keys. |
| I9 | Virtual scrolling. |
| I10 | Drag or keys resize the work centre column. The width is saved. |
| I11 | Storybook. |
| J1, J2 | Demo config with one video for each requirement test. |

## AI workflow

AI agents built this app. A lead agent gave one unit to one builder agent. A fresh verifier
agent checked each unit before the commit. Sample prompts are in
[AI-PROMPTS.md](AI-PROMPTS.md).

## Known limits

- At 375 px width, the page keeps the 101 px left gutter of the design, and the drawer subtitle
  wraps to 2 lines.
- The Hour timescale uses the Day column width. A resize snaps to whole days in every timescale,
  also in Hour, because the orders store dates as `yyyy-mm-dd`.
- The resize handle zone at each bar end is 8 px. A wider zone would block the click on the
  three-dot menu.
- The "Timeline - Hover Options" artboard is an older mock. Its progress text and its
  "Intrusion" and "Plastic chairs" text are not in the data model, so the app does not show
  them.
- The Today button is not in the design. It is hidden in parity mode.
- `docs/requirements/verify.mjs` prints `unknown item id in test title: P9`. A test title uses
  a design conflict id (`[P9]`), not an item id.
- The static tests `[I4]`, `[I6]`, `[J1]` and `[J2]` open no page, so the demo records no video
  for them.
