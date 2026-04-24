/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00A651",
        darkGreen: "#228B22",
        lightGreen: "#90EE90",
        surface: "#F8FAFC",
      },
      boxShadow: {
        sidebar: "4px 0 24px 0 rgba(0,0,0,0.08)",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}