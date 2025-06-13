import { zValidator } from "../utils/validator";
import {
  jobApplicationCreateSchema,
  jobApplicationUpdateSchema,
  jobApplicationQueryOptionsSchema,
} from "../schemas/jobApplication.schema";
import { jobApplicationService } from "../lib/container";
import { createHonoBindings } from "../lib/create-hono";

export const jobApplicationRoutes = createHonoBindings()
  .get(
    "/",
    zValidator("query", jobApplicationQueryOptionsSchema),
    async (c) => {
      const { id } = c.get("jwtPayload");
      const options = c.req.valid("query");

      const result = await jobApplicationService.getAllJobApplications(
        Number(id),
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
  .get("/:id", async (c) => {
    const { id } = c.get("jwtPayload");
    const jobId = Number(c.req.param("id"));

    const app = await jobApplicationService.getJobApplicationById(
      jobId,
      Number(id),
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
  .post("/", zValidator("json", jobApplicationCreateSchema), async (c) => {
    const { id } = c.get("jwtPayload");
    const data = c.req.valid("json");

    const newApp = await jobApplicationService.createJobApplication(
      data,
      Number(id),
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
  .patch("/:id", zValidator("json", jobApplicationUpdateSchema), async (c) => {
    const { id } = c.get("jwtPayload");
    const jobId = Number(c.req.param("id"));
    const updateData = c.req.valid("json");

    const updated = await jobApplicationService.updateJobApplication(
      jobId,
      Number(id),
      updateData,
    );

    return c.json(
      {
        success: true,
        message: `record ID: ${jobId} updated successfully`,
        data: updated,
      },
      200,
    );
  })
  .delete("/:id", async (c) => {
    const { id } = c.get("jwtPayload");
    const jobId = Number(c.req.param("id"));

    const deleted = await jobApplicationService.deleteJobApplication(
      jobId,
      Number(id),
    );

    return c.json(
      {
        success: true,
        message: `record id: ${jobId} deleted successfully`,
        data: deleted ? "Record deleted" : "Record not found",
      },
      200,
    );
  });
