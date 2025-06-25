import { pinoLogger as pG } from "hono-pino";
import pino from "pino";
import { config } from "../config";

export const pinoLogger = () => {
  return pG({
    pino: pino({
      level: config.LOG_LEVEL,
      transport:
        config.NODE_ENV === "production"
          ? undefined
          : {
              target: "pino-pretty",
            },
    }),
  });
};
