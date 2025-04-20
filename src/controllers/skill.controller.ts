import { Hono } from "hono";

import { zValidator } from "../utils/validator";
import { SkillService } from "../services/skill.service";
import { skillCreateSchema, skillUpdateSchema } from "../schemas/skill.schema";

const skillService = new SkillService();
export const skillRoutes = new Hono()
  .get("/categories", async (c) => {
    const categories = await skillService.getCategories();
    return c.json({
      success: true,
      message: `retrieved categories records successfully`,
      data: categories,
    });
  })
  .get("/", async (c) => {
    const data = await skillService.getAll();
    return c.json({
      success: true,
      message: `retrieved ${data.length} records successfully`,
      data,
    });
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const skill = await skillService.getById(id);
    return c.json({
      success: true,
      message: `record ID: ${id} retrieved successfully`,
      data: skill,
    });
  })
  .post("/", zValidator("json", skillCreateSchema), async (c) => {
    const validatedBody = c.req.valid("json");
    const newSkill = await skillService.create(validatedBody);
    return c.json(
      {
        success: true,
        message: `new record created with ID: ${newSkill.id}`,
        data: newSkill,
      },
      201,
    );
  })
  .patch("/:id", zValidator("json", skillUpdateSchema), async (c) => {
    const id = Number(c.req.param("id"));
    const validatedBody = c.req.valid("json");

    const updated = await skillService.update(id, validatedBody);
    return c.json({
      success: true,
      message: `record ID: ${id} updated successfully`,
      data: updated,
    });
  })
  .delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    await skillService.delete(id);
    return c.json({
      success: true,
      message: `record id: ${id} deleted successfully`,
    });
  });
