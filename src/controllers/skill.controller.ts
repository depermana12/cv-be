import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";

import { Skill } from "../services/skill.service";
import { skillCreateSchema, skillUpdateSchema } from "../schemas/skill.schema";

const skillService = new Skill();
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
  .post(
    "/",
    zValidator("json", skillCreateSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
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
    },
  )
  .patch(
    "/:id",
    zValidator("json", skillUpdateSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
      const id = Number(c.req.param("id"));
      const validatedBody = c.req.valid("json");

      const updated = await skillService.update(id, validatedBody);
      return c.json({
        success: true,
        message: `record ID: ${id} updated successfully`,
        data: updated,
      });
    },
  )
  .delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    await skillService.delete(id);
    return c.json({
      success: true,
      message: `record id: ${id} deleted successfully`,
    });
  });
