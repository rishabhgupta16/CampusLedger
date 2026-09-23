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
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        surface: {
          dark: {
            base: '#0B0F19',
            card: '#111827',
            elevated: '#1F2937',
            border: '#1E293B',
            muted: '#374151',
          },
          light: {
            base: '#F8FAFC',
            card: '#FFFFFF',
            elevated: '#F1F5F9',
            border: '#E2E8F0',
            muted: '#CBD5E1',
          }
        }
      },
      boxShadow: {
        'card-light': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card-light-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.07), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'card-dark': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
        'card-dark-hover': '0 12px 28px -5px rgba(0, 0, 0, 0.6), 0 8px 12px -6px rgba(0, 0, 0, 0.4)',
        'inner-subtle': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)',
      },
    },
  },
  plugins: [],
}
