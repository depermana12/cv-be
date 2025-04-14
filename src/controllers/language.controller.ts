import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";

import { languageService } from "../services/index.service";
import {
  languageCreateSchema,
  languageUpdateSchema,
} from "../schemas/language.schema";

export const languageRoutes = new Hono();

languageRoutes
  .get("person/:personalId", async (c) => {
    const personalId = Number(c.req.param("personalId"));

    const lang = await languageService.getAllByPersonalId(personalId);

    if (!lang) {
      return c.json({ message: "language not found" }, 404);
    }
    return c.json({ message: "language found", data: lang });
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const lang = await languageService.getById(id);

    if (!lang) {
      return c.json({ message: "language not found" }, 404);
    }
    return c.json({ message: "language found", data: lang });
  })
  .post(
    "/:personalId",
    zValidator("json", languageCreateSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
      const personalId = Number(c.req.param("personalId"));
      const validateBody = c.req.valid("json");

      const created = await languageService.create(personalId, validateBody);
      return c.json({ message: "language created", data: created }, 201);
    },
  )
  .patch(
    "/:id",
    zValidator("json", languageUpdateSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
      const id = Number(c.req.param("id"));
      const validatedBody = c.req.valid("json");

      const updated = await languageService.update(id, validatedBody);
      return c.json({ message: "language updated", data: updated });
    },
  )
  .delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    await languageService.delete(id);
    return c.json({ message: "language deleted" });
  });
