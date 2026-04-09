/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f0fe',
          100: '#c5d8fc',
          500: '#1a73e8',
          600: '#1557b0',
          700: '#0d3f8f',
        },
        success: '#34a853',
        warning: '#fbbc04',
        danger: '#ea4335',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
