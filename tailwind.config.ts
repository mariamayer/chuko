import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Mathical signature pink
        pink: {
          DEFAULT: "#F67ADF",
          hover: "#e855cc",
          soft: "#F67ADF18",
          border: "#F67ADF40",
        },
        // Secondary accents from Mathical
        lime: { DEFAULT: "#D4F24E", soft: "#D4F24E18" },
        electric: { DEFAULT: "#5B4FE8", soft: "#5B4FE818" },
        tangerine: { DEFAULT: "#FF9A3C", soft: "#FF9A3C18" },
        // Dark mode surfaces (Mathical-style blacks)
        void:     "#000000",
        ink:      "#0A0A0A",
        carbon:   "#111111",
        graphite: "#1A1A1A",
        smoke:    "#262626",
        ash:      "#333333",
        // Light mode surfaces (warm cream)
        paper:    "#FAF9F6",
        chalk:    "#FFFFFF",
        mist:     "#F0EDE6",
        fog:      "#E4E0D8",
        stone:    "#999",
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "var(--font-space-grotesk)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.03em",
      },
      boxShadow: {
        "pink-glow": "0 0 32px #F67ADF30",
        "card-dark": "0 1px 0 #ffffff08",
      },
    },
  },
  plugins: [],
};

export default config;
