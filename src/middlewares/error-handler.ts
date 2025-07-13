import { HTTPException } from "hono/http-exception";
import { type Context } from "hono";
import { NotFoundError } from "../errors/not-found.error";
import { BadRequestError } from "../errors/bad-request.error";
import { DataBaseError } from "../errors/database.error";
import { ValidationError } from "../errors/validation.error";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { Bindings } from "../lib/types";
import { UploadError } from "../errors/upload.error";

const errResponse = (
  c: Context,
  message: string,
  error: string,
  status: ContentfulStatusCode | undefined,
  cause?: unknown,
) => {
  return c.json(
    {
      success: false,
      message,
      error,
      cause,
    },
    status,
  );
};

export const errorHandler = async (err: Error, c: Context<Bindings>) => {
  const logger = c.var?.logger ?? console;

  console.log("Error handler called with:", {
    name: err.name,
    message: err.message,
    constructor: err.constructor.name,
    isValidationError: err instanceof ValidationError,
  });

  logger.error?.(
    {
      reqId: c.var.requestId,
      name: err.name,
      message: err.message,
      cause: err.cause,
      path: c.req.path,
      method: c.req.method,
      stack: err.stack,
    },
    "Error handled",
  );
  if (err instanceof HTTPException) {
    const cause = err.cause as any;
    const isZod = cause?.type === "ZOD_VALIDATION";
    return errResponse(
      c,
      err.message,
      isZod ? "ZodValidationError" : err.constructor.name,
      err.status,
      cause?.errors ?? cause,
    );
  } else if (err instanceof NotFoundError) {
    return errResponse(c, err.message, err.name, 404);
  } else if (err instanceof BadRequestError || err instanceof DataBaseError) {
    return errResponse(c, err.message, err.name, 400);
  } else if (err instanceof ValidationError) {
    return errResponse(c, err.message, err.name, 400);
  } else if (err instanceof UploadError) {
    return errResponse(
      c,
      err.message,
      err.name,
      err.status as ContentfulStatusCode,
      err.cause,
    );
  } else {
    return errResponse(c, "Internal Server Error", "Oops that's  on us", 500);
  }
};
