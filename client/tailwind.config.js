/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    screens: {
      desktop: { max: '1440px' },
      basic: { max: '1280px' },
      laptop: { max: '1024px' },
      tablet: { max: '768px' },
      mobile: { max: '425px' }
    },
    extend: {}
  },
  plugins: []
};
