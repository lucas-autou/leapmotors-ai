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
        'leap': {
          'dark': '#0a0a0a',      // Fundo principal premium
          'surface': '#1a1a1a',   // Superfícies de cartões
          'surface-light': '#252525', // Superfícies hover
          'border': '#333333',    // Bordas sutis
          'border-light': '#404040', // Bordas hover
          'text-primary': '#ffffff', // Texto principal
          'text-secondary': '#a1a1aa', // Texto secundário
          'text-muted': '#71717a',   // Texto terciário
          'green': {
            'neon': '#00FF7F',      // Verde neon para acentos
            'primary': '#00B74F',   // Verde principal Leapmotor
            'soft': 'rgba(0, 183, 79, 0.1)', // Verde transparente
            'glow': 'rgba(0, 183, 79, 0.3)',  // Verde para glows
          }
        },
        // Manter compatibilidade
        'leap-dark': '#1a1a1a',
        'leap-gray': '#f5f5f5',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 183, 79, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(0, 183, 79, 0.6)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}