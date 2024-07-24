const globals = require('globals');

const baseConfig = require('@m-thalmann/eslint-config-base');
const angularConfig = require('@m-thalmann/eslint-config-angular');
const prettierConfig = require('eslint-config-prettier');

/** @type {import("eslint").Linter.Config[]} */
module.exports = [
  {
    ignores: ['dist', '.angular', '**/jest.config.ts', '**/test-setup.ts'],
  },

  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },

  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.base.json', './apps/*/tsconfig*.json'],
        tsconfigRootDir: __dirname,
      },
    },
  },

  ...baseConfig,
  ...angularConfig,

  {
    files: ['**/index.html'],
    rules: {
      '@angular-eslint/template/prefer-self-closing-tags': 'off',
    },
  },

  prettierConfig,
];
