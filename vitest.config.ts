import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import { defineConfig } from 'vitest/config'

const __dirname = path.resolve()

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    typecheck: { tsconfig: './tsconfig.test.json' },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
      ],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
      '@/*': path.resolve(__dirname, '.'),
      '@/src': path.resolve(__dirname, 'src'),
    },
  },
  root: './',
})
