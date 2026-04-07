import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        base: "#fffdf7",
        ink: "#3a3a3a",
        accent: "#ff8a5b",
        mint: "#70c1b3",
        sky: "#7eb3ff",
        soft: "#f6efe5"
      },
      boxShadow: {
        card: "0 10px 24px -14px rgba(58, 58, 58, 0.45)"
      }
    }
  },
  plugins: []
};

export default config;
