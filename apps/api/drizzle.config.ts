import { defineConfig } from "drizzle-kit";

import settings from "@/settings.js";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/modules/**/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    host: settings.database.host,
    port: settings.database.port,
    user: settings.database.user,
    password: settings.database.password,
    database: settings.database.name,
    ssl: settings.database.ssl,
  },
  verbose: true,
  strict: true,
});
