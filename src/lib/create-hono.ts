import { Hono } from "hono";
import type { Bindings } from "./types";

export const createHonoBindings = () => new Hono<Bindings>();
