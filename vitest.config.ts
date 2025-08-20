/// <reference types="vitest" />
import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: { label: "unit", color: "blue" },
          include: ["**/*.edge.{test,spec}.{js,ts}"],
          exclude: ['tests/**', 'node_modules'],
          environment: "edge-runtime",
        },
      },
      {
        extends: true,
        test: {
          name: { label: "unit", color: "cyan" },
          include: ["**/*.client.{test,spec}.{js,ts}"],
          exclude: ['tests/**', 'node_modules'],
          environment: "happy-dom",
        },
      },
      {
        test: {
          name: { label: "integration", color: "green" },
          include: ["tests/integration/**/*.{test,spec}.{js,ts}"],
          environment: "node",
        },
      },
    ],
  },
})
