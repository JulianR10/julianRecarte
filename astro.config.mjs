import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import { fileURLToPath } from "url";

export default defineConfig({
  site: "https://julianrecarte.dev",
  trailingSlash: "always",
  integrations: [
    tailwind(),
    sitemap({
      // La raíz `/` es solo un redirect 308 hacia /es/: excluirla evita el
      // conflicto hreflang (dos URLs reclamando es-ES).
      filter: (page) => page !== "https://julianrecarte.dev/",
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
    build: {
      rollupOptions: {
        output: {
          // Separa los vendors pesados en chunks propios: cambian poco entre
          // deploys, así el navegador los reusa desde caché.
          // Nota: Astro intercepta manualChunks, por eso va como función
          // (match por id absoluto) y no como objeto (nombre de paquete).
          manualChunks(id) {
            if (id.includes("node_modules/gsap")) return "gsap";
            if (id.includes("node_modules/lenis")) return "lenis";
          },
        },
      },
    },
    resolve: {
      alias: {
        "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
        "@scripts": fileURLToPath(new URL("./src/scripts", import.meta.url)),
        "@i18n": fileURLToPath(new URL("./src/i18n", import.meta.url)),
        "@assets": fileURLToPath(new URL("./src/assets", import.meta.url)),
        "@layouts": fileURLToPath(new URL("./src/layouts", import.meta.url)),
        "@styles": fileURLToPath(new URL("./src/styles", import.meta.url)),
        "@data": fileURLToPath(new URL("./src/data", import.meta.url)),
      },
    },
  },
});
