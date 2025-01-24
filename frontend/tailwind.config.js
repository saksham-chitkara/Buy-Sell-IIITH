/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'culpa': ['"Mea Culpa"', 'cursive'],
      },
    },
  },
  plugins: [],
}