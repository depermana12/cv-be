import { OpenAPIHono } from "@hono/zod-openapi";
import type { Bindings } from "./types";

export const createRouter = () => {
  return new OpenAPIHono<Bindings>();
};
