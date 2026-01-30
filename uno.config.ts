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
      fg: 'var(--color-fg)',
      'fg-dim': 'var(--color-fg-dim)',
      blue: '#3b82f6',
      red: '#e11d48',
      orange: '#fb923c',
      yellow: '#facc15',
      green: '#22c55e',
      rank: {
        '1': '#facc15',
        '2': '#94a3b8',
        '3': '#fb923c',
      },
    },
  },
  shortcuts: {
    surface: 'bg-bg text-fg',
    card: 'bg-bg-dim text-fg-dim',
  },
});
