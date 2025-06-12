import { zValidator } from "../utils/validator";
import { EducationService } from "../services/education.service";
import {
  educationInsertSchema,
  educationUpdateSchema,
  educationQueryOptionsSchema,
} from "../schemas/education.schema";
import { EducationRepository } from "../repositories/education.repo";
import { createHonoBindings } from "../lib/create-hono";

const educationRepository = new EducationRepository();
const educationService = new EducationService(educationRepository);

export const educationRoutes = createHonoBindings()
  .get(
    "/:cvId/educations",
    zValidator("query", educationQueryOptionsSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const options = c.req.valid("query");

      const educations = await educationService.getAllEducations(cvId, options);

      return c.json({
        success: true,
        message: `retrieved ${educations.length} education records successfully`,
        data: educations,
      });
    },
  )
  .get("/:cvId/educations/:educationId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const educationId = Number(c.req.param("educationId"));

    const education = await educationService.getEducation(cvId, educationId);

    return c.json({
      success: true,
      message: `education record ${educationId} retrieved successfully`,
      data: education,
    });
  })
  .post(
    "/:cvId/educations",
    zValidator("json", educationInsertSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const educationData = c.req.valid("json");

      const newEducation = await educationService.createEducation(
        cvId,
        educationData,
      );

      return c.json(
        {
          success: true,
          message: `education record created with ID: ${newEducation.id}`,
          data: newEducation,
        },
        201,
      );
    },
  )
  .patch(
    "/:cvId/educations/:educationId",
    zValidator("json", educationUpdateSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const educationId = Number(c.req.param("educationId"));
      const updateData = c.req.valid("json");

      const updatedEducation = await educationService.updateEducation(
        cvId,
        educationId,
        updateData,
      );

      return c.json({
        success: true,
        message: `education record ${educationId} updated successfully`,
        data: updatedEducation,
      });
    },
  )
  .delete("/:cvId/educations/:educationId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const educationId = Number(c.req.param("educationId"));

    await educationService.deleteEducation(cvId, educationId);

    return c.json({
      success: true,
      message: `education record ${educationId} deleted successfully`,
    });
  });
