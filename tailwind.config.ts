import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#12151B",
        paper: "#F7F7F5",
        slate: {
          50: "#F5F6F7",
          100: "#E7E9EC",
          200: "#CBD0D6",
          400: "#8A919C",
          600: "#4B525C",
          800: "#262B33",
        },
        signal: {
          DEFAULT: "#2F6F5E",
          dark: "#1F4E42",
          light: "#DCEAE5",
        },
        alert: {
          DEFAULT: "#B4472A",
          dark: "#7C301C",
          light: "#F3E0D8",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "14px",
      },
    },
  },
  plugins: [],
};

export default config;
