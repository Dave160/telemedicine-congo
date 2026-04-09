/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f0fe',
          100: '#c5d8fc',
          500: '#1a73e8',
          600: '#1557b0',
        },
      },
    },
  },
  plugins: [],
};
