import { loadEnvFile } from "node:process";

import { defineConfig } from "vitest/config";

loadEnvFile(".env");

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
      include: ["src/**/*.ts"],
    },
    globalSetup: ["tests/global-setup.ts", "tests/global-teardown.ts"],
  },
  resolve: {
    tsconfigPaths: true,
  },
});
