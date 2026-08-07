import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";

export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@scripts": fileURLToPath(new URL("./src/scripts", import.meta.url)),
      "@i18n": fileURLToPath(new URL("./src/i18n", import.meta.url)),
      "@data": fileURLToPath(new URL("./src/data", import.meta.url)),
    },
  },
});