import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background:       '#0A0A0F',
        surface:          '#12121A',
        'surface-2':      '#1C1C2E',
        border:           '#2A2A45',
        'accent-blue':    '#4D9FFF',
        'accent-purple':  '#8B5CF6',
        'accent-glow':    '#2563EB',
        'text-primary':   '#F0F0FF',
        'text-secondary': '#7A7A9A',
      },
      fontFamily: {
        heading: ['Orbitron', 'Space Grotesk', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        // base grid: 8px (Tailwind's default scale is already 4px-based;
        // 8px = space-2, kept as reference)
      },
      borderRadius: {
        card:   '8px',
        btn:    '4px',
        badge:  '999px',
      },
      boxShadow: {
        glow: '0 0 20px rgba(77, 159, 255, 0.3)',
      },
    },
  },
  plugins: [],
} satisfies Config