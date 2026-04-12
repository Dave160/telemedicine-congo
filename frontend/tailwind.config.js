/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'media',
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
          gradient: '#3ecf8e',
        },
        dark: {
          bg:      '#0d1f1f',
          surface: '#112020',
          card:    '#162a2a',
          card2:   '#1a2e2e',
          border:  '#1e3535',
          muted:   '#8a9a9a',
        },
        accent: {
          green: '#4ade80',
          orange: '#f97316',
          red: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'pill': '9999px',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
