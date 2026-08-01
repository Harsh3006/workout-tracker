import { db } from "@/db.js";
import type { NewUser, User } from "@/modules/users/schema.js";
import { users } from "@/modules/users/schema.js";

export async function seedUser(
  overrides: Partial<NewUser> = {}
): Promise<User> {
  const [user] = await db
    .insert(users)
    .values({
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      passwordHash: "$2b$10$dummyHashForTestingOnly",
      ...overrides,
    })
    .returning();
  return user!;
}
