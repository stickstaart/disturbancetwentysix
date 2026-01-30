/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    textColor: {
      primary: "blue",
      secondary: "purple",
      white: "#FFF",
      black: "#000",
    },
    textSize: {
      primary: "2xl",
    },
    extend: {},
  },
  plugins: [],
}
