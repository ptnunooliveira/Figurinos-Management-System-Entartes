/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'fig-purple': '#3E2A47',
        'fig-dark': '#2A1F32',
        'fig-magenta': '#C8457A',
        'fig-pink': '#D85D8F',
        'fig-green': '#7FA652',
        'fig-green-light': '#9BC06E',
      },
    },
  },
  plugins: [],
};
