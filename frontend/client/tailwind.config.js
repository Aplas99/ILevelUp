import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "Avenir",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: ["Monaco", "Courier New", "monospace"],
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.9" },
        },
      },
      animation: {
        flicker: "flicker 4s ease-in-out infinite",
      },
    },
  },
  plugins: [
    tailwindcssAnimate, // Now imported correctly
  ],
};
