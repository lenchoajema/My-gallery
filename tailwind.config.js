/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1B1F2B",
          light: "#3A4056",
          faint: "#9AA0B4",
        },
        paper: "#F6F1E7",
        paper2: "#EFE7D8",
        brass: {
          DEFAULT: "#C9A227",
          bright: "#E4BE4A",
        },
        rose: {
          DEFAULT: "#C4626B",
          dark: "#A44851",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 10px 30px -10px rgba(0,0,0,0.35)",
        tape: "0 2px 4px rgba(0,0,0,0.15)",
      },
    },
  },
  plugins: [],
};
