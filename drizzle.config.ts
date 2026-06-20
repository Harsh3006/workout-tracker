import "dotenv/config";

import { defineConfig } from "drizzle-kit";

import { DATABASE_URL } from "./src/config/env";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/modules/**/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
