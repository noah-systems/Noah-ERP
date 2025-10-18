import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#C3FF00",
        dark: "#0A0A0A",
      },
    },
  },
  plugins: [],
};

export default config;
