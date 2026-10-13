import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui-dashboard/src/**/*.{js,ts,jsx,tsx}',
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
