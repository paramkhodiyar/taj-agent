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
        // Taj-inspired restrained palette per 01-PRODUCT-AND-UI.md §6.1
        taj: {
          burgundy: {
            DEFAULT: "#4A1521",
            deep: "#360E17",
            darkest: "#24080F",
            light: "#632230",
            surface: "#F7F2F3",
          },
          gold: {
            DEFAULT: "#B88E2E",
            muted: "#96721E",
            light: "#D8B458",
            subtle: "#F9F6ED",
          },
          cream: {
            DEFAULT: "#FBF9F5",
            warm: "#F5EFE6",
            dark: "#EDE4D6",
          },
          charcoal: {
            DEFAULT: "#1F1D1D",
            muted: "#383434",
            light: "#575252",
          },
          gray: {
            warm: "#7D7571",
            light: "#D4CDC7",
            border: "#E2DDD8",
            surface: "#F4F1ED",
          },
          status: {
            verified: "#1E5E3A",
            recent: "#2B5278",
            stale: "#875A12",
            anomalous: "#9E3C1B",
            failed: "#8A1C1C",
          },
        },
      },
      // Restrained spacing scale per 01-PRODUCT-AND-UI.md §6.3: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128
      spacing: {
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "6": "24px",
        "8": "32px",
        "12": "48px",
        "16": "64px",
        "24": "96px",
        "32": "128px",
      },
      boxShadow: {
        // Enforce No Shadows rule per 01-PRODUCT-AND-UI.md §6.1:
        // "No shadows (box-shadow, drop-shadow). Depth comes from borders, background contrast, deliberate overlap, typography, spacing, image composition."
        none: "none",
        sm: "none",
        DEFAULT: "none",
        md: "none",
        lg: "none",
        xl: "none",
        "2xl": "none",
        inner: "none",
      },
      dropShadow: {
        none: "none",
        sm: "none",
        DEFAULT: "none",
        md: "none",
        lg: "none",
        xl: "none",
        "2xl": "none",
      },
      fontFamily: {
        serif: ["Cinzel", "Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
