import { createHonoBindings } from "../lib/create-hono";
import { zValidator } from "../utils/validator";
import { educationService } from "../lib/container";
import {
  createEducationSchema,
  updateEducationSchema,
  cvIdParamsSchema,
  educationParamsSchema,
} from "../schemas/education.schema";

export const educationRoutes = createHonoBindings()
  .get(
    "/:cvId/educations",
    zValidator("param", cvIdParamsSchema),
    async (c) => {
      const { cvId } = c.req.valid("param");

      const educations = await educationService.getAll(cvId);

      return c.json({
        success: true,
        message: "Educations retrieved successfully",
        data: educations,
      });
    },
  )
  .get(
    "/:cvId/educations/:educationId",
    zValidator("param", educationParamsSchema),
    async (c) => {
      const { cvId, educationId } = c.req.valid("param");

      const education = await educationService.getOne(cvId, educationId);

      return c.json({
        success: true,
        message: "Education retrieved successfully",
        data: education,
      });
    },
  )
  .post(
    "/:cvId/educations",
    zValidator("param", cvIdParamsSchema),
    zValidator("json", createEducationSchema),
    async (c) => {
      const { cvId } = c.req.valid("param");
      const educationData = c.req.valid("json");

      const education = await educationService.create(cvId, educationData);

      return c.json(
        {
          success: true,
          message: "Education created successfully",
          data: education,
        },
        201,
      );
    },
  )
  .patch(
    "/:cvId/educations/:educationId",
    zValidator("param", educationParamsSchema),
    zValidator("json", updateEducationSchema),
    async (c) => {
      const { cvId, educationId } = c.req.valid("param");
      const updateData = c.req.valid("json");

      const education = await educationService.update(
        cvId,
        educationId,
        updateData,
      );

      return c.json({
        success: true,
        message: "Education updated successfully",
        data: education,
      });
    },
  )
  .delete(
    "/:cvId/educations/:educationId",
    zValidator("param", educationParamsSchema),
    async (c) => {
      const { cvId, educationId } = c.req.valid("param");

      const deleted = await educationService.delete(cvId, educationId);

      return c.json({
        success: true,
        message: "Education deleted successfully",
        data: deleted,
      });
    },
  );
