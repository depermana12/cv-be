import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

const app = new Hono();
app.get("/", (c) => c.text("Hello cv"));

app.notFound((c) => {
  return c.json({ error: "you lost bruh" }, 404);
});

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  } else {
    return c.json({ error: "Ooops that's on us" }, 500);
  }
});

export default app;
