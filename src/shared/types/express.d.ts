import type { AuthPayload } from "@/modules/auth/types.ts";

declare module "express-serve-static-core" {
  interface Request {
    user: AuthPayload;
  }
}
