import { Hono } from "hono";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";

import router from "./routes";
import { errorHandler } from "./middlewares/error-handler";
import { pinoLogger } from "./middlewares/logger";
import type { Bindings } from "./lib/types";
import { notFoundHandler } from "./middlewares/not-found";

const app = new Hono<Bindings>().basePath("/api/v1");

app.use(requestId());
app.use(secureHeaders());
app.use(pinoLogger());

app.route("/", router);

app.notFound(notFoundHandler);
app.onError(errorHandler);

export default app;
