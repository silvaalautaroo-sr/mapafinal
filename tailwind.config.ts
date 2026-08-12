import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // `font-sans` now resolves to Inter, loaded in app/layout.tsx
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      colors: {
        lynx: {
          bg: "#000000",
          turquoise: "#2dd4cf",
        },
      },
    },
  },
  plugins: [],
};

export default config;
