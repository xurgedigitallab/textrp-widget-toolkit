/*
 * Copyright 2024 Nordeck IT + Consulting GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { fixupPluginRules } from '@eslint/compat';
import js from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import notice from 'eslint-plugin-notice';
import pluginPromise from 'eslint-plugin-promise';
import react from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';
import testingLibrary from 'eslint-plugin-testing-library';
import path from 'path';
import ts from 'typescript-eslint';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default ts.config(
  {
    ignores: [
      '**/lib/**',
      '**/build/**',
      '**/craco.config.js',
      '**/i18next-parser.config.js',
      'scripts/prepack.js',
      'scripts/postpack.js',
      'scripts/publishAllPackages.js',
    ],
  },
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  pluginPromise.configs['flat/recommended'],
  {
    plugins: {
      notice,
    },
    rules: {
      'notice/notice': [
        'error',
        {
          templateFile: path.resolve(__dirname, './scripts/license-header.txt'),
          onNonMatchingHeader: 'replace',
          templateVars: { NAME: 'Nordeck IT + Consulting GmbH' },
          varRegexps: { NAME: /.+/ },
        },
      ],
      // Disable for the migration to prevent a lot of errors.
      // Should be revisisted
      '@typescript-eslint/ban-types': 'off',
    },
  },
  {
    ...react.configs.flat.recommended,
    plugins: {
      ...react.configs.flat.recommended.plugins,
      'react-hooks': fixupPluginRules(hooksPlugin),
    },
    rules: {
      ...hooksPlugin.configs.recommended.rules,
      ...react.configs.flat.recommended.rules,
      'react/no-unescaped-entities': 'off',
      // Disabled because it would conflict with removing unused imports
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': [
        'error',
        {
          ignore: [
            // Suppress weird error messages
            'children',
          ],
        },
      ],
    },
  },
  // mui package specific rules
  {
    files: ['packages/mui/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.name='useTranslation'][arguments.0.value!='widget-toolkit']",
          message:
            'useTranslation() must be invoked with the "widget-toolkit" namespace arg: useTranslation("widget-toolkit")',
        },
        {
          selector:
            "JSXElement[openingElement.name.name='Trans']:not(:has(JSXAttribute[name.name='ns'][value.value!='widget-toolkit']))",
          message:
            '<Trans> must be used with the "widget-toolkit" "ns" prop: <Trans … ns="widget-toolkit" … >',
        },
      ],
    },
  },
  // Relax some rules for test files only
  {
    files: ['**/*.test.*'],
    plugins: {
      vitest,
      // See https://github.com/testing-library/eslint-plugin-testing-library/issues/899#issuecomment-2121272355 and
      // https://github.com/testing-library/eslint-plugin-testing-library/issues/924
      'testing-library': fixupPluginRules({
        rules: testingLibrary.rules,
      }),
    },
    rules: {
      ...vitest.configs.recommended.rules,
      ...testingLibrary.configs['flat/react'].rules,
      'react/display-name': 'off',
    },
  },
  eslintConfigPrettier,
);
