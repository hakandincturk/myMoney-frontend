/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        mm: {
          bg: '#121212',
          surface: '#1E1E1E',
          border: '#2A2A2A',
          primary: '#90CAF9',
          primaryHover: '#7EBEE4',
          secondary: '#A5D6A7',
          accent: '#FFAB91',
          accentHover: '#E89B82',
          text: '#E0E0E0',
          subtleText: '#B0BEC5',
          placeholder: '#9E9E9E',
          disabled: '#333333',
          grid: '#333333',
        },
      },
    },
  },
  plugins: [],
}

