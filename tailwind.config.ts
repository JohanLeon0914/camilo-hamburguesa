import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ember: "#c52222",
        mustard: "#f4b23f",
        char: "#14110f",
        cream: "#fff8df",
        paper: "#0d0a09",
        surface: "#211714"
      },
      boxShadow: {
        glow: "0 18px 70px rgba(197, 34, 34, 0.22)"
      }
    }
  },
  plugins: []
};

export default config;
