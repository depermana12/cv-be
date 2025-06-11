import { Hono } from "hono";
import { zValidator } from "../utils/validator";

import { CourseService } from "../services/course.service";
import {
  courseDescInsertSchema,
  courseDescUpdateSchema,
  courseInsertSchema,
  courseInsertWithDescSchema,
  courseQueryOptionsSchema,
  courseUpdateSchema,
} from "../schemas/course.schema";
import { CourseRepository } from "../repositories/course.repo";
import { createHonoBindings } from "../lib/create-hono";

const courseRepository = new CourseRepository();
const courseService = new CourseService(courseRepository);

export const courseRoutes = createHonoBindings()
  .get("/:cvId/courses", async (c) => {
    const cvId = Number(c.req.param("cvId"));

    const courses = await courseService.getAllCourses(cvId);

    return c.json({
      success: true,
      message: `retrieved ${courses.length} courses successfully`,
      data: courses,
    });
  })
  .get("/:cvId/courses/:courseId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const courseId = Number(c.req.param("courseId"));

    const course = await courseService.getCourse(cvId, courseId);

    return c.json({
      success: true,
      message: `course ${courseId} retrieved successfully`,
      data: course,
    });
  })
  .post("/:cvId/courses", zValidator("json", courseInsertSchema), async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const courseData = c.req.valid("json");

    const newCourse = await courseService.createCourse(cvId, courseData);

    return c.json(
      {
        success: true,
        message: `course created with ID: ${newCourse.id}`,
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
        message: `course ${courseId} updated successfully`,
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
      message: `course ${courseId} deleted successfully`,
    });
  })
  // ===== Course with Descriptions Operations =====
  // get all courses with descriptions
  .get(
    "/:cvId/courses-with-desc",
    zValidator("query", courseQueryOptionsSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const options = c.req.valid("query");

      const coursesWithDesc = await courseService.getAllCoursesWithDescriptions(
        cvId,
        options,
      );

      return c.json({
        success: true,
        message: `retrieved ${coursesWithDesc.length} courses with descriptions`,
        data: coursesWithDesc,
      });
    },
  )

  // get a course with its descriptions
  .get("/:cvId/courses/:courseId/with-desc", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const courseId = Number(c.req.param("courseId"));

    const courseWithDesc = await courseService.getCourseWithDescriptions(
      cvId,
      courseId,
    );

    return c.json({
      success: true,
      message: `course ${courseId} with descriptions retrieved successfully`,
      data: courseWithDesc,
    });
  })

  // Create course with descriptions
  .post(
    "/:cvId/courses-with-desc",
    zValidator("json", courseInsertWithDescSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const { descriptions = [], ...courseData } = c.req.valid("json");

      const newCourse = await courseService.createCourseWithDescriptions(
        cvId,
        courseData,
        descriptions,
      );

      return c.json(
        {
          success: true,
          message: `course with descriptions created with ID: ${newCourse.id}`,
          data: newCourse,
        },
        201,
      );
    },
  )

  // delete course with descriptions
  .delete("/:cvId/courses/:courseId/with-desc", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const courseId = Number(c.req.param("courseId"));

    await courseService.deleteCourseWithDescriptions(cvId, courseId);

    return c.json({
      success: true,
      message: `course ${courseId} with descriptions deleted successfully`,
    });
  })

  // ===== Course Description CRUD Operations =====

  // get all descriptions for a course
  .get("/:cvId/courses/:courseId/descriptions", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const courseId = Number(c.req.param("courseId"));

    const descriptions = await courseService.getAllCourseDescriptions(
      cvId,
      courseId,
    );

    return c.json({
      success: true,
      message: `retrieved ${descriptions.length} descriptions for course ${courseId}`,
      data: descriptions,
    });
  })

  // get a specific description
  .get("/:cvId/descriptions/:descriptionId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const descriptionId = Number(c.req.param("descriptionId"));

    const description = await courseService.getCourseDescription(
      cvId,
      descriptionId,
    );

    return c.json({
      success: true,
      message: `description ${descriptionId} retrieved successfully`,
      data: description,
    });
  })

  // add description to a course
  .post(
    "/:cvId/courses/:courseId/descriptions",
    zValidator("json", courseDescInsertSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const courseId = Number(c.req.param("courseId"));
      const descriptionData = c.req.valid("json");

      const newDescription = await courseService.addCourseDescription(
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

  // update a description
  .patch(
    "/:cvId/descriptions/:descriptionId",
    zValidator("json", courseDescUpdateSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const descriptionId = Number(c.req.param("descriptionId"));
      const updateData = c.req.valid("json");

      const updatedDescription = await courseService.updateCourseDescription(
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

  // delete a description
  .delete("/:cvId/descriptions/:descriptionId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const descriptionId = Number(c.req.param("descriptionId"));

    await courseService.deleteCourseDescription(cvId, descriptionId);

    return c.json({
      success: true,
      message: `description ${descriptionId} deleted successfully`,
    });
  });
