import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "soft-white-blue": "#f0f4f8",
        "dark-blue": "#1e3a5f",
        "primary-blue": "#3b82f6",
        "accent-blue": "#60a5fa",
        "light-gray": "#e5e7eb",
        "border-gray": "#d1d5db",
      },
    },
  },
  plugins: [],
};
export default config;
