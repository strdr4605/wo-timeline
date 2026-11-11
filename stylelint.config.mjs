/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard-scss'],
  ignoreFiles: ['dist/**', 'storybook-static/**', 'docs/**'],
  rules: {
    // Class names use BEM: block__element--modifier, each part in kebab-case.
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$',
      { message: (selector) => `Expected class selector "${selector}" to be BEM in kebab-case` },
    ],

    // The design data writes colours in six digits. The tokens copy them as they are.
    'color-hex-length': 'long',

    // Prettier breaks long expressions after the operator. Formatting belongs to Prettier.
    'scss/operator-no-newline-after': null,
  },
};
