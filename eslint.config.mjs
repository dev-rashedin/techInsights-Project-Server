// eslint.config.mjs
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import jsonPlugin from '@eslint/json';
import prettierRecommendedPkg from 'eslint-plugin-prettier/recommended';

const prettierRecommended =
  prettierRecommendedPkg?.config ?? prettierRecommendedPkg;

export default tseslint.config(
  // ESLint base config
  eslint.configs.recommended,

  // TypeScript config
  tseslint.configs.recommended,

  // Custom rules
  {
    rules: {
      eqeqeq: 'off',
      'no-console': 'warn',
      'no-undef': 'error',
      'no-unused-vars': 'error',
      'no-unused-expressions': 'error',
      'prefer-const': ['error', { ignoreReadBeforeAssign: true }],
    },
  },

  // Add Node.js globals
  {
    languageOptions: {
      globals: globals.node,
    },
  },

  // JSON/JSONC file support
  {
    files: ['**/*.json', '**/*.jsonc'],
    plugins: { json: jsonPlugin },
    rules: {},
  },

  // Prettier integration
  prettierRecommended,

  // Files to ignore
  {
    ignores: ['node_modules/', 'dist/', 'build/'],
  }
);
