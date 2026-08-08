import { afterAll, afterEach, beforeEach, vi } from "vitest";

import { postgresClient } from "@/db.js";

beforeEach(async () => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

afterEach(async () => {
  await postgresClient.query(
    "TRUNCATE users, exercises, workouts RESTART IDENTITY CASCADE"
  );
});

afterAll(async () => {
  await postgresClient.end();
});
