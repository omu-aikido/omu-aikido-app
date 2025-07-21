import importPlugin from "eslint-plugin-import"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import tseslint from "typescript-eslint"

export default tseslint.config(
  {
    ignores: [
      "node_modules/",
      ".react-router/*",
      ".react-router/",
      ".wrangler/",
      "*.config.[tj]s",
      "worker-configuration.d.ts",
      ".github/",
      "*.yml",
      "dist/",
      "build/",
      "coverage/",
      "*.min.js",
      "*.min.css",
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        project: [
          "./tsconfig.cloudflare.json",
          "./tsconfig.node.json",
          "./tsconfig.test.json",
        ],
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true },
      },
      globals: { React: "readonly" },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      import: importPlugin,
    },
    settings: { react: { version: "detect" } },
    rules: {
      // TypeScript rules
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",

      // General JavaScript rules
      "prefer-const": "error",
      "no-console": "warn",
      "no-debugger": "error",
      "no-var": "error",
      "object-shorthand": "error",

      // React rules
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "error",
      "react/jsx-key": "error",
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-no-undef": "error",
      "react/no-unescaped-entities": "error",
      "react/no-unknown-property": "error",
      "react/self-closing-comp": "error",

      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // React Refresh rules (for HMR)
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

      "import/no-unresolved": "off",
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/no-duplicates": "error",
      "import/no-unused-modules": "off", // Disabled due to performance issues
    },
  },
  // Cloudflare Workers specific configuration
  {
    files: ["workers/**/*.{js,ts}", "**/*.worker.{js,ts}"],
    languageOptions: {
      globals: {
        // Cloudflare Workers globals
        addEventListener: "readonly",
        caches: "readonly",
        crypto: "readonly",
        fetch: "readonly",
        Request: "readonly",
        Response: "readonly",
        Headers: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        WebSocket: "readonly",
        // Cloudflare specific
        CF: "readonly",
        KV: "readonly",
        Durable: "readonly",
        // Environment bindings (adjust as needed)
        Bindings: "readonly",
      },
    },
    rules: {
      // Allow console in workers for debugging
      "no-console": "off",
      // Workers often use event listeners
      "@typescript-eslint/no-misused-promises": "off",
    },
  },
  // React Router specific configuration
  {
    files: ["app/**/*.{js,jsx,ts,tsx}"],
    rules: {
      // React Router v7 specific rules
      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
          allowExportNames: ["meta", "links", "headers", "loader", "action", "default"],
        },
      ],
    },
  },
  // Configuration files - disable some rules
  {
    files: ["*.config.{js,ts}", "vite.config.ts", "tailwind.config.js"],
    rules: {
      "import/no-unused-modules": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
)
