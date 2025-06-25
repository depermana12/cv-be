import app from "./app";
import { config } from "./config/index";

const server = Bun.serve({
  port: config.PORT,
  fetch: app.fetch,
});

console.log("SERVER RUNING ON PORT", server.port);
