import { zValidator } from "../utils/validator";
import {
  createJobApplicationSchema,
  jobApplicationParamsSchema,
  jobApplicationQueryOptionsSchema,
  updateJobApplicationSchema,
} from "../schemas/jobApplication.schema";
import { jobApplicationService } from "../lib/container";
import { createHonoBindings } from "../lib/create-hono";
import type { Context } from "hono";
import type {
  JobApplicationQueryOptions,
  JobApplicationSelect,
  PaginatedJobApplicationResponse,
} from "../db/types/jobApplication.type";

/**
 * JobApplication Controller - Handles HTTP requests for job application management
 * Provides endpoints for CRUD operations and status timeline management
 */

/**
 * Extracts and validates user ID from JWT payload
 */
const extractUserId = (c: Context): number => {
  const { id: userId } = c.get("jwtPayload");
  return +userId;
};

/**
 * Creates standardized success response for job application operations
 */
const createSuccessResponse = (
  message: string,
  data: any,
  statusCode: number = 200,
) => ({
  success: true,
  message,
  data,
  ...(statusCode === 200 ? {} : {}), // Can add additional metadata if needed
});

/**
 * Creates standardized paginated response
 */
const createPaginatedResponse = (
  message: string,
  result: PaginatedJobApplicationResponse,
) => ({
  success: true,
  message,
  data: result.data,
  pagination: {
    total: result.total,
    limit: result.limit,
    offset: result.offset,
    hasMore: result.offset + result.limit < result.total,
  },
});

export const jobApplicationRoutes = createHonoBindings()
  /**
   * GET /job-applications
   * Retrieves paginated list of job applications for authenticated user
   * Supports filtering, sorting, and pagination via query parameters
   */
  .get(
    "/",
    zValidator("query", jobApplicationQueryOptionsSchema),
    async (c) => {
      const userId = extractUserId(c);
      const queryOptions: JobApplicationQueryOptions = c.req.valid("query");

      const result = await jobApplicationService.getAllJobApplications(
        userId,
        queryOptions,
      );

      const responseMessage =
        result.data.length > 0
          ? `Retrieved ${result.data.length} job application${
              result.data.length === 1 ? "" : "s"
            } successfully`
          : "No job applications found";

      return c.json(createPaginatedResponse(responseMessage, result), 200);
    },
  )

  /**
   * GET /job-applications/:id
   * Retrieves a specific job application by ID for authenticated user
   */
  .get("/:id", zValidator("param", jobApplicationParamsSchema), async (c) => {
    const userId = extractUserId(c);
    const { id: jobApplicationId } = c.req.valid("param");

    const jobApplication = await jobApplicationService.getJobApplicationById(
      jobApplicationId,
      userId,
    );

    return c.json(
      createSuccessResponse(
        `Job application #${jobApplication.id} retrieved successfully`,
        jobApplication,
      ),
      200,
    );
  })

  /**
   * POST /job-applications
   * Creates a new job application for authenticated user
   */
  .post("/", zValidator("json", createJobApplicationSchema), async (c) => {
    const userId = extractUserId(c);
    const jobApplicationData = c.req.valid("json");

    const newJobApplication = await jobApplicationService.createJobApplication(
      jobApplicationData,
      userId,
    );

    return c.json(
      createSuccessResponse(
        `Job application for ${newJobApplication.companyName} created successfully`,
        newJobApplication,
      ),
      201,
    );
  })

  /**
   * PATCH /job-applications/:id
   * Updates an existing job application for authenticated user
   * Handles status changes with optional timestamp
   */
  .patch(
    "/:id",
    zValidator("param", jobApplicationParamsSchema),
    zValidator("json", updateJobApplicationSchema),
    async (c) => {
      const userId = extractUserId(c);
      const { id: jobApplicationId } = c.req.valid("param");
      const updatePayload = c.req.valid("json");

      // Extract status change timestamp from payload
      const { statusChangedAt, ...updateData } = updatePayload;

      const updatedJobApplication =
        await jobApplicationService.updateJobApplication(
          jobApplicationId,
          userId,
          updateData,
          statusChangedAt,
        );

      const statusChangeMessage = updateData.status
        ? ` with status updated to "${updateData.status}"`
        : "";

      return c.json(
        createSuccessResponse(
          `Job application #${jobApplicationId} updated successfully${statusChangeMessage}`,
          updatedJobApplication,
        ),
        200,
      );
    },
  )

  /**
   * DELETE /job-applications/:id
   * Deletes a job application and associated status history for authenticated user
   */
  .delete(
    "/:id",
    zValidator("param", jobApplicationParamsSchema),
    async (c) => {
      const userId = extractUserId(c);
      const { id: jobApplicationId } = c.req.valid("param");

      const deletionSuccessful =
        await jobApplicationService.deleteJobApplication(
          jobApplicationId,
          userId,
        );

      if (deletionSuccessful) {
        return c.json(
          createSuccessResponse(
            `Job application #${jobApplicationId} deleted successfully`,
            { deleted: true, id: jobApplicationId },
          ),
          200,
        );
      } else {
        return c.json(
          createSuccessResponse(
            `Job application #${jobApplicationId} could not be deleted`,
            { deleted: false, id: jobApplicationId },
          ),
          200,
        );
      }
    },
  )

  /**
   * GET /job-applications/:id/statuses
   * Retrieves complete status timeline for a specific job application
   */
  .get(
    "/:id/statuses",
    zValidator("param", jobApplicationParamsSchema),
    async (c) => {
      const userId = extractUserId(c);
      const { id: jobApplicationId } = c.req.valid("param");

      const statusTimeline = await jobApplicationService.getStatusTimeline(
        jobApplicationId,
        userId,
      );

      const timelineMessage =
        statusTimeline.length > 0
          ? `Status timeline for job application #${jobApplicationId} (${
              statusTimeline.length
            } status change${statusTimeline.length === 1 ? "" : "s"})`
          : `No status history found for job application #${jobApplicationId}`;

      return c.json(
        createSuccessResponse(timelineMessage, statusTimeline),
        200,
      );
    },
  );
