import type { StorybookConfig } from '@storybook/angular';

// Stories sit next to their components. The app build and vitest do not read them.
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.ts'],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
};

export default config;
