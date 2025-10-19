import { createHonoBindings } from "../lib/create-hono";

export const healthRoutes = createHonoBindings().get("/", async (c) => {
  const startTime = process.env.SERVER_START_TIME
    ? parseInt(process.env.SERVER_START_TIME)
    : Date.now();

  const uptime = Math.floor((Date.now() - startTime) / 1000); // in seconds

  const uptimeFormatted = formatUptime(uptime);

  return c.json(
    {
      status: "healthy",
      message: "System is running normally",
      uptime: uptimeFormatted,
      timestamp: new Date().toISOString(),
    },
    200,
  );
});

/**
 * Formats uptime in seconds to a human-readable string
 * @param seconds Uptime in seconds
 * @returns Formatted string like "2 days 3 hours 45 minutes 30 seconds"
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds -= days * 24 * 60 * 60;

  const hours = Math.floor(seconds / (60 * 60));
  seconds -= hours * 60 * 60;

  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;

  const parts = [];

  if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
  if (seconds > 0 || parts.length === 0)
    parts.push(`${seconds} second${seconds !== 1 ? "s" : ""}`);

  return parts.join(" ");
}
