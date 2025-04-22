import type { PinoLogger } from "hono-pino";
import type { JwtVariables } from "hono/jwt";
import type { RequestIdVariables } from "hono/request-id";

type UserPayload = {
  id: string;
  email: string;
  iat: number | undefined;
  exp: number | undefined;
};

export type Bindings = {
  Variables: {
    logger: PinoLogger;
  } & RequestIdVariables &
    JwtVariables<UserPayload>;
};
