import { zValidator } from "../utils/validator";
import { OrganizationService } from "../services/organization.service";
import {
  orgInsertSchema,
  orgUpdateSchema,
  orgDescInsertSchema,
  orgDescUpdateSchema,
  orgInsertWithDescSchema,
  orgQueryOptionsSchema,
} from "../schemas/organization.schema";
import { OrganizationRepository } from "../repositories/organization.repo";
import { createHonoBindings } from "../lib/create-hono";

const organizationRepository = new OrganizationRepository();
const organizationService = new OrganizationService(organizationRepository);

export const organizationRoutes = createHonoBindings()
  .get(
    "/:cvId/organizations",
    zValidator("query", orgQueryOptionsSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const options = c.req.valid("query");

      const organizations = await organizationService.getAllOrganizations(cvId);

      return c.json({
        success: true,
        message: `retrieved ${organizations.length} organization records successfully`,
        data: organizations,
      });
    },
  )
  // Get all organizations with descriptions for a CV
  .get(
    "/:cvId/organizations-with-desc",
    zValidator("query", orgQueryOptionsSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const options = c.req.valid("query");

      const organizationsWithDescriptions =
        await organizationService.getAllOrgWithDescriptions(cvId, options);

      return c.json({
        success: true,
        message: `retrieved ${organizationsWithDescriptions.length} organization records with descriptions successfully`,
        data: organizationsWithDescriptions,
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
  .get("/:cvId/organizations-with-desc/:organizationId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const organizationId = Number(c.req.param("organizationId"));

    const organizationWithDescriptions =
      await organizationService.getOrgWithDescriptions(cvId, organizationId);

    return c.json({
      success: true,
      message: `organization record ${organizationId} with descriptions retrieved successfully`,
      data: organizationWithDescriptions,
    });
  })
  .post(
    "/:cvId/organizations",
    zValidator("json", orgInsertSchema),
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
  .post(
    "/:cvId/organizations-with-desc",
    zValidator("json", orgInsertWithDescSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const { descriptions = [], ...organizationData } = c.req.valid("json");

      const newOrganizationWithDescriptions =
        await organizationService.createOrgWithDescription(
          cvId,
          organizationData,
          descriptions,
        );

      return c.json(
        {
          success: true,
          message: `organization record with descriptions created with ID: ${newOrganizationWithDescriptions.id}`,
          data: newOrganizationWithDescriptions,
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
  .delete("/:cvId/organizations-with-desc/:organizationId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const organizationId = Number(c.req.param("organizationId"));

    await organizationService.deleteOrgWithDescriptions(cvId, organizationId);

    return c.json({
      success: true,
      message: `organization record ${organizationId} with all descriptions deleted successfully`,
    });
  })
  .get("/:cvId/organizations/:organizationId/descriptions", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const organizationId = Number(c.req.param("organizationId"));

    const descriptions = await organizationService.getAllOrgDescriptions(
      cvId,
      organizationId,
    );

    return c.json({
      success: true,
      message: `retrieved ${descriptions.length} description records for organization ${organizationId}`,
      data: descriptions,
    });
  })
  .get("/:cvId/organizations/descriptions/:descriptionId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const descriptionId = Number(c.req.param("descriptionId"));

    const description = await organizationService.getOrgDescription(
      cvId,
      descriptionId,
    );

    return c.json({
      success: true,
      message: `description record ${descriptionId} retrieved successfully`,
      data: description,
    });
  })
  .post(
    "/:cvId/organizations/:organizationId/descriptions",
    zValidator("json", orgDescInsertSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const organizationId = Number(c.req.param("organizationId"));
      const descriptionData = c.req.valid("json");

      const newDescription = await organizationService.createOrgDescription(
        cvId,
        organizationId,
        descriptionData,
      );

      return c.json(
        {
          success: true,
          message: `description created with ID: ${newDescription.id} for organization ${organizationId}`,
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

      const updatedDescription = await organizationService.updateOrgDescription(
        cvId,
        descriptionId,
        updateData,
      );

      return c.json({
        success: true,
        message: `description record ${descriptionId} updated successfully`,
        data: updatedDescription,
      });
    },
  )
  .delete("/:cvId/organizations/descriptions/:descriptionId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const descriptionId = Number(c.req.param("descriptionId"));

    await organizationService.deleteOrgDescription(cvId, descriptionId);

    return c.json({
      success: true,
      message: `description record ${descriptionId} deleted successfully`,
    });
  });
