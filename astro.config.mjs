import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://julianrecarte.github.io",
  base: "/julianRecarte",
  integrations: [tailwind()],
  vite: {
    ssr: {
      external: ["gsap", "lenis"],
    },
  },
});
