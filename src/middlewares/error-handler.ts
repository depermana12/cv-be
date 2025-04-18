import { HTTPException } from "hono/http-exception";
import { type Context } from "hono";
import { NotFoundError } from "../errors/not-found.error";
import { BadRequestError } from "../errors/bad-request.error";

export const errorHandler = async (err: Error, c: Context) => {
  if (err instanceof HTTPException) {
    return c.json(
      { success: false, message: err.message, error: err.cause },
      err.status,
    );
  } else if (err instanceof NotFoundError) {
    return c.json(
      { success: false, message: err.message, error: err.name },
      404,
    );
  } else if (err instanceof BadRequestError) {
    return c.json(
      {
        success: false,
        message: err.message,
        error: err.name,
      },
      400,
    );
  } else {
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "Oops that's on us",
      },
      500,
    );
  }
};
