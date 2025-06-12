import tseslint from "typescript-eslint"
import astro from "eslint-plugin-astro"
import astroParser from "astro-eslint-parser"

export default tseslint.config(
  {
    ignores: [
      "dist/",
      "node_modules/",
      ".astro/",
      ".wrangler/",
      "worker-configuration.d.ts",
      "*.config.*",
      ".github/",
      "*.yml",
    ],
  },
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "error",
      "no-console": "error",
    },
  },
  {
    files: ["**/*.astro"],
    plugins: {
      astro,
    },
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
)
