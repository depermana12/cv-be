import app from "./app";
import { config } from "./config/index";

// Set server start time
process.env.SERVER_START_TIME = Date.now().toString();

const server = Bun.serve({
  port: config.PORT,
  fetch: app.fetch,
});

console.log(`Server running on port ${server.port}`);
