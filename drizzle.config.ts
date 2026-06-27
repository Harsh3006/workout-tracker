import { defineConfig } from "drizzle-kit";

import { DATABASE_URL } from "@/config/env.js";

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
