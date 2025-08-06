/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'leap-green': {
          50: '#e6f9ed',
          100: '#b3edc7',
          200: '#80e1a1',
          300: '#4dd57b',
          400: '#26cd5d',
          500: '#00B74F', // Primary Leapmotor green
          600: '#00a347',
          700: '#008f3f',
          800: '#007b37',
          900: '#00672f',
        },
        'leap-dark': '#1a1a1a',
        'leap-gray': '#f5f5f5',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}