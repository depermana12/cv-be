import type { Context } from "hono";
import type { Bindings } from "../lib/types";

export const notFoundHandler = (c: Context<Bindings>) => {
  const logger = c.var?.logger ?? console;
  logger.debug(
    {
      reqId: c.var.requestId,
      path: c.req.path,
    },
    "you lost bruh, missple somthing?",
  );
  return c.json(
    { error: "you lost bruh", message: `path: ${c.req.path} - NOT FOUND` },
    404,
  );
};
