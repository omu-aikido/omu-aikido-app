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
      base: 'var(--color-base)',
      surface0: 'var(--color-surface0)',
      surface1: 'var(--color-surface1)',
      overlay0: 'var(--color-overlay0)',
      overlay1: 'var(--color-overlay1)',
      subtext: 'var(--color-subtext)',
      text: 'var(--color-text)',
      rank: {
        '1': '#facc15',
        '2': '#94a3b8',
        '3': '#fb923c',
      },
    },
  },
  shortcuts: [
    // --- Layout Primitives ---
    {
      stack: 'flex flex-col gap-4',
      'flex-between': 'flex items-center justify-between',
      'grid-2': 'grid grid-cols-2 gap-4',
      'grid-responsive': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
      'form-grid': 'grid grid-cols-1 md:grid-cols-2 gap-4',
      'loading-container': 'flex flex-col items-center justify-center min-h-[12.5rem]',
    },

    // --- surface1 & Feedback ---
    {
      card: 'bg-surface0 text-subtext border border-overlay1 rounded-lg p-4 shadow-sm',
      skeleton: 'animate-pulse bg-overlay1 rounded',
      'loading-spinner': 'w-10 h-10 mb-4 border-4 border-overlay1 border-t-blue-500 rounded-full animate-spin',
      'alert-error': 'mt-4 p-3 rounded-md text-sm bg-red-500/10 border border-red-500 text-red-500',
      'alert-success': 'mt-4 p-3 rounded-md text-sm bg-green-500/10 border border-green-500 text-green-500',
    },

    // --- Action & Navigation ---
    {
      btn: 'inline-flex items-center justify-center font-medium rounded-md px-4 py-2 text-base cursor-pointer transition-all disabled:(opacity-50 cursor-not-allowed)',
      'nav-button': 'p-2 rounded-lg hover:bg-overlay1 transition-colors',
      'filter-btn':
        'px-3 py-1.5 text-sm font-medium rounded-md text-subtext border-none cursor-pointer transition-all hover:text-text',
      'filter-btn-active': 'bg-surface1 text-text shadow-sm',
      'tab-list': 'flex gap-1 border-b border-overlay1',
      'tab-item':
        'px-4 py-2.5 text-sm font-medium bg-transparent border-none border-b-2 cursor-pointer transition-colors outline-none text-subtext hover:text-blue-500 border-transparent aria-selected:(border-blue-500 text-blue-500)',
    },

    // --- Form Controls ---
    {
      'input-base':
        'w-full px-3 py-2 bg-surface0 border border-overlay0 rounded-md text-text transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-overlay',
      'form-label': 'text-sm font-medium text-subtext',
    },

    // --- Typography & Data Display ---
    {
      'heading-1': 'text-2xl font-bold text-text',
      'heading-2': 'text-xl font-bold text-text',
      'text-sub': 'text-sm text-subtext',
      'rounded-img': 'w-full h-full object-cover rounded',
      'table-base': 'w-full text-left border-collapse text-sm',
      'th-base': 'px-4 py-3 font-medium text-subtext border-b border-overlay1 text-nowrap',
      'td-base': 'px-4 py-3 border-b border-overlay1',
      subtext: 'text-subtext text-opacity-100',
      text: 'text-text',
      base: 'bg-page',
      surface: 'bg-surface',
      overlay: 'bg-overlay',
      'placeholder-subtext': 'placeholder:text-subtext placeholder:opacity-100',
    },

    // --- Dynamic Shortcuts  ---
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
        return `${sizeClass} rounded-full object-cover bg-overlay1 shrink-0`;
      },
    ],
    [
      /^badge-(.*)$/,
      ([, color]: RegExpMatchArray) => {
        const base = 'px-2 py-0.5 rounded-full text-xs font-medium';
        const colors: Record<string, string> = {
          gray: 'bg-overlay1 text-subtext',
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
        if (c === 'secondary') return `${base} bg-surface0 text-subtext border border-overlay1 hover:bg-overlay`;
        if (c === 'danger') return `${base} bg-red-500 text-white hover:bg-red-600 border-none`;
        return '';
      },
    ],
  ],
});
