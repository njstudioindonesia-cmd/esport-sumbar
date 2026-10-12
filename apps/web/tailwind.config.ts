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
        brand: {
          500: '#E10600',
          600: '#B80500',
          400: '#FF3B30',
        },
        dark: {
          900: '#0B0B0D',
          800: '#131316',
          700: '#1C1C21',
          600: '#25252C',
        },
        line: {
          DEFAULT: '#2A2A31',
          strong: '#3F3F4A',
        },
        accent: {
          text100: '#F5F5F7',
          text400: '#9A9AA5',
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
