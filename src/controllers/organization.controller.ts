import { zValidator } from "../utils/validator";
import {
  orgCreateSchema,
  orgUpdateSchema,
  orgDescCreateSchema,
  orgDescUpdateSchema,
  orgQueryOptionsSchema,
} from "../schemas/organization.schema";
import { organizationService } from "../lib/container";
import { createHonoBindings } from "../lib/create-hono";

export const organizationRoutes = createHonoBindings()
  .get(
    "/:cvId/organizations",
    zValidator("query", orgQueryOptionsSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const options = c.req.valid("query");

      const organizations = await organizationService.getAllOrganizations(
        cvId,
        options,
      );

      return c.json({
        success: true,
        message: `retrieved ${organizations.length} organization records successfully`,
        data: organizations,
      });
    },
  )
  .get("/:cvId/organizations/:organizationId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const organizationId = Number(c.req.param("organizationId"));

    const organization = await organizationService.getOrganization(
      cvId,
      organizationId,
    );

    return c.json({
      success: true,
      message: `organization record ${organizationId} retrieved successfully`,
      data: organization,
    });
  })
  .post(
    "/:cvId/organizations",
    zValidator("json", orgCreateSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const organizationData = c.req.valid("json");

      const newOrganization = await organizationService.createOrganization(
        cvId,
        organizationData,
      );

      return c.json(
        {
          success: true,
          message: `organization record created with ID: ${newOrganization.id}`,
          data: newOrganization,
        },
        201,
      );
    },
  )
  .patch(
    "/:cvId/organizations/:organizationId",
    zValidator("json", orgUpdateSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const organizationId = Number(c.req.param("organizationId"));
      const updateData = c.req.valid("json");

      const updatedOrganization = await organizationService.updateOrganization(
        cvId,
        organizationId,
        updateData,
      );

      return c.json({
        success: true,
        message: `organization record ${organizationId} updated successfully`,
        data: updatedOrganization,
      });
    },
  )
  .delete("/:cvId/organizations/:organizationId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const organizationId = Number(c.req.param("organizationId"));

    await organizationService.deleteOrganization(cvId, organizationId);

    return c.json({
      success: true,
      message: `organization record ${organizationId} deleted successfully`,
    });
  })
  .get("/:cvId/organizations/:organizationId/descriptions", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const organizationId = Number(c.req.param("organizationId"));

    const descriptions = await organizationService.getAllDescriptions(
      cvId,
      organizationId,
    );

    return c.json({
      success: true,
      message: `retrieved ${descriptions.length} description records`,
      data: descriptions,
    });
  })
  .post(
    "/:cvId/organizations/:organizationId/descriptions",
    zValidator("json", orgDescCreateSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const organizationId = Number(c.req.param("organizationId"));
      const descriptionData = c.req.valid("json");

      const newDescription = await organizationService.addDescription(
        cvId,
        organizationId,
        descriptionData,
      );

      return c.json(
        {
          success: true,
          message: `description added to organization ${organizationId}`,
          data: newDescription,
        },
        201,
      );
    },
  )
  .patch(
    "/:cvId/organizations/descriptions/:descriptionId",
    zValidator("json", orgDescUpdateSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const descriptionId = Number(c.req.param("descriptionId"));
      const updateData = c.req.valid("json");

      const updatedDescription = await organizationService.updateDescription(
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
  .delete("/:cvId/organizations/descriptions/:descriptionId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const descriptionId = Number(c.req.param("descriptionId"));

    await organizationService.deleteDescription(cvId, descriptionId);

    return c.json({
      success: true,
      message: `description ${descriptionId} deleted successfully`,
    });
  });
