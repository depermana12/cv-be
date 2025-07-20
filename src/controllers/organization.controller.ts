import { createHonoBindings } from "../lib/create-hono";
import { zValidator } from "../utils/validator";
import { organizationService } from "../lib/container";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  cvIdParamsSchema,
  organizationParamsSchema,
} from "../schemas/organization.schema";

export const organizationRoutes = createHonoBindings()
  .get(
    "/:cvId/organizations",
    zValidator("param", cvIdParamsSchema),
    async (c) => {
      const { cvId } = c.req.valid("param");

      const organizations = await organizationService.getAll(cvId);

      return c.json({
        success: true,
        message: "Organizations retrieved successfully",
        data: organizations,
      });
    },
  )
  .get(
    "/:cvId/organizations/:organizationId",
    zValidator("param", organizationParamsSchema),
    async (c) => {
      const { cvId, organizationId } = c.req.valid("param");

      const organization = await organizationService.getOne(
        cvId,
        organizationId,
      );

      return c.json({
        success: true,
        message: "Organization retrieved successfully",
        data: organization,
      });
    },
  )
  .post(
    "/:cvId/organizations",
    zValidator("param", cvIdParamsSchema),
    zValidator("json", createOrganizationSchema),
    async (c) => {
      const { cvId } = c.req.valid("param");
      const organizationData = c.req.valid("json");

      const organization = await organizationService.create(
        cvId,
        organizationData,
      );

      return c.json(
        {
          success: true,
          message: "Organization created successfully",
          data: organization,
        },
        201,
      );
    },
  )
  .patch(
    "/:cvId/organizations/:organizationId",
    zValidator("param", organizationParamsSchema),
    zValidator("json", updateOrganizationSchema),
    async (c) => {
      const { cvId, organizationId } = c.req.valid("param");
      const updateData = c.req.valid("json");

      const organization = await organizationService.update(
        cvId,
        organizationId,
        updateData,
      );

      return c.json({
        success: true,
        message: "Organization updated successfully",
        data: organization,
      });
    },
  )
  .delete(
    "/:cvId/organizations/:organizationId",
    zValidator("param", organizationParamsSchema),
    async (c) => {
      const { cvId, organizationId } = c.req.valid("param");

      const deleted = await organizationService.delete(
        cvId,
        organizationId,
      );

      return c.json({
        success: true,
        message: "Organization deleted successfully",
        data: deleted,
      });
    },
  );
