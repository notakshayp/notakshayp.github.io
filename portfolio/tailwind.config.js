/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors:{
        text:"#00190C",
        background:"#F0FEF6",
        primary:"#21F35E",
        secondary:"#DC81F1",
        accent:"#9D4CFD"
      }
    },
  },
  plugins: [],
}

