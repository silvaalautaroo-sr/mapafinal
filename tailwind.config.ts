import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
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
