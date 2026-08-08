import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import settings from "./settings.js";

export const postgresClient = new Pool({
  host: settings.database.host,
  port: settings.database.port,
  password: settings.database.password,
  database:
    settings.nodeEnv === "test"
      ? settings.database.name + "_test"
      : settings.database.name,
  user: settings.database.user,
  max: settings.database.maxConnections,
  min: settings.database.minConnections,
});

export const db = drizzle(postgresClient);
export type Database = typeof db;
export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function closeDbConnection() {
  await postgresClient.end();
}
