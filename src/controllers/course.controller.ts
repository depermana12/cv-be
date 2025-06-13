import { zValidator } from "../utils/validator";
import { courseService } from "../lib/container";
import {
  courseDescInsertSchema,
  courseDescUpdateSchema,
  courseCreateSchema,
  courseQueryOptionsSchema,
  courseUpdateSchema,
} from "../schemas/course.schema";
import { createHonoBindings } from "../lib/create-hono";

export const courseRoutes = createHonoBindings()
  .get(
    "/:cvId/courses",
    zValidator("query", courseQueryOptionsSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const options = c.req.valid("query");
      const courses = await courseService.getAllCourses(cvId, options);

      return c.json({
        success: true,
        message: `retrieved ${courses.length} course records successfully`,
        data: courses,
      });
    },
  )
  .get("/:cvId/courses/:courseId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const courseId = Number(c.req.param("courseId"));

    const course = await courseService.getCourse(cvId, courseId);

    return c.json({
      success: true,
      message: `course record ${courseId} retrieved successfully`,
      data: course,
    });
  })
  .post("/:cvId/courses", zValidator("json", courseCreateSchema), async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const courseData = c.req.valid("json");

    const newCourse = await courseService.createCourse(cvId, courseData);

    return c.json(
      {
        success: true,
        message: `course record created with ID: ${newCourse.id}`,
        data: newCourse,
      },
      201,
    );
  })
  .patch(
    "/:cvId/courses/:courseId",
    zValidator("json", courseUpdateSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const courseId = Number(c.req.param("courseId"));
      const updateData = c.req.valid("json");

      const updatedCourse = await courseService.updateCourse(
        cvId,
        courseId,
        updateData,
      );

      return c.json({
        success: true,
        message: `course record ${courseId} updated successfully`,
        data: updatedCourse,
      });
    },
  )
  .delete("/:cvId/courses/:courseId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const courseId = Number(c.req.param("courseId"));

    await courseService.deleteCourse(cvId, courseId);

    return c.json({
      success: true,
      message: `course record ${courseId} deleted successfully`,
    });
  })
  .get("/:cvId/courses/:courseId/descriptions", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const courseId = Number(c.req.param("courseId"));

    const descriptions = await courseService.getAllDescriptions(cvId, courseId);

    return c.json({
      success: true,
      message: `retrieved ${descriptions.length} description records`,
      data: descriptions,
    });
  })
  .post(
    "/:cvId/courses/:courseId/descriptions",
    zValidator("json", courseDescInsertSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const courseId = Number(c.req.param("courseId"));
      const descriptionData = c.req.valid("json");

      const newDescription = await courseService.addDescription(
        cvId,
        courseId,
        descriptionData,
      );

      return c.json(
        {
          success: true,
          message: `description added to course ${courseId}`,
          data: newDescription,
        },
        201,
      );
    },
  )
  .patch(
    "/:cvId/courses/descriptions/:descriptionId",
    zValidator("json", courseDescUpdateSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const descriptionId = Number(c.req.param("descriptionId"));
      const updateData = c.req.valid("json");

      const updatedDescription = await courseService.updateDescription(
        cvId,
        descriptionId,
        updateData,
      );

      return c.json({
        success: true,
        message: `description ${descriptionId} updated successfully`,
        data: updatedDescription,
      });
    },
  )
  .delete("/:cvId/courses/descriptions/:descriptionId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const descriptionId = Number(c.req.param("descriptionId"));

    await courseService.deleteDescription(cvId, descriptionId);

    return c.json({
      success: true,
      message: `description ${descriptionId} deleted successfully`,
    });
  });
