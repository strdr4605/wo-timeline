import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Unit r4-ci. CI runs this suite against the Pages build at /wo-timeline/ (BASE_URL), locally it
// runs against the dev server. The paths are relative, so both bases work.

test.use({ viewport: { width: 1440, height: 1024 } });

test('[R4] CI tests and deploys the Pages build; a deep link and an unknown path get the app', async ({
  page,
}) => {
  await test.step('deep link to parity mode', async () => {
    await page.goto('./?parity=1');
    await expect(page.locator('img.logo')).toBeVisible();
    await expect(page.locator('.work-order-bar')).toHaveCount(4);
    expect(
      await page.locator('img.logo').evaluate((img: HTMLImageElement) => img.naturalWidth),
    ).toBe(80);
  });

  await test.step('unknown path', async () => {
    await page.goto('./no/such/page');
    await expect(page.locator('img.logo')).toBeVisible();
    await expect(page.locator('.grid')).toBeVisible();
  });

  await test.step('workflow', async () => {
    const workflow = read('.github/workflows/ci.yml');

    // The chain: lint, unit, build, e2e, deploy. Deploy runs only on a push to main.
    expect(workflow).toMatch(/unit:\n\s+needs: lint\n/);
    expect(workflow).toMatch(/build:\n\s+needs: unit\n/);
    expect(workflow).toMatch(/e2e:\n\s+needs: build\n/);
    expect(workflow).toMatch(
      /deploy:\n\s+needs: e2e\n\s+if: github.event_name == 'push' && github.ref == 'refs\/heads\/main'\n/,
    );

    expect(workflow).toContain('npx ng build --base-href /wo-timeline/');
    expect(workflow).toContain('--output-dir dist/wo-timeline/browser/storybook');
    expect(workflow).toContain('BASE_URL: http://localhost:4300/wo-timeline/');
    expect(workflow).toContain('npx playwright install --with-deps chromium');
    expect(workflow).toContain('actions/upload-pages-artifact');
    expect(workflow).toContain('actions/deploy-pages');
    expect(workflow).toContain(
      'cp dist/wo-timeline/browser/index.html dist/wo-timeline/browser/404.html',
    );
    expect(workflow).toMatch(/node-version-file: \.nvmrc\n\s+cache: npm/);
    expect(read('.nvmrc').trim()).toBe('22');
    expect(JSON.parse(read('package.json')).engines.node).toBe('^22.12.0 || ^24.0.0 || >=26.0.0');

    // The fonts load from the app folder, not from the site root.
    expect(read('src/index.html')).not.toMatch(/url\('\/fonts\//);
  });
});

function read(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8');
}
