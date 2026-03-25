import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // All values read from CSS variables defined in index.css :root
        // Format: "R G B" so opacity modifiers work (e.g. bg-accent-blue/20)
        background:       'rgb(var(--c-background)   / <alpha-value>)',
        surface:          'rgb(var(--c-surface)       / <alpha-value>)',
        'surface-2':      'rgb(var(--c-surface-2)     / <alpha-value>)',
        border:           'rgb(var(--c-border)        / <alpha-value>)',
        'accent-blue':    'rgb(var(--c-accent-blue)   / <alpha-value>)',
        'accent-purple':  'rgb(var(--c-accent-purple) / <alpha-value>)',
        'accent-glow':    'rgb(var(--c-accent-glow)   / <alpha-value>)',
        'text-primary':   'rgb(var(--c-text-primary)  / <alpha-value>)',
        'text-secondary': 'rgb(var(--c-text-secondary)/ <alpha-value>)',
        'error':          'rgb(var(--c-error)         / <alpha-value>)',
      },
      fontFamily: {
        heading: ['Orbitron', 'Space Grotesk', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card:  '8px',
        btn:   '4px',
        badge: '999px',
      },
      boxShadow: {
        glow: '0 0 20px rgb(var(--c-accent-blue) / 0.3)',
      },
    },
  },
  plugins: [],
} satisfies Config
