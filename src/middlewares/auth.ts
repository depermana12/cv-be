import { jwt as jsonWebToken } from "hono/jwt";

export const jwt = () => {
  return jsonWebToken({
    secret: process.env.SECRET!,
  });
};
