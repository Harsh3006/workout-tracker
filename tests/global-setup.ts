import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client } from "pg";

import settings from "@/settings.js";

const TEST_DATABASE_NAME = `${settings.database.name}Test`;

function createClient(database: string) {
  return new Client({
    host: settings.database.host,
    port: settings.database.port,
    user: settings.database.user,
    password: settings.database.password,
    database,
  });
}

export async function setup() {
  const adminClient = createClient("postgres");
  await adminClient.connect();

  await adminClient.query(
    `DROP DATABASE IF EXISTS "${TEST_DATABASE_NAME}" WITH (FORCE);`
  );
  await adminClient.query(`CREATE DATABASE "${TEST_DATABASE_NAME}";`);
  await adminClient.end();

  const migrationClient = createClient(TEST_DATABASE_NAME);
  await migrationClient.connect();

  const db = drizzle(migrationClient);
  await migrate(db, { migrationsFolder: "./drizzle" });
  await migrationClient.end();
}
