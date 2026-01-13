import pluginOxlint from 'eslint-plugin-oxlint';
import pluginVue from 'eslint-plugin-vue';
import eslintPluginVueScopedCSS from 'eslint-plugin-vue-scoped-css';
import { globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';

export default [
  globalIgnores(['**/dist/**', '**/tests/**', '**/coverage/**']),
  { languageOptions: { globals: globals.browser } },
  ...eslintPluginVueScopedCSS.configs['flat/recommended'],
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  ...pluginOxlint.configs['flat/recommended'],
  {
    files: ['*.vue', '**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: { parser: tseslint.parser, sourceType: 'module' },
    },
    rules: {
      'vue/multi-word-component-names': [
        'error',
        {
          ignores: ['Home', 'Record', 'User', 'Accounts', 'Dashboard', 'Norms'],
        },
      ],
    },
  },
];
