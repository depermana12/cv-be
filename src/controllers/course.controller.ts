import { Hono } from "hono";
import { zValidator } from "../utils/validator";

import { CourseService } from "../services/course.service";
import {
  courseInsertSchema,
  courseUpdateSchema,
} from "../schemas/course.schema";

const courseService = new CourseService();
export const courseRoutes = new Hono()
  .get("/", async (c) => {
    const data = await courseService.getAll();
    return c.json({
      success: true,
      message: `retrieved ${data.length} records successfully`,
      data,
    });
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const course = await courseService.getById(id);
    return c.json({
      success: true,
      message: `record ID: ${id} retrieved successfully`,
      data: course,
    });
  })
  .post("/", zValidator("json", courseInsertSchema), async (c) => {
    const validated = c.req.valid("json");
    const newCourse = await courseService.create(validated);

    return c.json(
      {
        success: true,
        message: `new record created with ID: ${newCourse.id}`,
        data: newCourse,
      },
      201,
    );
  })
  .patch("/:id", zValidator("json", courseUpdateSchema), async (c) => {
    const id = Number(c.req.param("id"));
    const validated = c.req.valid("json");

    const updated = await courseService.update(id, validated);
    return c.json({
      success: true,
      message: `record ID: ${id} updated successfully`,
      data: updated,
    });
  })
  .delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    await courseService.delete(id);
    return c.json({
      success: true,
      message: `record id: ${id} deleted successfully`,
    });
  });
