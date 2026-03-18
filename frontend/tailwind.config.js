/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        farm: {
          50: '#f2f8f5',
          100: '#e0f0e8',
          200: '#c2dfd1',
          300: '#95c6b1',
          400: '#64a78c',
          500: '#428b6f',
          600: '#326f58',
          700: '#2a5948',
          800: '#24483b',
          900: '#1e3b32',
        },
        earth: {
          50: '#fcf8f3',
          100: '#f8eedf',
          200: '#f0dfc2',
          300: '#e5ca9e',
          400: '#d5ac71',
          500: '#c7924c',
          600: '#b8793f',
          700: '#995e34',
          800: '#7d4d31',
          900: '#65402a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
