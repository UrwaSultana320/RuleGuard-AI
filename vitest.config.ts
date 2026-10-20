import { defineConfig } from "vitest/config";
import path from "node:path";
export default defineConfig({
  resolve: { alias: { "@": path.resolve("src") } },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    maxWorkers: 1,
    setupFiles: ["tests/offline-setup.ts"],
    environment: "node",
    restoreMocks: true,
  },
});
