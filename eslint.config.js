// @ts-check
const eslint = require('@eslint/js');
const globals = require('globals');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
  // Build output and private working files (gitignored) are not linted.
  {
    ignores: [
      'dist/',
      '.angular/',
      'node_modules/',
      'storybook-static/',
      'playwright-report/',
      'test-results/',
      '.pixel-check/',
      'docs/',
      'tests/demo/',
      'tests/e2e/demo-config.spec.ts',
      'playwright.demo.config.ts',
      'scripts/pixel-check.mjs',
      'scripts/design-diff.mjs',
    ],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {},
  },
  {
    files: ['**/*.mjs', '**/*.js'],
    extends: [eslint.configs.recommended],
    languageOptions: { globals: globals.node },
  },
);
