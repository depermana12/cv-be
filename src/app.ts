import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";

import router from "./routes";
import { errorHandler } from "./middlewares/error-handler";
import { notFoundHandler } from "./middlewares/not-found";
import { pinoLogger } from "./middlewares/logger";
import type { Bindings } from "./lib/types";

const app = new Hono<Bindings>().basePath("/api/v1");

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Authorization", "Content-Type"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 86400, //
  }),
);
app.use(requestId());
app.use(secureHeaders());
app.use(pinoLogger());

app.route("/", router);

app.notFound(notFoundHandler);
app.onError(errorHandler);

export default app;
