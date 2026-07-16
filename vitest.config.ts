import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
      include: ["src/**/*.ts"],
    },
    globalSetup: ["tests/global-setup.ts", "tests/global-teardown.ts"],
    setupFiles: ["tests/setup.ts"],
  },
  resolve: {
    tsconfigPaths: true,
  },
});
