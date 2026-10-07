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
          DEFAULT: "#F5F5F7", // page
          900: "#EDEDF0", // footer, admin bar
          800: "#FFFFFF", // cards, inputs
          700: "#E3E3E8",
          600: "#D2D2D7",
        },
        ink: {
          DEFAULT: "#1D1D1F",
          muted: "#6E6E73",
          faint: "#86868B",
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
        display: ["-apple-system", "BlinkMacSystemFont", "'Inter Variable'", "Inter", "system-ui", "sans-serif"],
        body: ["-apple-system", "BlinkMacSystemFont", "'Inter Variable'", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "18px",
        "3xl": "28px",
      },
      boxShadow: {
        glow: "0 1px 2px rgba(11,122,85,.25), 0 6px 16px -6px rgba(11,122,85,.45)",
        card: "0 2px 12px rgba(0,0,0,.04)",
      },
    },
  },
  plugins: [],
};

export default config;
