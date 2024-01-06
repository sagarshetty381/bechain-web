/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,tsx,ts}"],
  theme: {
    extend: {
      colors: {
        'bcblue': '#063851',
        'bcorange': '#ef810f',
        'bcorange-light': '#fff4e8',
        'bcorange-dark': '#ffe4c4'
      },
    },
  },
  plugins: [],
}

