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
        brand: {
          DEFAULT: "#E74E1B",
          dark: "#C23F16",
          light: "#FDE7DE",
        },
        accent: {
          DEFAULT: "#1D71B6",
          dark: "#14507F",
          light: "#E1EEF8",
        },
        signal: {
          DEFAULT: "#2F6F5E",
          dark: "#1F4E42",
          light: "#DCEAE5",
        },
        alert: {
          DEFAULT: "#C23B24",
          dark: "#8C2A19",
          light: "#F7E1DC",
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
