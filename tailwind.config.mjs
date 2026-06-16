/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        background: "#F2ECE4",
        copy: "#1A1613",
        accent: {
          orange: "#FF5C2B",
          pastel: "#FFB088",
          purple: "#5B1FFF",
        },
        dark: {
          bg: "#1A1A1A",
          card: "#252525",
          copy: "#F0F0F0",
          muted: "#888888",
        },
      },
      fontFamily: {
        clash: ["Clash Display", "sans-serif"],
        satoshi: ["Satoshi", "sans-serif"],
        serif: ["DM Serif Display", "serif"],
      },

    },
  },
  plugins: [],
};
