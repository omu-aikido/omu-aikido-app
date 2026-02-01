import {
  defineConfig,
  presetWind4,
  presetAttributify,
  presetIcons,
  transformerVariantGroup,
  transformerDirectives,
} from 'unocss';

export default defineConfig({
  presets: [
    presetAttributify({
      prefix: 'uno-',
      prefixedOnly: true,
    }),
    presetWind4(),
    presetIcons({
      scale: 1.8,
      warn: true,
    }),
  ],
  transformers: [
    transformerVariantGroup(), // 分配律みたいな
    transformerDirectives(), // Directive記法
  ],
  theme: {
    colors: {
      bg: 'var(--color-bg)',
      'bg-dim': 'var(--color-bg-dim)',
      'bg-light': 'var(--color-bg-light)',
      fg: 'var(--color-fg)',
      'fg-dim': 'var(--color-fg-dim)',
      'fg-muted': 'var(--color-fg-muted)',
      'fg-light': 'var(--color-fg-muted)', // Alias for compatibility
      'bg-card': 'var(--color-bg)',
      border: 'var(--color-border)',
      'border-dim': 'var(--color-border-dim)',
      'bg-muted': 'var(--color-bg-dim)',
      rank: {
        '1': '#facc15',
        '2': '#94a3b8',
        '3': '#fb923c',
      },
    },
  },
  shortcuts: [
    {
      surface: 'bg-bg text-fg',
      card: 'bg-bg text-fg-dim border border-border rounded-lg p-4 shadow-sm',
      skeleton: 'animate-pulse bg-bg-muted rounded',
      'loading-skeleton': 'animate-pulse bg-bg-muted rounded',
      'loading-container': 'flex flex-col items-center justify-center min-h-[12.5rem]',
      'loading-spinner':
        'w-10 h-10 mb-4 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin',
      'nav-button': 'p-2 rounded-lg hover:bg-bg-muted transition-colors',
      btn: 'inline-flex items-center justify-center font-medium rounded-md px-4 py-2 text-base cursor-pointer transition-all disabled:(opacity-50 cursor-not-allowed)',
      'rouned-img': 'w-full h-full object-cover rounded',
      'alert-error': 'mt-4 p-3 rounded-md text-sm bg-red-50 border border-red-500 text-red-500 dark:bg-red-900/10',
      'alert-success': 'mt-4 p-3 rounded-md text-sm bg-green-500/10 border border-green-500 text-green-500',
      stack: 'flex flex-col gap-4',
      'form-grid': 'grid grid-cols-1 md:grid-cols-2 gap-4',
    },
  ],
});
