import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Tlaxcala Government Branding Colors
        primary: {
          DEFAULT: '#582672',
          accent: '#3D1A50',
          light: '#ECF0FA',
          50: '#f5f1f8',
          100: '#ebe4f1',
          200: '#d8cae4',
          300: '#C9B7DD',
          400: '#a98fc7',
          500: '#8967b1',
          600: '#582672',
          700: '#3D1A50',
          800: '#2E1440',
          900: '#1F0E30',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#A2185D',
          light: '#E5BDD0',
          50: '#fdf2f7',
          100: '#fce7f0',
          200: '#f9cfe1',
          300: '#E5BDD0',
          400: '#e07aa8',
          500: '#c94082',
          600: '#A2185D',
          700: '#8a1450',
          800: '#6e1040',
          900: '#520c30',
          foreground: '#ffffff',
        },
        tertiary: {
          DEFAULT: '#A2185D',
          foreground: '#ffffff',
        },
        gradient: {
          start: '#A2185D',
          end: '#582672',
        },
        gold: {
          DEFAULT: '#CDB786',
          light: '#F5F0E4',
          dark: '#8B7355',
          foreground: '#5C4A2A',
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
        ring: '#582672',
        accent: {
          DEFAULT: '#f5f1f8',
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
  plugins: [],
}
export default config
