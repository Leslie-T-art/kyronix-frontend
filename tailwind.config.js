/** @type {import('tailwindcss').Config} */
const colorVar = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Poppins'", 'ui-sans-serif', 'system-ui', 'sans-serif'],
        brand: ["'Poppins'", 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        /* Two brand colours only. Everything else is zinc or a reserved state colour. */
        white: colorVar('--white'),
        zinc: {
          50: colorVar('--zinc-50'),
          100: colorVar('--zinc-100'),
          200: colorVar('--zinc-200'),
          300: colorVar('--zinc-300'),
          400: colorVar('--zinc-400'),
          500: colorVar('--zinc-500'),
          600: colorVar('--zinc-600'),
          700: colorVar('--zinc-700')
        },
        navy: {
          DEFAULT: colorVar('--navy'),
          50: colorVar('--navy-50'),
          100: colorVar('--navy-100'),
          200: colorVar('--navy-200'),
          600: colorVar('--navy-600'),
          700: colorVar('--navy-700'),
          800: colorVar('--navy-800'),
          900: colorVar('--navy-900')
        },
        gold: {
          DEFAULT: colorVar('--gold'),
          50: colorVar('--gold-50'),
          100: colorVar('--gold-100'),
          200: colorVar('--gold-200'),
          600: colorVar('--gold-600'),
          700: colorVar('--gold-700'),
          800: colorVar('--gold-800')
        },
        ring: 'var(--ring)',
        canvas: 'var(--canvas)',
        overlay: 'var(--overlay)',
        'brand-background': 'var(--brand-background)',
        'brand-foreground': 'var(--brand-foreground)',
        'brand-muted-foreground': 'var(--brand-muted-foreground)',
        'brand-surface': 'var(--brand-surface)',
        'brand-border': 'var(--brand-border)',
        matrix: {
          DEFAULT: 'var(--matrix)',
          muted: {
            DEFAULT: 'var(--matrix-muted)',
            hover: 'var(--matrix-muted-hover)',
            active: 'var(--matrix-muted-active)'
          }
        },
        pulse: 'var(--pulse)',
        leaf: 'var(--leaf)',
        sky: 'var(--sky)',
        'on-matrix': 'var(--on-matrix)',
        'on-pulse': 'var(--on-pulse)',
        'on-leaf': 'var(--on-leaf)',
        'on-sky': 'var(--on-sky)'
      },
      borderRadius: {
        brand: 'var(--radius, 0.75rem)'
      },
      boxShadow: {
        /* The design system forbids elevation. Every shadow utility resolves to none. */
        sm: 'none',
        DEFAULT: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none',
        '2xl': 'none',
        inner: 'none'
      }
    }
  }
}
