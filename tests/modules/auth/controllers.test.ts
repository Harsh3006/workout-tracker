import bcrypt from "bcrypt";
import type { Request } from "express";
import jsonwebtoken from "jsonwebtoken";
import { describe, expect, it, vi } from "vitest";

import { login, signup } from "@/modules/auth/controllers.js";
import { createUser, getUserByEmail } from "@/modules/users/queries.js";
import type { User } from "@/modules/users/schema.js";
import {
  ConflictError,
  UnauthenticatedError,
  ValidationError,
} from "@/shared/errors.js";

import { createMockResponse } from "../../mocks.js";

vi.mock("bcrypt");
vi.mock("jsonwebtoken");
vi.mock("@/modules/users/queries");

const validEmail = "john@example.com";

function createSignupRequest(overrides = {}): Request {
  return {
    body: {
      email: validEmail,
      firstName: "John",
      lastName: "Doe",
      password: "validPassword123",
      ...overrides,
    },
  } as unknown as Request;
}

function createLoginRequest(overrides = {}): Request {
  return {
    body: {
      email: validEmail,
      password: "validPassword123",
      ...overrides,
    },
  } as unknown as Request;
}

function createMockUser(): User {
  return {
    id: "1",
    email: validEmail,
    firstName: "John",
    lastName: "Doe",
    passwordHash: "hashedPassword",
  };
}

describe("signup", () => {
  it("throws ValidationError if required fields are missing", async () => {
    const req = { body: {} } as unknown as Request;
    const res = createMockResponse();

    await expect(signup(req, res)).rejects.toThrow(ValidationError);
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(getUserByEmail).not.toHaveBeenCalled();
    expect(createUser).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("throws ValidationError for invalid email format", async () => {
    const req = createSignupRequest({ email: "invalid-email" });
    const res = createMockResponse();

    await expect(signup(req, res)).rejects.toThrow(ValidationError);
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(getUserByEmail).not.toHaveBeenCalled();
    expect(createUser).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("throws ValidationError for password shorter than 8 characters", async () => {
    const req = createSignupRequest({ password: "short" });
    const res = createMockResponse();

    await expect(signup(req, res)).rejects.toThrow(ValidationError);
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(getUserByEmail).not.toHaveBeenCalled();
    expect(createUser).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("throws ConflictError if email is already in use", async () => {
    const user = createMockUser();
    vi.mocked(getUserByEmail).mockResolvedValue(user);

    const req = createSignupRequest({ validEmail });
    const res = createMockResponse();

    await expect(signup(req, res)).rejects.toThrow(ConflictError);
    expect(getUserByEmail).toHaveBeenCalledExactlyOnceWith(validEmail);
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(createUser).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("creates a new user successfully with valid input", async () => {
    vi.mocked(getUserByEmail).mockResolvedValue(undefined);
    vi.mocked(bcrypt.hash).mockImplementation(async () => "hashed-password");

    const req = createSignupRequest();
    const res = createMockResponse();

    await signup(req, res);
    expect(getUserByEmail).toHaveBeenCalledExactlyOnceWith(req.body.email);
    expect(bcrypt.hash).toHaveBeenCalledExactlyOnceWith(req.body.password, 10);
    expect(createUser).toHaveBeenCalledExactlyOnceWith({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      passwordHash: "hashed-password",
    });
    expect(res.status).toHaveBeenCalledExactlyOnceWith(201);
    expect(res.json).toHaveBeenCalledExactlyOnceWith({
      message: "User created successfully.",
    });
  });
});

describe("login", () => {
  it("throws ValidationError if required fields are missing", async () => {
    const req = { body: {} } as unknown as Request;
    const res = createMockResponse();

    await expect(login(req, res)).rejects.toThrow(ValidationError);
    expect(getUserByEmail).not.toHaveBeenCalled();
    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(jsonwebtoken.sign).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("throws ValidationError for invalid email format", async () => {
    const req = createLoginRequest({ email: "invalid-email" });
    const res = createMockResponse();

    await expect(login(req, res)).rejects.toThrow(ValidationError);
    expect(getUserByEmail).not.toHaveBeenCalled();
    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(jsonwebtoken.sign).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("throws ValidationError for password shorter than 8 characters", async () => {
    const req = createLoginRequest({ password: "short" });
    const res = createMockResponse();

    await expect(login(req, res)).rejects.toThrow(ValidationError);
    expect(getUserByEmail).not.toHaveBeenCalled();
    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(jsonwebtoken.sign).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("throws UnauthenticatedError if user does not exist", async () => {
    vi.mocked(getUserByEmail).mockResolvedValue(undefined);
    const req = createLoginRequest();
    const res = createMockResponse();

    await expect(login(req, res)).rejects.toThrow(UnauthenticatedError);
    expect(getUserByEmail).toHaveBeenCalledExactlyOnceWith(req.body.email);
    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(jsonwebtoken.sign).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("throws UnauthenticatedError if password does not match", async () => {
    const user = createMockUser();
    vi.mocked(getUserByEmail).mockResolvedValue(user);
    vi.mocked(bcrypt.compare).mockImplementation(async () => false);

    const req = createLoginRequest();
    const res = createMockResponse();
    await expect(login(req, res)).rejects.toThrow(UnauthenticatedError);
    expect(getUserByEmail).toHaveBeenCalledExactlyOnceWith(req.body.email);
    expect(bcrypt.compare).toHaveBeenCalledExactlyOnceWith(
      req.body.password,
      user.passwordHash
    );
    expect(jsonwebtoken.sign).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("logs in successfully with valid credentials", async () => {
    const user = createMockUser();
    vi.mocked(getUserByEmail).mockResolvedValue(user);
    vi.mocked(bcrypt.compare).mockImplementation(async () => true);
    vi.mocked(jsonwebtoken.sign).mockImplementation(() => "mocked-jwt-token");

    const req = createLoginRequest();
    const res = createMockResponse();
    await login(req, res);

    expect(getUserByEmail).toHaveBeenCalledExactlyOnceWith(req.body.email);
    expect(bcrypt.compare).toHaveBeenCalledExactlyOnceWith(
      req.body.password,
      user.passwordHash
    );
    expect(jsonwebtoken.sign).toHaveBeenCalledExactlyOnceWith(
      { id: user.id, email: user.email },
      expect.any(String),
      { expiresIn: "1h" }
    );
    expect(res.json).toHaveBeenCalledWith({
      message: "Logged in successfully.",
      token: "mocked-jwt-token",
    });
  });
});
