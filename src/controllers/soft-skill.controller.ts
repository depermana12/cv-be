import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";

import { SoftSkill } from "../services/soft-skill.service";
import {
  softSkillCreateSchema,
  softSkillUpdateSchema,
} from "../schemas/soft-skill.schema";

const softSkillService = new SoftSkill();
export const softSkillRoutes = new Hono()
  .get("/", async (c) => {
    const data = await softSkillService.getAll();
    return c.json({
      success: true,
      message: `retrieved ${data.length} records successfully`,
      data,
    });
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const softSkill = await softSkillService.getById(id);
    return c.json({
      success: true,
      message: `record ID: ${id} retrieved successfully`,
      data: softSkill,
    });
  })
  .post(
    "/",
    zValidator("json", softSkillCreateSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
      const validatedBody = c.req.valid("json");
      const newSoftSkill = await softSkillService.create(validatedBody);
      return c.json(
        {
          success: true,
          message: `new record created with ID: ${newSoftSkill.id}`,
          data: newSoftSkill,
        },
        201,
      );
    },
  )
  .patch(
    "/:id",
    zValidator("json", softSkillUpdateSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
      const id = Number(c.req.param("id"));
      const validatedBody = c.req.valid("json");

      const updated = await softSkillService.update(id, validatedBody);
      return c.json({
        success: true,
        message: `record ID: ${id} updated successfully`,
        data: updated,
      });
    },
  )
  .delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    await softSkillService.delete(id);
    return c.json({
      success: true,
      message: `record id: ${id} deleted successfully`,
    });
  });
