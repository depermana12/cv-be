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
      const allMessage = result.error.issues.map((issue) => issue.message);
      throw new HTTPException(400, {
        message: `[zValidationError] 
        ${allMessage.join(" | ")}`,
        cause: {
          type: "ZOD_VALIDATION",
          errors: formattedError,
        },
      });
    }
  });
