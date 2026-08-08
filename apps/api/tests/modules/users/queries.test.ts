import { describe, expect, it } from "vitest";

import { createUser, getUserByEmail } from "@/modules/users/queries.js";

import { seedUser } from "../../fixtures/users.js";

describe("getUserByEmail", () => {
  it("returns a user when the email exists", async () => {
    const user = await seedUser();
    const result = await getUserByEmail(user.email);
    expect(result).toEqual(user);
  });

  it("returns undefined when the email does not exist", async () => {
    const user = await getUserByEmail("nonexistent@user.com");
    expect(user).toBeUndefined();
  });
});

describe("createUser", () => {
  it("creates a new user and returns it", async () => {
    const newUser = {
      email: "newuser@example.com",
      firstName: "New",
      lastName: "User",
      passwordHash: "newUserHash",
    };
    const createdUser = await createUser(newUser);
    expect(createdUser).toMatchObject(newUser);
  });

  it("throws when creating a user with an existing email", async () => {
    const user = await seedUser();
    await expect(
      createUser({ ...user, passwordHash: "anotherHash" })
    ).rejects.toThrow();
  });
});
