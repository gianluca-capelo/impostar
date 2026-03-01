/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#161622",
        surface: "#1a1a2e",
        primary: "#e2e8f0",
        secondary: "#94a3b8",
        accent: "#38bdf8",
        impostor: {
          DEFAULT: "#ef4444",
          light: "#fca5a5",
          dark: "#991b1b",
        },
        civil: {
          DEFAULT: "#22c55e",
          light: "#86efac",
          dark: "#166534",
        },
        border: "#2d2d44",
      },
    },
  },
  plugins: [],
};
