/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
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
      }
    },
  },
  plugins: [],
}
