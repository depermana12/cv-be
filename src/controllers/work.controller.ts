import { zValidator } from "../utils/validator";
import { WorkService } from "../services/work.service";
import {
  workInsertSchema,
  workUpdateSchema,
  workDescInsertSchema,
  workDescUpdateSchema,
  workInsertWithDescSchema,
  workQueryOptionsSchema,
} from "../schemas/work.schema";
import { WorkRepository } from "../repositories/work.repo";
import { createHonoBindings } from "../lib/create-hono";

const workRepository = new WorkRepository();
const workService = new WorkService(workRepository);

export const workRoutes = createHonoBindings()
  .get(
    "/:cvId/works",
    zValidator("query", workQueryOptionsSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const options = c.req.valid("query");

      const works = await workService.getAllWorks(cvId, options);

      return c.json({
        success: true,
        message: `retrieved ${works.length} work records successfully`,
        data: works,
      });
    },
  )
  .get(
    "/:cvId/works-with-descriptions",
    zValidator("query", workQueryOptionsSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const options = c.req.valid("query");

      const worksWithDescriptions =
        await workService.getAllWorksWithDescriptions(cvId, options);

      return c.json({
        success: true,
        message: `retrieved ${worksWithDescriptions.length} work records with descriptions successfully`,
        data: worksWithDescriptions,
      });
    },
  )
  .get("/:cvId/works/:workId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const workId = Number(c.req.param("workId"));

    const work = await workService.getWork(cvId, workId);

    return c.json({
      success: true,
      message: `work record ${workId} retrieved successfully`,
      data: work,
    });
  })
  .post("/:cvId/works", zValidator("json", workInsertSchema), async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const workData = c.req.valid("json");

    const newWork = await workService.createWork(cvId, workData);

    return c.json(
      {
        success: true,
        message: `work record created with ID: ${newWork.id}`,
        data: newWork,
      },
      201,
    );
  })
  // ===========================
  // Create a work with multiple descriptions
  // ===========================
  .post(
    "/:cvId/works-with-descriptions",
    zValidator("json", workInsertWithDescSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const { descriptions = [], ...workData } = c.req.valid("json");

      const newWorkWithDescriptions =
        await workService.createWorkWithDescriptions(
          cvId,
          workData,
          descriptions,
        );

      return c.json(
        {
          success: true,
          message: `work record with descriptions created with ID: ${newWorkWithDescriptions.id}`,
          data: newWorkWithDescriptions,
        },
        201,
      );
    },
  )
  .patch(
    "/:cvId/works/:workId",
    zValidator("json", workUpdateSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const workId = Number(c.req.param("workId"));
      const updateData = c.req.valid("json");

      const updatedWork = await workService.updateWork(
        cvId,
        workId,
        updateData,
      );

      return c.json({
        success: true,
        message: `work record ${workId} updated successfully`,
        data: updatedWork,
      });
    },
  )
  .delete("/:cvId/works/:workId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const workId = Number(c.req.param("workId"));

    await workService.deleteWork(cvId, workId);

    return c.json({
      success: true,
      message: `work record ${workId} deleted successfully`,
    });
  })
  // Delete work with all descriptions
  .delete("/:cvId/works-with-descriptions/:workId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const workId = Number(c.req.param("workId"));

    await workService.deleteWorkWithDescriptions(cvId, workId);

    return c.json({
      success: true,
      message: `work record ${workId} with all descriptions deleted successfully`,
    });
  })
  // Get all descriptions for a work
  .get("/:cvId/works/:workId/descriptions", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const workId = Number(c.req.param("workId"));

    const descriptions = await workService.getWorkDescriptions(cvId, workId);

    return c.json({
      success: true,
      message: `retrieved ${descriptions.length} description records for work ${workId}`,
      data: descriptions,
    });
  })
  // Get a specific description
  .get("/:cvId/works/descriptions/:descriptionId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const descriptionId = Number(c.req.param("descriptionId"));

    const description = await workService.getWorkDescription(
      cvId,
      descriptionId,
    );

    return c.json({
      success: true,
      message: `description record ${descriptionId} retrieved successfully`,
      data: description,
    });
  })
  // Create a description for a work
  .post(
    "/:cvId/works/:workId/descriptions",
    zValidator("json", workDescInsertSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const workId = Number(c.req.param("workId"));
      const descriptionData = c.req.valid("json");

      const newDescription = await workService.createDescriptionForWork(
        cvId,
        workId,
        descriptionData,
      );

      return c.json(
        {
          success: true,
          message: `description created with ID: ${newDescription.id} for work ${workId}`,
          data: newDescription,
        },
        201,
      );
    },
  )
  // Update a description
  .patch(
    "/:cvId/works/descriptions/:descriptionId",
    zValidator("json", workDescUpdateSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const descriptionId = Number(c.req.param("descriptionId"));
      const updateData = c.req.valid("json");

      const updatedDescription = await workService.updateWorkDescription(
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
  // Delete a description
  .delete("/:cvId/works/descriptions/:descriptionId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const descriptionId = Number(c.req.param("descriptionId"));

    await workService.deleteWorkDescription(cvId, descriptionId);

    return c.json({
      success: true,
      message: `description record ${descriptionId} deleted successfully`,
    });
  });
