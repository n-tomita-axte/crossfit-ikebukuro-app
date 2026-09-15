import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        concrete: {
          950: "#111213",
          900: "#17181A",
          800: "#1F2123",
          700: "#2A2D30",
          600: "#3A3E42",
        },
        chalk: {
          100: "#F4F3EE",
          300: "#D8D6CE",
          500: "#9A988F",
        },
        plate: {
          red: "#D6293E",
          blue: "#2F6FE0",
          yellow: "#E8B93A",
          green: "#3AA35A",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};
export default config;
