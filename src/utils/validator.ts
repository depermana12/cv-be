import { HTTPException } from "hono/http-exception";
import { ZodSchema } from "zod";
import type { ValidationTargets } from "hono";
import { zValidator as zV } from "@hono/zod-validator";
import { zFormatter } from "./zod-formatter";

// wraps zValidator
export const zValidator = <
  T extends ZodSchema,
  Target extends keyof ValidationTargets,
>(
  target: Target,
  schema: T,
) =>
  zV(target, schema, (result, c) => {
    if (!result.success) {
      const formattedError = zFormatter(result.error);
      throw new HTTPException(400, {
        cause: formattedError,
        message: "Validation failed",
      });
    }
  });
