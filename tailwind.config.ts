import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        apex: {
          black: "#0a0a0b",
          slate: "#14161a",
          border: "#1e2229",
          muted: "#6b7280",
          accent: "#22c55e",
          alert: "#ef4444",
          warning: "#f59e0b",
          panel: "#181b21",
        },
      },
    },
  },
  plugins: [],
};
export default config;
