import { pinoLogger as pG } from "hono-pino";
import pino from "pino";

export const pinoLogger = () => {
  return pG({
    pino: pino({
      level: process.env.LOG_LEVEL || "info",
      transport:
        process.env.NODE_ENV === "production"
          ? undefined
          : {
              target: "pino-pretty",
            },
    }),
  });
};
