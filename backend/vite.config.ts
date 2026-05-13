import { defineConfig } from "vite";

export default defineConfig({
  build: {
    ssr: "src/index.ts",
    target: "node24",
    outDir: "dist",
  },
});
