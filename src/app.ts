import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { NotFoundError } from "./errors/not-found.error";
import router from "./routes";

const app = new Hono().basePath("/api/v1");

app.route("/", router);

app.notFound((c) => {
  return c.json({ error: "you lost bruh" }, 404);
});

app.onError((err, c) => {
  console.log("Error type:", err.constructor.name);
  if (err instanceof HTTPException) {
    return c.json(
      { success: false, error: err.name, message: err.message },
      err.status,
    );
  } else if (err instanceof NotFoundError) {
    return c.json(
      { success: false, error: err.name, message: err.message },
      404,
    );
  } else {
    return c.json(
      { error: "Internal Server Error", message: "Oops that's on us" },
      500,
    );
  }
});

export default app;
