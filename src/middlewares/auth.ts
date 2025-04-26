import { jwt as jsonWebToken } from "hono/jwt";
import "dotenv/config";

import type { MiddlewareHandler } from "hono";
import {
  JwtTokenExpired,
  JwtTokenInvalid,
  JwtTokenSignatureMismatched,
} from "hono/utils/jwt/types";
import { HTTPException } from "hono/http-exception";

export const config = {
  jwtSecret: process.env.SECRET || "devmode",
  jwtAlgorithm: "HS256" as const,
};

if (!process.env.SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET is required in production");
}

export const jwt = (): MiddlewareHandler => {
  const baseJwt = jsonWebToken({
    secret: config.jwtSecret,
  });

  return async (c, next) => {
    try {
      await baseJwt(c, next);
    } catch (err: any) {
      const cause = (err instanceof HTTPException && err.cause) || err;

      let message = "unauthorized";
      let error = "error";
      if (cause instanceof JwtTokenExpired) {
        message = "token has expired";
        error = "JwtTokenExpired";
      } else if (cause instanceof JwtTokenInvalid) {
        message = "invalid token format or signature";
        error = "JwtTokenInvalid";
      } else if (cause instanceof JwtTokenSignatureMismatched) {
        message = "token signature mismatch";
        error = "JwtTokenSignatureMismatched";
      } else if (cause.message?.includes("no authorization")) {
        message = "no Authorization header provided";
        error = "JwtTokenMissing";
      }

      return c.json(
        {
          success: false,
          message,
          error,
        },
        401,
      );
    }
  };
};
