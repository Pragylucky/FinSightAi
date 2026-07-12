/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Our custom color palette
        bg: {
          primary: '#0B0F1A',    // Main background - deep navy
          secondary: '#131929',  // Cards / panels
          tertiary: '#1A2235',   // Hover states
          border: '#1E2D45',     // Borders
        },
        accent: {
          cyan: '#00D4FF',       // Primary accent - electric cyan
          purple: '#7B61FF',     // Secondary accent - AI purple
          green: '#00E676',      // Bullish / positive
          red: '#FF3B5C',        // Bearish / negative
          yellow: '#FFB800',     // Warning / neutral
        },
        text: {
          primary: '#F0F4FF',    // Main text
          secondary: '#8899AA',  // Muted text
          muted: '#4A5568',      // Very muted
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,212,255,0.15), transparent)',
      },
      animation: {
        'ticker': 'ticker 30s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
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
