import { writeFile } from "fs/promises";

import type { User } from "../models/users.js";

export class UserRepository {
  constructor(private readonly users: User[]) {}

  async getByEmail(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }

  async create(user: User): Promise<User> {
    this.users.push(user);
    await writeFile("src/data/users.json", JSON.stringify(this.users, null, 2));
    return user;
  }
}
