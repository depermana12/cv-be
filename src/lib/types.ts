import type { PinoLogger } from "hono-pino";
import type { RequestIdVariables } from "hono/request-id";

export type Bindings = {
  Variables: {
    logger: PinoLogger;
    requestId: RequestIdVariables;
  };
};
