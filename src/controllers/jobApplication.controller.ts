import { zValidator } from "../utils/validator";
import {
  createJobApplicationSchema,
  jobApplicationParamsSchema,
  jobApplicationQueryOptionsSchema,
  updateJobApplicationSchema,
} from "../schemas/jobApplication.schema";
import { jobApplicationService } from "../lib/container";
import { createHonoBindings } from "../lib/create-hono";

export const jobApplicationRoutes = createHonoBindings()
  .get(
    "/",
    zValidator("query", jobApplicationQueryOptionsSchema),
    async (c) => {
      const { id: userId } = c.get("jwtPayload");
      const options = c.req.valid("query");

      const result = await jobApplicationService.getAllJobApplications(
        +userId,
        options,
      );

      return c.json(
        {
          success: true,
          message: `retrieved ${result.data.length} records successfully`,
          data: result.data,
          pagination: {
            total: result.total,
            limit: result.limit,
            offset: result.offset,
          },
        },
        200,
      );
    },
  )
  .get("/:id", zValidator("param", jobApplicationParamsSchema), async (c) => {
    const { id: userId } = c.get("jwtPayload");
    const { id: jobId } = c.req.valid("param");

    const app = await jobApplicationService.getJobApplicationById(
      jobId,
      +userId,
    );

    return c.json(
      {
        success: true,
        message: `record ID: ${app.id} retrieved successfully`,
        data: app,
      },
      200,
    );
  })
  .post("/", zValidator("json", createJobApplicationSchema), async (c) => {
    const { id: userId } = c.get("jwtPayload");
    const data = c.req.valid("json");

    const newApp = await jobApplicationService.createJobApplication(
      data,
      +userId,
    );

    return c.json(
      {
        success: true,
        message: `new record created`,
        data: newApp,
      },
      201,
    );
  })
  .patch(
    "/:id",
    zValidator("param", jobApplicationParamsSchema),
    zValidator("json", updateJobApplicationSchema),
    async (c) => {
      const { id: userId } = c.get("jwtPayload");
      const { id: jobId } = c.req.valid("param");
      const updateData = c.req.valid("json");

      const { statusChangedAt, ...formData } = updateData;

      const updated = await jobApplicationService.updateJobApplication(
        jobId,
        +userId,
        formData,
        statusChangedAt,
      );

      return c.json(
        {
          success: true,
          message: `record ID: ${jobId} updated successfully`,
          data: updated,
        },
        200,
      );
    },
  )
  .delete(
    "/:id",
    zValidator("param", jobApplicationParamsSchema),
    async (c) => {
      const { id: userId } = c.get("jwtPayload");
      const { id: jobId } = c.req.valid("param");

      const deleted = await jobApplicationService.deleteJobApplication(
        jobId,
        +userId,
      );

      return c.json(
        {
          success: true,
          message: `record id: ${jobId} deleted successfully`,
          data: deleted ? "Record deleted" : "Record not found",
        },
        200,
      );
    },
  )
  .get(
    "/:id/statuses",
    zValidator("param", jobApplicationParamsSchema),
    async (c) => {
      const { id: userId } = c.get("jwtPayload");
      const { id: jobId } = c.req.valid("param");

      const timeline = await jobApplicationService.getStatusTimeline(
        jobId,
        +userId,
      );

      return c.json(
        {
          success: true,
          message: `Status timeline for application ID ${jobId}`,
          data: timeline,
        },
        200,
      );
    },
  );
