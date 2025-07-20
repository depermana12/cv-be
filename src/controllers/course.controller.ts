import { createHonoBindings } from "../lib/create-hono";
import { zValidator } from "../utils/validator";
import { courseService } from "../lib/container";
import {
  createCourseSchema,
  updateCourseSchema,
  cvIdParamsSchema,
  courseParamsSchema,
} from "../schemas/course.schema";

export const courseRoutes = createHonoBindings()
  .get("/:cvId/courses", zValidator("param", cvIdParamsSchema), async (c) => {
    const { cvId } = c.req.valid("param");

    const courses = await courseService.getAll(cvId);

    return c.json({
      success: true,
      message: "Courses retrieved successfully",
      data: courses,
    });
  })
  .get(
    "/:cvId/courses/:courseId",
    zValidator("param", courseParamsSchema),
    async (c) => {
      const { cvId, courseId } = c.req.valid("param");

      const course = await courseService.getOne(cvId, courseId);

      return c.json({
        success: true,
        message: "Course retrieved successfully",
        data: course,
      });
    },
  )
  .post(
    "/:cvId/courses",
    zValidator("param", cvIdParamsSchema),
    zValidator("json", createCourseSchema),
    async (c) => {
      const { cvId } = c.req.valid("param");
      const courseData = c.req.valid("json");

      const course = await courseService.create(cvId, courseData);

      return c.json(
        {
          success: true,
          message: "Course created successfully",
          data: course,
        },
        201,
      );
    },
  )
  .patch(
    "/:cvId/courses/:courseId",
    zValidator("param", courseParamsSchema),
    zValidator("json", updateCourseSchema),
    async (c) => {
      const { cvId, courseId } = c.req.valid("param");
      const updateData = c.req.valid("json");

      const course = await courseService.update(cvId, courseId, updateData);

      return c.json({
        success: true,
        message: "Course updated successfully",
        data: course,
      });
    },
  )
  .delete(
    "/:cvId/courses/:courseId",
    zValidator("param", courseParamsSchema),
    async (c) => {
      const { cvId, courseId } = c.req.valid("param");

      const deleted = await courseService.delete(cvId, courseId);

      return c.json({
        success: true,
        message: "Course deleted successfully",
        data: deleted,
      });
    },
  );
