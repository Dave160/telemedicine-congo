/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          400: '#4ade80',
          500: '#2db87a',
          600: '#29a96e',
          700: '#1f8a58',
        },
        dark: {
          bg:     '#0d1f1f',
          card:   '#162a2a',
          border: '#1e3535',
          muted:  '#8a9a9a',
        },
      },
    },
  },
  plugins: [],
};
