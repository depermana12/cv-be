import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";

import router from "./routes";
import { errorHandler } from "./middlewares/error-handler";

const app = new Hono().basePath("/api/v1");

app.use(secureHeaders());
app.route("/", router);

app.notFound((c) => {
  return c.json({ error: "you lost bruh" }, 404);
});

app.onError(errorHandler);

export default app;
