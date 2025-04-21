import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";

import router from "./routes";
import { errorHandler } from "./middlewares/error-handler";
import { pinoLogger } from "./middlewares/logger";
import type { PinoLogger } from "hono-pino";

type Bindings = {
  Variables: {
    logger: PinoLogger;
  };
};

const app = new Hono<Bindings>().basePath("/api/v1");

app.use(pinoLogger());
app.use(secureHeaders());
app.route("/", router);

app.notFound((c) => {
  c.var.logger.debug("you lost bruh, only seen on debug level true");
  return c.json(
    { error: "you lost bruh", message: `path: ${c.req.path} - NOT FOUND` },
    404,
  );
});

app.onError(errorHandler);

export default app;
