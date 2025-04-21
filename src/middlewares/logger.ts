import { pinoLogger as pG } from "hono-pino";
import pino from "pino";

export const pinoLogger = () => {
  return pG({
    pino: pino({
      level: process.env.LOG_LEVEL || "info",
      transport: {
        target: "pino-pretty",
      },
    }),
  });
};
