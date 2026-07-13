import { eq } from "drizzle-orm";

import { db } from "@/db.js";

import type { NewUser, User } from "./schema.js";
import { users } from "./schema.js";

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

export async function createUser(user: NewUser): Promise<User> {
  const [createdUser] = await db.insert(users).values(user).returning();
  if (!createdUser)
    throw new Error("Failed to create user: database returned no rows.");
  return createdUser;
}
