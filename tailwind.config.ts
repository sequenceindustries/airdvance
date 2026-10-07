import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: {
          DEFAULT: "#07070B",
          900: "#0B0B12",
          800: "#11111B",
          700: "#181826",
          600: "#232336",
        },
        ink: {
          DEFAULT: "#F4F2EE",
          muted: "#B4B1C2",
          faint: "#7D7A8E",
        },
        ember: {
          DEFAULT: "#FF5A1F",
          400: "#FF7A45",
          300: "#FFA06F",
          glow: "#FF5A1F",
        },
        amber: { DEFAULT: "#FFB547" },
        volt: {
          DEFAULT: "#3D8BFF",
          300: "#8DB9FF",
        },
        mint: { DEFAULT: "#3DDC97", 300: "#8EF0C4" },
        rose: { DEFAULT: "#FF5C7A", 300: "#FF9DB0" },
      },
      fontFamily: {
        display: ["Poppins", "system-ui", "sans-serif"],
        body: ["'Inter Variable'", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
        "3xl": "28px",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,90,31,.35), 0 10px 40px -10px rgba(255,90,31,.55)",
        card: "0 1px 0 0 rgba(255,255,255,.05) inset, 0 20px 60px -30px rgba(0,0,0,.8)",
      },
      keyframes: {
        drift: {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(4%, -3%, 0) scale(1.08)" },
        },
      },
      animation: { drift: "drift 18s ease-in-out infinite" },
    },
  },
  plugins: [],
};

export default config;
