/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", 
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
  extend: {
  colors: {
    background: "#0B1220",
    surface: "#0F1724",
    primary: "#00B4D8",
    accent: "#FFBE0B",
    text: "#E6EEF3",
    muted: "#9AA6B2",
  },
},

  },
  plugins: [],
};
