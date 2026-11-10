import { expect, test } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Unit b14-storybook: a static check. A Storybook build takes too long for test:all, so the test
// reads the story ids from storybook-static/index.json when a build exists, and from the stories
// files when it does not. It needs no page and no Storybook server.

const EXPECTED_STORY_IDS = [
  'timeline-work-order-bar--open',
  'timeline-work-order-bar--in-progress',
  'timeline-work-order-bar--complete',
  'timeline-work-order-bar--blocked',
  'timeline-timescale-chip--closed',
  'timeline-timescale-chip--open-menu',
  'timeline-work-order-drawer--create',
  'timeline-work-order-drawer--edit',
];

const STORY_FILES = [
  'src/app/work-order-bar/work-order-bar.stories.ts',
  'src/app/timescale-chip/timescale-chip.stories.ts',
  'src/app/work-order-drawer/work-order-drawer.stories.ts',
];

test('[I11] Storybook has stories for each bar status, the timescale chip and the drawer, outside the app build', () => {
  expect(storyIds()).toEqual(expect.arrayContaining(EXPECTED_STORY_IDS));

  // The stories use the real components.
  expect(read(STORY_FILES[0])).toMatch(/component: WorkOrderBar/);
  expect(read(STORY_FILES[1])).toMatch(/component: TimescaleChip/);
  expect(read(STORY_FILES[2])).toMatch(/component: WorkOrderDrawer/);

  const pkg = JSON.parse(read('package.json'));
  expect(pkg.scripts['storybook']).toBe('ng run wo-timeline:storybook');
  expect(pkg.scripts['build-storybook']).toBe('ng run wo-timeline:build-storybook');
  for (const name of ['storybook', '@storybook/angular']) {
    expect(pkg.devDependencies[name]).toMatch(/^\d+\.\d+\.\d+$/);
  }

  // Storybook builds with the global styles of the app, into an ignored folder.
  const architect = JSON.parse(read('angular.json')).projects['wo-timeline'].architect;
  expect(architect['build-storybook'].options.styles).toContain('src/styles.scss');
  expect(architect['build-storybook'].options.outputDir).toBe('storybook-static');
  expect(read('.gitignore')).toMatch(/^storybook-static\/$/m);

  // The app build, vitest and Playwright do not pick up the stories.
  expect(read('tsconfig.app.json')).toContain('"src/**/*.stories.ts"');
  expect(read('vitest.config.ts')).toMatch(/include: \['tests\/unit\/\*\*\/\*\.spec\.ts'\]/);
  expect(read('playwright.config.ts')).toMatch(/testDir: '\.\/tests\/e2e'/);
});

/** The ids of the Storybook build, or the ids that Storybook makes from the stories files. */
function storyIds(): string[] {
  const index = join(process.cwd(), 'storybook-static/index.json');
  if (existsSync(index)) {
    const entries = JSON.parse(readFileSync(index, 'utf8')).entries as Record<string, unknown>;
    return Object.keys(entries);
  }

  return STORY_FILES.flatMap((file) => {
    const source = read(file);
    const title = source.match(/title: '([^']+)'/)![1];
    const exports = [...source.matchAll(/^export const (\w+): Story/gm)].map((match) => match[1]);
    return exports.map((name) => `${idPart(title)}--${idPart(startCase(name))}`);
  });
}

/** The id rule of Storybook: lower case, every run of other characters becomes one dash. */
function idPart(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Storybook names a story from its export: `InProgress` becomes `In Progress`. */
function startCase(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}

function read(file: string): string {
  return readFileSync(join(process.cwd(), file), 'utf8');
}
