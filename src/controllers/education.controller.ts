import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";

import { Education } from "../services/education.service";
import {
  educationCreateSchema,
  educationUpdateSchema,
} from "../schemas/education.schema";

const educationService = new Education();
export const educationRoutes = new Hono()
  .get("/", async (c) => {
    const education = await educationService.getAll();
    return c.json(
      {
        success: true,
        message: `retrieved ${education.length} records successfully`,
        data: education,
      },
      200,
    );
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const education = await educationService.getById(id);
    return c.json(
      {
        success: true,
        message: `record ID: ${id} retrieved successfully`,
        data: education,
      },
      200,
    );
  })
  .post(
    "/",
    zValidator("json", educationCreateSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
      const validated = c.req.valid("json");
      const newEducation = await educationService.create(validated);
      return c.json(
        {
          success: true,
          message: `new record created with ID: ${newEducation.id}`,
          data: newEducation,
        },
        201,
      );
    },
  )
  .patch(
    "/:id",
    zValidator("json", educationUpdateSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
      const id = c.req.param("id");
      const validated = c.req.valid("json");
      const updatedEdu = await educationService.update(Number(id), validated);
      return c.json(
        {
          success: true,
          message: `record ID: ${id} updated successfully`,
          data: updatedEdu,
        },
        200,
      );
    },
  )
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    await educationService.delete(Number(id));
    return c.json({
      success: true,
      message: `record id: ${id} deleted successfully`,
    });
  });
