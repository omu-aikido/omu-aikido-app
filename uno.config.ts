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
      'text-sub': 'text-sm text-fg-dim',
      'flex-between': 'flex items-center justify-between',
      'input-base':
        'w-full px-3 py-2 bg-bg border border-border rounded-md text-base transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-muted',
      'form-label': 'text-sm font-medium text-fg-dim',
    },
    [
      /^avatar-(.*)$/,
      ([, size]: RegExpMatchArray) => {
        const sizes: Record<string, string> = {
          sm: 'w-6 h-6',
          md: 'w-10 h-10',
          lg: 'w-14 h-14',
          xl: 'w-20 h-20',
        };
        const sizeClass = sizes[size] || sizes.md;
        return `${sizeClass} rounded-full object-cover bg-gray-200 dark:bg-gray-700 shrink-0`;
      },
    ],
    [
      /^badge-(.*)$/,
      ([, color]: RegExpMatchArray) => {
        const base = 'px-2 py-0.5 rounded-full text-xs font-medium';
        const colors: Record<string, string> = {
          gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
          red: 'bg-red-500/10 text-red-500',
          blue: 'bg-blue-500/10 text-blue-500',
          green: 'bg-green-500/10 text-green-500',
          yellow: 'bg-yellow-400/10 text-yellow-500',
        };
        return `${base} ${colors[color] || colors.gray}`;
      },
    ],
    [
      /^btn-(.*)$/,
      ([, c]: RegExpMatchArray) => {
        const base = 'btn';
        if (c === 'primary')
          return `${base} bg-blue-500 text-white hover:bg-blue-600 focus-visible:(outline-none ring-2 ring-blue-500)`;
        if (c === 'secondary') return `${base} bg-bg-card text-fg-dim border border-border hover:bg-bg-muted`;
        if (c === 'danger') return `${base} bg-red-500 text-white hover:bg-red-600 border-none`;
        return '';
      },
    ],
  ],
});
