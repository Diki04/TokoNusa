/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        tokonusa: {
          emerald: '#03AC0E',
          dark: '#00820A',
          hover: '#029B0C',
          light: '#F0FDF4',
          gold: '#FACC15',
          red: '#E11D48',
          surface: '#F8FAFC',
          heading: '#0F172A',
          body: '#334155',
          muted: '#64748B',
          border: '#E2E8F0',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
