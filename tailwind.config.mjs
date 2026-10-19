/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        copy: "#1A1613",
        accent: {
          orange: "#FF5C2B",
          warm: "#FF7A4F",
          pastel: "#FFB088",
          // Tinta para texto (cambian con el tema vía globals.css: en oscuro = orange).
          ink: "var(--clr-accent-ink)",
          deep: "var(--clr-accent-deep)",
        },
        dark: {
          card: "#252525",
          copy: "#F0F0F0",
          muted: "#A8A8A8",
        },
      },
      // Sombras de tarjeta (Projects, Process): reposo + hover. Controles flotantes usan shadow-lg/md.
      boxShadow: {
        card: "0 4px 20px rgba(26, 22, 19, 0.05)",
        "card-hover": "0 24px 48px -16px rgba(26, 22, 19, 0.14)",
      },
      fontFamily: {
        satoshi: ["Satoshi", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },

    },
  },
  plugins: [],
};
