import { Hono } from "hono";
import { zValidator } from "../utils/validator";

import { languageService } from "../services/index.service";
import {
  languageInsertSchema,
  languageUpdateSchema,
} from "../schemas/language.schema";

export const languageRoutes = new Hono()
  .get("person/:personalId", async (c) => {
    const personalId = Number(c.req.param("personalId"));
    const lang = await languageService.getAllByPersonalId(personalId);
    return c.json({
      success: true,
      message: `retrieved ${lang.length} records successfully`,
      data: lang,
    });
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const lang = await languageService.getById(id);
    return c.json({
      success: true,
      message: `record ID: ${id} retrieved successfully`,
      data: lang,
    });
  })
  .post("/:personalId", zValidator("json", languageInsertSchema), async (c) => {
    const personalId = Number(c.req.param("personalId"));
    const validateBody = c.req.valid("json");

    const created = await languageService.create(validateBody);
    return c.json(
      {
        success: true,
        message: `new record created with ID: ${created.id}`,
        data: created,
      },
      201,
    );
  })
  .patch("/:id", zValidator("json", languageUpdateSchema), async (c) => {
    const id = Number(c.req.param("id"));
    const validatedBody = c.req.valid("json");
    const updated = await languageService.update(id, validatedBody);
    return c.json({
      success: true,
      message: `record ID: ${id} updated successfully`,
      data: updated,
    });
  })
  .delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    await languageService.delete(id);
    return c.json({
      success: true,
      message: `record id: ${id} deleted successfully`,
    });
  });
