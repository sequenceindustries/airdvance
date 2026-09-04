import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#F5F5F4",
        paper: "#0A0A0B",
        surface: {
          DEFAULT: "#151516",
          2: "#1C1C1F",
        },
        slate: {
          50: "#F5F6F7",
          100: "#E7E9EC",
          200: "#CBD0D6",
          400: "#8A919C",
          600: "#4B525C",
          800: "#262B33",
        },
        brand: {
          DEFAULT: "#E74E1B",
          dark: "#FF8A5B",
          light: "#2A160D",
        },
        accent: {
          DEFAULT: "#3B8FD1",
          dark: "#7FC0F0",
          light: "#12222E",
        },
        signal: {
          DEFAULT: "#35A583",
          dark: "#6FE3BE",
          light: "#0E2620",
        },
        alert: {
          DEFAULT: "#E5503A",
          dark: "#FF9280",
          light: "#301410",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
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
