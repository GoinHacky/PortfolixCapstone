/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        maroon: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#800000',
          700: '#600000',
          800: '#400000',
          900: '#200000',
        },
        gold: {
          50: '#fefbe8',
          100: '#fff7c2',
          200: '#ffee99',
          300: '#ffe066',
          400: '#ffd43b',
          500: '#D4AF37',
          600: '#B8860B',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
      },
      animation: {
        'spin-slow': 'spin 60s linear infinite',
      }
    },
  },
  plugins: [],
}