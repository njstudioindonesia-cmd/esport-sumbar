import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        marawa: {
          gold: '#F5B700',
          'gold-hover': '#D9A100',
          'gold-light': '#FFC72C',
          red: '#E10600',
          dark: '#08080A',
        },
        brand: {
          500: '#E10600',
          600: '#B80500',
          400: '#FF3B30',
        },
        dark: {
          900: '#08080A',
          800: '#121217',
          700: '#181822',
          600: '#22222E',
        },
        line: {
          DEFAULT: '#2A2A38',
          strong: '#3E3E50',
          gold: '#F5B700',
        },
        accent: {
          text100: '#F5F5F7',
          text400: '#9A9AA5',
          gold: '#F5B700',
        },
      },
      fontFamily: {
        display: ['Rajdhani', 'Barlow Condensed', 'sans-serif'],
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
