import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://julianrecarte.github.io",
  base: "/julianRecarte",
  trailingSlash: "always",
  integrations: [
    tailwind(),
    sitemap({
      i18n: {
        defaultLocale: "es",
        locales: {
          es: "es-ES",
          en: "en-US",
          it: "it-IT",
        },
      },
    }),
  ],
  vite: {
    ssr: {
      external: ["gsap", "lenis"],
    },
  },
});
