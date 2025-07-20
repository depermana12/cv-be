import { createHonoBindings } from "../lib/create-hono";
import { zValidator } from "../utils/validator";
import { workService } from "../lib/container";
import {
  createWorkSchema,
  updateWorkSchema,
  cvIdParamsSchema,
  workParamsSchema,
} from "../schemas/work.schema";

export const workRoutes = createHonoBindings()
  .get("/:cvId/works", zValidator("param", cvIdParamsSchema), async (c) => {
    const { cvId } = c.req.valid("param");

    const works = await workService.getAll(cvId);

    return c.json({
      success: true,
      message: "Works retrieved successfully",
      data: works,
    });
  })
  .get(
    "/:cvId/works/:workId",
    zValidator("param", workParamsSchema),
    async (c) => {
      const { cvId, workId } = c.req.valid("param");

      const work = await workService.getOne(cvId, workId);

      return c.json({
        success: true,
        message: "Work retrieved successfully",
        data: work,
      });
    },
  )
  .post(
    "/:cvId/works",
    zValidator("param", cvIdParamsSchema),
    zValidator("json", createWorkSchema),
    async (c) => {
      const { cvId } = c.req.valid("param");
      const workData = c.req.valid("json");

      const work = await workService.create(cvId, workData);

      return c.json(
        {
          success: true,
          message: "Work created successfully",
          data: work,
        },
        201,
      );
    },
  )
  .patch(
    "/:cvId/works/:workId",
    zValidator("param", workParamsSchema),
    zValidator("json", updateWorkSchema),
    async (c) => {
      const { cvId, workId } = c.req.valid("param");
      const updateData = c.req.valid("json");

      const work = await workService.update(cvId, workId, updateData);

      return c.json({
        success: true,
        message: "Work updated successfully",
        data: work,
      });
    },
  )
  .delete(
    "/:cvId/works/:workId",
    zValidator("param", workParamsSchema),
    async (c) => {
      const { cvId, workId } = c.req.valid("param");

      const deleted = await workService.delete(cvId, workId);

      return c.json({
        success: true,
        message: "Work deleted successfully",
        data: deleted,
      });
    },
  );
