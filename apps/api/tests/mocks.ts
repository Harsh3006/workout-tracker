import type { Response } from "express";
import { vi } from "vitest";

export function createMockResponse(): Response {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
    send: vi.fn(),
  } as unknown as Response;
}
