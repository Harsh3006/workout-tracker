import { Client } from "pg";

import settings from "@/settings.js";

const TEST_DATABASE_NAME = `${settings.database.name}Test`;

export async function teardown() {
  const client = new Client({
    host: settings.database.host,
    port: settings.database.port,
    user: settings.database.user,
    password: settings.database.password,
    database: "postgres",
  });

  await client.connect();
  await client.query(
    `DROP DATABASE IF EXISTS "${TEST_DATABASE_NAME}" WITH (FORCE);`
  );
  await client.end();
}
