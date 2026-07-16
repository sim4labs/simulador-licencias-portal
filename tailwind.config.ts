import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Nueva paleta institucional del Gobierno de Tlaxcala (2021–2027)
        primary: {
          DEFAULT: '#AF2140',
          accent: '#922542',
          light: '#F8E8EC',
          50: '#FDF4F6',
          100: '#F8E8EC',
          200: '#F2CCD5',
          300: '#E69BAE',
          400: '#D45F7A',
          500: '#AF2140',
          600: '#922542',
          700: '#7A1E37',
          800: '#62182F',
          900: '#461121',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#922542',
          light: '#F2CCD5',
          50: '#FDF4F6',
          100: '#F8E8EC',
          200: '#F2CCD5',
          300: '#E69BAE',
          400: '#D45F7A',
          500: '#AF2140',
          600: '#922542',
          700: '#7A1E37',
          800: '#62182F',
          900: '#461121',
          foreground: '#ffffff',
        },
        tertiary: {
          DEFAULT: '#62182F',
          foreground: '#ffffff',
        },
        gradient: {
          start: '#AF2140',
          end: '#62182F',
        },
        gold: {
          DEFAULT: '#D0B786',
          light: '#F2E6D3',
          dark: '#8A7045',
          foreground: '#584526',
        },
        background: '#ffffff',
        foreground: {
          DEFAULT: '#4A5057',
          dark: '#374151',
          light: '#6B7280',
        },
        muted: {
          DEFAULT: '#f4f4f5',
          foreground: '#71717a',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#171717',
        },
        border: '#e4e4e7',
        input: '#e4e4e7',
        ring: '#AF2140',
        accent: {
          DEFAULT: '#FDF4F6',
          foreground: '#171717',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        success: {
          DEFAULT: '#22c55e',
          foreground: '#ffffff',
        },
        warning: {
          DEFAULT: '#f59e0b',
          foreground: '#171717',
        },
        info: {
          DEFAULT: '#3b82f6',
          foreground: '#ffffff',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.6s ease-out forwards',
      },
    },
  },
  plugins: [typography],
}
export default config
