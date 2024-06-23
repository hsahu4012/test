/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{html,js}",
  ],
  theme: {
    extend: {
      colors: {
        green: "#5F64E2",
        red: "#4A32DA",
        secondary: "#555",
        prigmayBG: "#FCFCFC",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "cupcake"],
  },
};
