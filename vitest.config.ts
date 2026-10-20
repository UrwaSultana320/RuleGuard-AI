import { defineConfig } from "vitest/config";
import path from "node:path";
export default defineConfig({
  resolve: { alias: { "@": path.resolve("src") } },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    maxWorkers: 1,
    environment: "node",
    restoreMocks: true,
  },
});
