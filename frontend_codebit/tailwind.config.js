/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable dark mode using class strategy
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
    screens: {
      xs: "560px",
      sm: "800px",
      md: "950px",
      lg: "1300px",
      xl: "1380px",
      pc: "1750px",
      "2xl": "1536px",
    },
  },
  plugins: [],
}
