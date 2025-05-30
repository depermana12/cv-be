import { Hono } from "hono";
import { zValidator } from "../utils/validator";

import { OrganizationService } from "../services/organization.service";
import {
  organizationInsertSchema,
  organizationUpdateSchema,
  organizationDescInsertSchema,
  organizationDescUpdateSchema,
} from "../schemas/organization.schema";

const organization = new OrganizationService();
export const organizationRoutes = new Hono()
  .get("/", async (c) => {
    const orgs = await organization.getAll();
    return c.json({
      success: true,
      message: `retrieved ${orgs.length} records successfully`,
      data: orgs,
    });
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const org = await organization.getById(id);
    return c.json({
      success: true,
      message: `record ID: ${id} retrieved successfully`,
      data: org,
    });
  })
  .post("/", zValidator("json", organizationInsertSchema), async (c) => {
    const validatedBody = c.req.valid("json");
    const newOrg = await organization.create(validatedBody);
    return c.json(
      {
        success: true,
        message: `new record created with ID: ${newOrg.id}`,
        data: newOrg,
      },
      201,
    );
  })
  .patch("/:id", zValidator("json", organizationUpdateSchema), async (c) => {
    const id = Number(c.req.param("id"));
    const validatedBody = c.req.valid("json");
    const updatedOrgExp = await organization.update(id, validatedBody);
    return c.json({
      success: true,
      message: `record ID: ${id} updated successfully`,
      data: updatedOrgExp,
    });
  })
  .delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    await organization.delete(id);
    return c.json({
      success: true,
      message: `record id: ${id} deleted successfully`,
    });
  })
  .post(
    "/:id/details",
    zValidator("json", organizationDescInsertSchema),
    async (c) => {
      const orgExpId = Number(c.req.param("id"));
      const validatedBody = c.req.valid("json");

      const addedDetail = await organization.addDetail(orgExpId, validatedBody);
      return c.json({
        success: true,
        message: `new detail created with ID: ${addedDetail.id}`,
        data: addedDetail,
      });
    },
  )
  .patch(
    "/:id/details/:detailId",
    zValidator("json", organizationDescUpdateSchema),
    async (c) => {
      const id = Number(c.req.param("id"));
      const detailId = Number(c.req.param("detailId"));
      const validatedBody = c.req.valid("json");

      const existingDetail = await organization.getDetailById(detailId);

      if (existingDetail.organizationId !== id) {
        return c.json(
          {
            success: false,
            message: "detail does not belong to the given organization",
          },
          404,
        );
      }

      const updatedDetail = await organization.updateDetails(
        detailId,
        validatedBody,
      );
      return c.json({
        success: true,
        message: `detail ID: ${detailId} updated successfully`,
        data: updatedDetail,
      });
    },
  );
