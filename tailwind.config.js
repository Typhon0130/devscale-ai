/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './node_modules/flowbite/**/*.js',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#FADA5E',
        secondary: '#E2ECF3',
        iconPrimary: '#B3CDE0',
        white: '#ffffff',
        bgPrimary: '#2A3439',
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('flowbite/plugin')],
};
