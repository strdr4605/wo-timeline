import { copyFileSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

// Gives each demo video a name that a human can find: <item id>-<title>.webm, for example
// C1-the-bar-starts-at-the-start-date-and-ends-at-the-end-date.webm. A run with -g overwrites
// only the videos of the tests that it runs.

export default class VideoReporter implements Reporter {
  private readonly outDir: string;

  constructor(options: { outDir: string }) {
    this.outDir = options.outDir;
  }

  onBegin(): void {
    mkdirSync(this.outDir, { recursive: true });
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const video = mainVideo(result);
    if (!video) return;

    copyFileSync(video, join(this.outDir, `${videoName(test.title)}.webm`));
  }
}

// A test can open more pages (the axe check does), and each page gets a video. The test page
// records the longest, so its file is the largest.
function mainVideo(result: TestResult): string | undefined {
  const paths = result.attachments
    .filter((a) => a.name === 'video' && a.path)
    .map((a) => a.path as string);

  return paths.sort((a, b) => statSync(b).size - statSync(a).size)[0];
}

function videoName(title: string): string {
  const id = title.match(/\[([A-Z]\d+)\]/)?.[1] ?? 'no-id';
  const rest = title
    .replace(/\[[A-Z]\d+\]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
    .replace(/-$/, '');

  return `${id}-${rest}`;
}
