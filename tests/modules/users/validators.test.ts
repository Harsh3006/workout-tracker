import { describe, expect, it } from "vitest";

import { isValidEmail, isValidPassword } from "@/modules/users/validators.js";

describe("isValidEmail", () => {
  it("returns false for non-string inputs", () => {
    const values = [123, null, undefined, {}, [], true, false];
    for (const value of values) {
      expect(isValidEmail(value)).toBe(false);
    }
  });

  it("returns false for invalid email formats", () => {
    const invalidEmails = [
      "",
      " ",
      "plainaddress",
      "@missingusername.com",
      "missingdomain@.com",
      "username@com",
      "username@domain,com",
    ];
    for (const email of invalidEmails) {
      expect(isValidEmail(email)).toBe(false);
    }
  });

  it("returns true for valid email formats", () => {
    const validEmails = [
      "user@example.com",
      "john.doe@example.co.uk",
      "user+tag@example.com",
      "user_name@example.io",
    ];
    for (const email of validEmails) {
      expect(isValidEmail(email)).toBe(true);
    }
  });
});

describe("isValidPassword", () => {
  it("returns false for non-string inputs", () => {
    const values = [123, null, undefined, {}, [], true, false];
    for (const value of values) {
      expect(isValidPassword(value)).toBe(false);
    }
  });

  it("returns false for passwords shorter than 8 characters", () => {
    const shortPasswords = ["", "123", "abc", "pass", "1234567"];
    for (const password of shortPasswords) {
      expect(isValidPassword(password)).toBe(false);
    }
  });

  it("returns true for passwords with 8 or more characters", () => {
    const validPasswords = [
      "password",
      "12345678",
      "longpassword123",
      "validPass!",
    ];
    for (const password of validPasswords) {
      expect(isValidPassword(password)).toBe(true);
    }
  });
});
