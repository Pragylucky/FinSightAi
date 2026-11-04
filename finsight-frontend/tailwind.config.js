/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // All colors come from CSS variables in index.css, so the palette is changed in one place.
        bg: {
          primary: 'rgb(var(--c-bg) / <alpha-value>)',
          secondary: 'rgb(var(--c-surface) / <alpha-value>)',
          tertiary: 'rgb(var(--c-raised) / <alpha-value>)',
          border: 'rgb(var(--c-border) / <alpha-value>)',
        },
        accent: {
          primary: 'rgb(var(--c-primary) / <alpha-value>)',
          secondary: 'rgb(var(--c-secondary) / <alpha-value>)',
          green: 'rgb(var(--c-bull) / <alpha-value>)',
          red: 'rgb(var(--c-bear) / <alpha-value>)',
          warn: 'rgb(var(--c-warn) / <alpha-value>)',
        },
        text: {
          primary: 'rgb(var(--c-text) / <alpha-value>)',
          secondary: 'rgb(var(--c-text-2) / <alpha-value>)',
          muted: 'rgb(var(--c-text-3) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgb(var(--c-primary) / 0.15), transparent)',
      },
      animation: {
        'ticker': 'ticker 30s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
