import type { Config } from "tailwindcss";

/**
 * Airdvance light theme. Token names are kept stable across the codebase:
 *  night = surfaces (page, cards, inputs) · ink = text and hairlines
 *  ember = brand accent (emerald) · amber/volt/mint/rose = status colours
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: {
          DEFAULT: "#F6F5F1", // page
          900: "#EEECE6", // footer, admin bar
          800: "#FFFFFF", // cards, inputs
          700: "#E6E3DB",
          600: "#D6D2C8",
        },
        ink: {
          DEFAULT: "#12161B",
          muted: "#4A515B",
          faint: "#7B818B",
        },
        ember: {
          DEFAULT: "#0B7A55",
          400: "#0E8F64",
          300: "#086445", // accent text / links (AA on light)
          glow: "#0B7A55",
        },
        amber: { DEFAULT: "#8A5A00" },
        volt: { DEFAULT: "#2F5BD3", 300: "#2349B3" },
        mint: { DEFAULT: "#0B7A55", 300: "#086445" },
        rose: { DEFAULT: "#C2334D", 300: "#A82640" },
      },
      fontFamily: {
        display: ["'Manrope Variable'", "Manrope", "system-ui", "sans-serif"],
        body: ["'Inter Variable'", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        glow: "0 1px 2px rgba(11,122,85,.25), 0 6px 16px -6px rgba(11,122,85,.45)",
        card: "0 1px 2px rgba(18,22,27,.04), 0 8px 24px -16px rgba(18,22,27,.18)",
      },
    },
  },
  plugins: [],
};

export default config;
