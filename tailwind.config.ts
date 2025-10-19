import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        dark: "var(--sidebar)",
      },
    },
  },
  plugins: [],
};

export default config;
