import { describe, expect, it } from "vitest";

import { validateEmail, validatePassword } from "@/modules/users/validators.js";
import { ValidationError } from "@/shared/errors.js";

describe("validateEmail", () => {
  it("throws ValidationError for non-string inputs", () => {
    const values = [123, null, undefined, {}, [], true, false];
    for (const value of values) {
      expect(() => validateEmail(value)).toThrow(ValidationError);
    }
  });

  it("throws ValidationError for invalid email formats", () => {
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
      expect(() => validateEmail(email)).toThrow(ValidationError);
    }
  });

  it("does not throw for valid email formats", () => {
    const validEmails = [
      "user@example.com",
      "john.doe@example.co.uk",
      "user+tag@example.com",
      "user_name@example.io",
    ];
    for (const email of validEmails) {
      expect(() => validateEmail(email)).not.toThrow();
    }
  });
});

describe("validatePassword", () => {
  it("throws ValidationError for non-string inputs", () => {
    const values = [123, null, undefined, {}, [], true, false];
    for (const value of values) {
      expect(() => validatePassword(value)).toThrow(ValidationError);
    }
  });

  it("throws ValidationError for passwords shorter than 8 characters", () => {
    const shortPasswords = ["", "123", "abc", "pass", "1234567"];
    for (const password of shortPasswords) {
      expect(() => validatePassword(password)).toThrow(ValidationError);
    }
  });

  it("does not throw for passwords with 8 or more characters", () => {
    const validPasswords = [
      "password",
      "12345678",
      "longpassword123",
      "validPass!",
    ];
    for (const password of validPasswords) {
      expect(() => validatePassword(password)).not.toThrow();
    }
  });
});
