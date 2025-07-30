import { createMiddleware } from "hono/factory";
import type { UserPayload } from "../lib/types";

export const verifiedEmail = createMiddleware(async (c, next) => {
  // payload already validated by the jwt middleware
  const jwtPayload = c.get("jwtPayload") as UserPayload;

  // Check if email is verified
  if (!jwtPayload.isEmailVerified) {
    return c.json(
      {
        success: false,
        message:
          "Email verification required. Please verify your email address to access this resource.",
        data: {
          emailVerified: false,
          userEmail: jwtPayload.email,
        },
      },
      403, // Forbidden - user is authenticated but doesn't have required permissions
    );
  }
  await next();
});
