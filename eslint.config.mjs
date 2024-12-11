import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import tsDocEslint from 'eslint-plugin-tsdoc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'tsdoc': tsDocEslint,
    },

    languageOptions: {
      parser: tsParser,
    },

    rules: {
      semi: ['error', 'always'],
      indent: ['error', 2],
      'lines-between-class-members': ['error', 'always'],
      '@typescript-eslint/member-ordering': ['error', {
        default: {
          order: 'alphabetically',

          memberTypes: [
            'public-static-field',
            'public-instance-field',
            'public-constructor',
            'private-static-field',
            'private-instance-field',
            'private-constructor',
            'public-instance-method',
            'protected-instance-method',
            'private-instance-method',
          ],
        },
      }],
      'tsdoc/syntax': 'error',
    },
  },
];
