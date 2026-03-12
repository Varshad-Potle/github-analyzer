/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background:     '#0A0A0F',
        surface:        '#0F172A',
        'surface-raised': '#1E293B',
        'solar-orange': '#F97316',
        'solar-gold':   '#FCD34D',
        'solar-yellow': '#FACC15',
        'text-primary': '#FFFFFF',
        'text-secondary': '#94A3B8',
        'text-muted':   '#475569',
      },
      fontFamily: {
        exo:      ['Exo', 'sans-serif'],
        arya:     ['Arya', 'sans-serif'],
        expletus: ['Expletus Sans', 'sans-serif'],
        mono:     ['Courier New', 'monospace'],
      },
      boxShadow: {
        'glow-sm':  '0 0 8px rgba(249,115,22,0.3)',
        'glow-md':  '0 0 20px rgba(249,115,22,0.5)',
        'glow-lg':  '0 0 40px rgba(249,115,22,0.8)',
        'glow-gold': '0 0 20px rgba(252,211,77,0.5)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'aurora':     'aurora 8s ease-in-out infinite',
        'slide-right': 'slideRight 2s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.4))' },
          '50%':      { filter: 'drop-shadow(0 0 20px rgba(249,115,22,0.9))' },
        },
        aurora: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%':      { opacity: '0.7', transform: 'scale(1.1)' },
        },
        slideRight: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
      },
    },
  },
  plugins: [],
};