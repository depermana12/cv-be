import app from "./app";

const server = Bun.serve({
  port: 5000,
  fetch: app.fetch,
});

console.log("SERVER RUNING ON PORT", server.port);
