import { zValidator } from "../utils/validator";
import { WorkService } from "../services/work.service";
import {
  workCreateSchema,
  workUpdateSchema,
  workDescCreateSchema,
  workDescUpdateSchema,
  workQueryOptionsSchema,
} from "../schemas/work.schema";
import { WorkRepository } from "../repositories/work.repo";
import { createHonoBindings } from "../lib/create-hono";

const workRepository = new WorkRepository();
const workService = new WorkService(workRepository);

export const workRoutes = createHonoBindings()
  // Get all works for a CV (with descriptions by default)
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
  // Get a specific work (with descriptions)
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
  .post("/:cvId/works", zValidator("json", workCreateSchema), async (c) => {
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
  .get("/:cvId/works/:workId/descriptions", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const workId = Number(c.req.param("workId"));

    const descriptions = await workService.getAllWorkDescriptions(cvId, workId);

    return c.json({
      success: true,
      message: `retrieved ${descriptions.length} description records`,
      data: descriptions,
    });
  })
  .post(
    "/:cvId/works/:workId/descriptions",
    zValidator("json", workDescCreateSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const workId = Number(c.req.param("workId"));
      const descriptionData = c.req.valid("json");

      const newDescription = await workService.addWorkDescription(
        cvId,
        workId,
        descriptionData,
      );

      return c.json(
        {
          success: true,
          message: `description added to work ${workId}`,
          data: newDescription,
        },
        201,
      );
    },
  )
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
        message: `description ${descriptionId} updated successfully`,
        data: updatedDescription,
      });
    },
  )
  .delete("/:cvId/works/descriptions/:descriptionId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const descriptionId = Number(c.req.param("descriptionId"));

    await workService.deleteWorkDescription(cvId, descriptionId);

    return c.json({
      success: true,
      message: `description ${descriptionId} deleted successfully`,
    });
  });
