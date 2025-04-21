import { Hono } from "hono";
import { zValidator } from "../utils/validator";
import { SocialService } from "../services/social.service";
import { socialInsertSchema, socialUpdateSchema } from "../db/schema/social.db";

const socialService = new SocialService();
export const socialRoutes = new Hono()
  .get("/", async (c) => {
    const data = await socialService.getAll();

    return c.json(
      {
        success: true,
        message: `retrieved ${data.length} records successfully`,
        data: data,
      },
      200,
    );
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const data = await socialService.getById(id);
    return c.json(
      {
        success: true,
        message: `record ID: ${id} retrieved successfully`,
        data: data,
      },
      200,
    );
  })
  .post("/", zValidator("json", socialInsertSchema), async (c) => {
    const validatedBody = c.req.valid("json");
    const newData = await socialService.create(validatedBody);
    return c.json(
      {
        success: true,
        message: `new record created`,
        data: newData,
      },
      201,
    );
  })
  .patch("/:id", zValidator("json", socialUpdateSchema), async (c) => {
    const id = Number(c.req.param("id"));
    const validatedBody = c.req.valid("json");

    const dataUpdated = await socialService.update(id, validatedBody);
    return c.json(
      {
        success: true,
        message: `record ID: ${id} updated successfully`,
        data: dataUpdated,
      },
      200,
    );
  })
  .delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    await socialService.delete(id);
    return c.json({
      success: true,
      message: `record id: ${id} deleted successfully`,
    });
  });
