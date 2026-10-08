import type { Config } from "tailwindcss";

/**
 * Airdvance "after dark" theme. Token names are stable across the codebase:
 *  night = surfaces (page, cards, inputs) · ink = text and hairlines
 *  ember = brand accent (emerald) · sun/coral/berry = Highveld-sunset art colours
 *  amber/volt/mint/rose = status colours (tuned for dark backgrounds)
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: {
          DEFAULT: "#000000", // page
          900: "#08080B", // footer, admin bar
          800: "#121217", // cards, inputs
          700: "#1B1B22",
          600: "#26262F",
        },
        ink: {
          DEFAULT: "#F4F4F6",
          muted: "#A8A8B3",
          faint: "#9090A0",
        },
        ember: {
          DEFAULT: "#34D399", // emerald: buttons (dark text on it)
          400: "#6EE7B7",
          300: "#5EEAB0", // links / accent text on dark
          glow: "#10B981",
        },
        sun: "#FFB020",
        coral: "#FF5E3A",
        berry: "#E0367A",
        amber: { DEFAULT: "#FFC24D" },
        volt: { DEFAULT: "#7C9CFF", 300: "#A9BEFF" },
        mint: { DEFAULT: "#34D399", 300: "#6EE7B7" },
        rose: { DEFAULT: "#FF6B85", 300: "#FF9AAB" },
      },
      fontFamily: {
        display: ["'Montserrat Variable'", "Montserrat", "system-ui", "sans-serif"],
        body: ["'Inter Variable'", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "18px",
        "3xl": "28px",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(52,211,153,.4), 0 10px 40px -10px rgba(16,185,129,.6)",
        card: "0 30px 60px -30px rgba(0,0,0,.9)",
      },
      keyframes: {
        rise: { from: { opacity: "0", transform: "translateY(18px)" }, to: { opacity: "1", transform: "none" } },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
      },
      animation: {
        rise: "rise .9s cubic-bezier(.2,.7,.2,1) both",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
