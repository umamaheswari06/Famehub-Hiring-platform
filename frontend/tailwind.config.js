/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a3c6e',
          light: '#2855a0',
          dark: '#0f2447',
        },
        accent: {
          DEFAULT: '#f97316',
          light: '#fb923c',
          dark: '#e8640f',
        },
        secondary: {
          DEFAULT: '#e2e8f0',
          dark: '#cbd5e1',
        },
        surface: {
          DEFAULT: '#eef2f9',
          off: '#f8f9fc',
          border: '#dde3ee',
          muted: '#f1f5f9',
        },
        text: {
          dark: '#0d1b36',
          body: '#3d4f6e',
          muted: '#7a8aaa',
        }
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 2px 8px rgba(26, 60, 110, 0.07)',
        'md': '0 6px 24px rgba(26, 60, 110, 0.12)',
        'lg': '0 16px 48px rgba(26, 60, 110, 0.18)',
        'xl': '0 28px 64px rgba(26, 60, 110, 0.22)',
        'accent': '0 4px 16px rgba(249, 115, 22, 0.32)',
        'primary': '0 4px 16px rgba(26, 60, 110, 0.28)',
      },
      borderRadius: {
        'sm': '6px',
        'md': '12px',
        'lg': '20px',
        'xl': '28px',
      },
      animation: {
        'spin-slow': 'spin 0.85s linear infinite',
        'logo-pulse': 'logoPulse 1.4s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
        'fade-up': 'fadeUp 0.6s ease forwards',
        'count-up': 'countUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards',
      },
      keyframes: {
        logoPulse: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(249,115,22,0.4)' },
          '50%': { transform: 'scale(1.08)', boxShadow: '0 0 0 12px rgba(249,115,22,0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        countUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}
