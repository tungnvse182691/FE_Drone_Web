import tailwindcssAnimate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'line-clamp-1',
    'line-clamp-2',
    'line-clamp-3',
    'line-clamp-4',
    'line-clamp-5',
    'line-clamp-6',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#C9A227',
          goldDark: '#6B5219',
          goldMuted: '#8C6D1F',
          navy: '#2D3748',
          dark: '#1A1D20',
          surface: '#FFFFFF',
          surfaceAlt: '#F8F9FA',
          border: '#E2E5E9',
          success: '#2F9E44',
          warning: '#F59E0B',
          error: '#E5484D',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        headline: ['Sansation', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [tailwindcssAnimate],
}
