import type { PinoLogger } from "hono-pino";
import type { JwtVariables } from "hono/jwt";
import type { RequestIdVariables } from "hono/request-id";

export type UserPayload = {
  id: string;
  email: string;
  isEmailVerified: boolean;
  iat?: number | undefined;
  exp?: number | undefined;
};

export type Bindings = {
  Variables: {
    logger: PinoLogger;
  } & RequestIdVariables &
    JwtVariables<UserPayload>;
};
