import { afterAll, afterEach, beforeEach, vi } from "vitest";

import { postgresClient } from "@/db.js";

beforeEach(async () => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
  await postgresClient.query("BEGIN");
});

afterEach(async () => {
  await postgresClient.query("ROLLBACK");
});

afterAll(async () => {
  await postgresClient.end();
});
