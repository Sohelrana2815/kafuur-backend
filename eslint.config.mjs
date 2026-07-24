import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  // Explicitly set the files for all configurations to target only src
  {
    files: ['src/**/*.{js,ts}'],
    languageOptions: {
      sourceType: "module",
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strict,
      ...tseslint.configs.stylistic,
    ],
    rules: {
      "no-console": "warn",
      "no-unused-vars": "error",
    }
  }
]);