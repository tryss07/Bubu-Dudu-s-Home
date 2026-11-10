/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./js/**/*.js",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "surface": "#FAF5EE",
        "surface-dim": "#e5d8cc",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#fff4ea",
        "surface-container": "#f8ece0",
        "surface-container-high": "#f1e3d5",
        "primary": "#4A3222",
        "primary-container": "#5c4033",
        "secondary": "#8D5B4C",
        "secondary-container": "#F5C7A9",
        "warm-brown": "#8D5B4C",
        "dark-brown": "#4A3222",
        "biscuit": "#E6BE8A",
        "peach": "#F5C7A9"
      },
      fontFamily: {
        "heading": ["Plus Jakarta Sans", "sans-serif"],
        "body": ["Quicksand", "sans-serif"],
        "handwriting": ["Caveat", "cursive"]
      }
    }
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/container-queries")
  ]
};
