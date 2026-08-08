import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#14182B",
          soft: "#232842",
        },
        paper: {
          DEFAULT: "#FBF8F2",
          dim: "#F3EEE1",
        },
        gold: {
          300: "#E8CB8B",
          500: "#C79A4B",
          600: "#A97D34",
        },
        muted: "#6B6355",
        line: "#E4DCC9",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        sm: "2px",
      },
      backgroundImage: {
        "nib-gradient": "linear-gradient(135deg, #E8CB8B 0%, #A97D34 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
