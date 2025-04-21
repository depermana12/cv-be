import { Hono } from "hono";
import { zValidator } from "../utils/validator";
import { IntroService } from "../services/intro.service";
import {
  introSelectSchema,
  introInsertSchema,
  introUpdateSchema,
} from "../db/schema/intro.db";

const introService = new IntroService();
export const introRoutes = new Hono()
  .get("/", async (c) => {
    const intro = await introService.getAll();

    return c.json(
      {
        success: true,
        message: `retrieved ${intro.length} records successfully`,
        data: intro,
      },
      200,
    );
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const intro = await introService.getById(id);
    return c.json(
      {
        success: true,
        message: `record ID: ${id} retrieved successfully`,
        data: intro,
      },
      200,
    );
  })
  .post("/", zValidator("json", introInsertSchema), async (c) => {
    const validatedBody = c.req.valid("json");
    const newIntro = await introService.create(validatedBody);
    return c.json(
      {
        success: true,
        message: `new record created`,
        data: newIntro,
      },
      201,
    );
  })
  .patch("/:id", zValidator("json", introUpdateSchema), async (c) => {
    const id = Number(c.req.param("id"));
    const validatedBody = c.req.valid("json");

    const introUpdated = await introService.update(id, validatedBody);
    return c.json(
      {
        success: true,
        message: `record ID: ${id} updated successfully`,
        data: introUpdated,
      },
      200,
    );
  })
  .delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    await introService.delete(id);
    return c.json({
      success: true,
      message: `record id: ${id} deleted successfully`,
    });
  });
