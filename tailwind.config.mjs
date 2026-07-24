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
          purple: "#5B1FFF",
        },
        dark: {
          card: "#252525",
          copy: "#F0F0F0",
          muted: "#888888",
        },
      },
      fontFamily: {
        satoshi: ["Satoshi", "sans-serif"],
      },

    },
  },
  plugins: [],
};
