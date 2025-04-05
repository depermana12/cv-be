import app from "./app";

const server = Bun.serve({
  port: 5000,
  fetch: app.fetch,
});
