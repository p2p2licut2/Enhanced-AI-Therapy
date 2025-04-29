/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Extinde culorile Tailwind cu paleta aplicației
        // Aceasta asigură consistența între CSS Module și clasele Tailwind
        'primary': {
          DEFAULT: 'var(--color-primary)',
          dark: 'var(--color-primary-dark)',
          light: 'var(--color-primary-light)',
        },
        'secondary': {
          DEFAULT: 'var(--color-secondary)',
          dark: 'var(--color-secondary-dark)',
          light: 'var(--color-secondary-light)',
        },
        'accent': {
          DEFAULT: 'var(--color-accent)',
          dark: 'var(--color-accent-dark)',
          light: 'var(--color-accent-light)',
        },
        'background': 'var(--color-background)',
        'surface': 'var(--color-surface)',
        'text': {
          DEFAULT: 'var(--color-text)',
          light: 'var(--color-text-light)',
          lighter: 'var(--color-text-lighter)',
        },
        'heading': 'var(--color-heading)',
      },
      fontFamily: {
        sans: ['var(--font-family-primary)'],
        heading: ['var(--font-family-heading)'],
      },
      fontSize: {
        'xs': 'var(--font-size-xs)',
        'sm': 'var(--font-size-sm)',
        'base': 'var(--font-size-md)',
        'lg': 'var(--font-size-lg)',
        'xl': 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)',
        '3xl': 'var(--font-size-3xl)',
        '4xl': 'var(--font-size-4xl)',
      },
      spacing: {
        'xs': 'var(--spacing-xs)',
        'sm': 'var(--spacing-sm)',
        'md': 'var(--spacing-md)',
        'lg': 'var(--spacing-lg)',
        'xl': 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
        '3xl': 'var(--spacing-3xl)',
      },
      borderRadius: {
        'sm': 'var(--border-radius-sm)',
        'md': 'var(--border-radius-md)',
        'lg': 'var(--border-radius-lg)',
        'xl': 'var(--border-radius-xl)',
        'pill': 'var(--border-radius-pill)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
      },
      height: {
        'screen': 'calc(var(--vh, 1vh) * 100)',
      },
      minHeight: {
        'screen': 'calc(var(--vh, 1vh) * 100)',
      },
      animation: {
        'fade-in': 'fadeIn var(--transition-standard) ease-in-out forwards',
        'pulse': 'pulse 2s infinite',
        'bounce': 'bounce 1.4s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' }
        },
        bounce: {
          '0%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-10px)' }
        }
      },
      transitionDuration: {
        'fast': 'var(--transition-fast)',
        'base': 'var(--transition-base)',
        'slow': 'var(--transition-slow)',
        'slower': 'var(--transition-slower)',
      },
      transitionTimingFunction: {
        'in-out': 'var(--ease-in-out)',
        'out': 'var(--ease-out)',
        'in': 'var(--ease-in)',
        'bounce': 'var(--ease-bounce)',
      },
      screens: {
        'xs': 'var(--breakpoint-xs)',
        'sm': 'var(--breakpoint-sm)',
        'md': 'var(--breakpoint-md)',
        'lg': 'var(--breakpoint-lg)',
        'xl': 'var(--breakpoint-xl)',
      },
    },
  },
  plugins: [],
  // Configurație pentru a conserva anumite clase Tailwind întotdeauna
  safelist: [
    'text-primary',
    'text-secondary',
    'text-accent',
    'text-heading',
    'animate-fade-in',
    'animate-pulse',
    'animate-bounce',
  ],
  // Indică utilizarea CSS variabilelor pentru o mai bună compunere
  corePlugins: {
    preflight: false, // Dezactivăm preflight pentru a folosi propriul nostru reset
  },
}