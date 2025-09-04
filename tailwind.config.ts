import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'pocket-blue': 'rgba(0, 140, 255, 1)',
        'pocket-field': 'rgba(28, 32, 35, 1)',
        'pocket-disabled': 'rgba(60, 69, 75, 1)'
      },
    },
  },
  plugins: [],
};

export default config;
