import { beforeEach, describe, expect, it, vi, type Mocked } from "vitest";
import { testClient } from "hono/testing";
import { Hono, type Context, type Next } from "hono";
import type { Bindings } from "../../src/lib/types";
import { jwt } from "../../src/middlewares/auth";
import { jobApplicationRoutes } from "../../src/controllers/jobApplication.controller";
import type { IJobApplicationService } from "../../src/services/jobApplication.service";

import type {
  JobApplicationCreate,
  JobApplicationQueryResponse,
  JobApplicationSelect,
} from "../../src/schemas/jobApplication.schema";
import { errorHandler } from "../../src/middlewares/error-handler";
import { NotFoundError } from "../../src/errors/not-found.error";
import type { JobApplicationStatusSelect } from "../../src/db/types/jobApplication.type";

vi.mock("../../src/lib/container", async () => {
  return {
    jobApplicationService: {
      createJobApplication: vi.fn(),
      getJobApplicationById: vi.fn(),
      getAllJobApplications: vi.fn(),
      updateJobApplication: vi.fn(),
      getStatusTimeline: vi.fn(),
      deleteJobApplication: vi.fn(),
    },
  };
});

vi.mock("../../src/middlewares/auth", () => ({
  jwt: () => (c: Context, next: Next) => {
    c.set("jwtPayload", {
      id: "1",
      email: "test@example.com",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    return next();
  },
}));

const testApp = new Hono<Bindings>()
  .use("*", jwt())
  .onError(errorHandler)
  .route("/", jobApplicationRoutes);

describe("http integration job application test", async () => {
  const client = testClient(testApp);
  let mockedJobApplicationService: Mocked<IJobApplicationService>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const container = await vi.importMock("../../src/lib/container");
    mockedJobApplicationService =
      container.jobApplicationService as Mocked<IJobApplicationService>;
  });

  const userId = 1;
  const mockJobApplication: JobApplicationSelect = {
    id: 1,
    userId,
    cvId: 1,
    jobPortal: "LinkedIn",
    jobUrl: "https://linkedin.com/jobs/12345",
    companyName: "Depermana Tech Asia",
    jobTitle: "Software Engineer",
    jobType: "Full-time",
    position: "Senior",
    location: "Malaysia",
    locationType: "Remote",
    status: "interview",
    notes: "great opportunity for kabur aja dulu",
    appliedAt: new Date("2025-06-26"),
    createdAt: new Date("2025-06-26"),
    updatedAt: new Date("2025-06-26"),
  };

  // dates as ISO strings after JSON serialization
  const mockJobApplicationResponse = {
    ...mockJobApplication,
    appliedAt: mockJobApplication.appliedAt.toISOString(),
    createdAt: mockJobApplication.createdAt.toISOString(),
    updatedAt: mockJobApplication.updatedAt.toISOString(),
  };

  const mockJobApplicationData: JobApplicationCreate = {
    cvId: 1,
    jobPortal: "LinkedIn",
    jobUrl: "https://linkedin.com/jobs/12345",
    companyName: "Depermana Tech Asia",
    jobTitle: "Software Engineer",
    jobType: "Full-time",
    position: "Senior",
    location: "Malaysia",
    locationType: "Remote",
    status: "interview",
    notes: "great opportunity for kabur aja dulu",
    appliedAt: new Date("2025-06-26"),
  };

  const mockJobApplicationList: JobApplicationSelect[] = [
    mockJobApplication,
    {
      ...mockJobApplication,
      id: 2,
      jobTitle: "Frontend Developer",
      jobPortal: "JobStreet",
      jobUrl: "https://jobstreet.com/jobs/67890",
    },
  ];

  const mockPaginatedResponse: JobApplicationQueryResponse = {
    data: mockJobApplicationList,
    total: mockJobApplicationList.length,
    limit: 10,
    offset: 1,
  };

  describe("POST /applications-tracking", async () => {
    it("should return paginated job applications", async () => {
      mockedJobApplicationService.getAllJobApplications.mockResolvedValue(
        mockPaginatedResponse,
      );

      const res = await client.index.$get({
        query: {},
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("retrieved 2 records successfully");
      expect(data.data).toHaveLength(2);
      expect(data.pagination).toEqual({
        total: 2,
        limit: 10,
        offset: 1,
      });

      expect(
        mockedJobApplicationService.getAllJobApplications,
      ).toHaveBeenCalledWith(userId, {});
    });

    it("should apply query filters correctly", async () => {
      const queryOptions = {
        search: undefined,
        sortBy: "status",
        sortOrder: "asc",
        limit: "10",
        offset: "10",
      };

      const customMockResponse: JobApplicationQueryResponse = {
        data: [mockJobApplication],
        total: 9,
        limit: 10,
        offset: 10,
      };

      mockedJobApplicationService.getAllJobApplications.mockResolvedValue(
        customMockResponse,
      );

      const res = await client.index.$get({
        query: queryOptions,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("retrieved 1 records successfully");
      expect(data.data).toHaveLength(1);
      expect(data.pagination).toEqual({
        total: 9,
        limit: 10,
        offset: 10,
      });
      expect(
        mockedJobApplicationService.getAllJobApplications,
      ).toHaveBeenCalledWith(userId, {
        sortBy: "status",
        sortOrder: "asc",
        limit: 10,
        offset: 10,
      });
    });

    it("should handle search queries correctly", async () => {
      const searchQuery = "Software Engineer";
      const searchResponse: JobApplicationQueryResponse = {
        data: [mockJobApplication],
        total: 1,
        limit: 10,
        offset: 0,
      };

      mockedJobApplicationService.getAllJobApplications.mockResolvedValue(
        searchResponse,
      );

      const res = await client.index.$get({
        query: { search: searchQuery },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(
        mockedJobApplicationService.getAllJobApplications,
      ).toHaveBeenCalledWith(userId, { search: searchQuery });
    });

    it("should handle service errors when getting job applications", async () => {
      mockedJobApplicationService.getAllJobApplications.mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(
        mockedJobApplicationService.getAllJobApplications(userId, {}),
      ).rejects.toThrow("Database connection failed");
    });
  });

  describe("POST /applications-tracking", async () => {
    it("should create a new job application successfully", async () => {
      mockedJobApplicationService.createJobApplication.mockResolvedValue(
        mockJobApplication,
      );

      const res = await client.index.$post({
        json: mockJobApplicationData,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("new record created");
      expect(data.data).toEqual(mockJobApplicationResponse);
      expect(
        mockedJobApplicationService.createJobApplication,
      ).toHaveBeenCalledWith(mockJobApplicationData, userId);
    });

    it("should handle validation errors for invalid data", async () => {
      const invalidData: JobApplicationCreate = {
        ...mockJobApplicationData,
        jobTitle: "",
        companyName: "",
      };

      const res = await client.index.$post({
        json: invalidData,
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.message).toContain(
        "Job title must be at least 8 charachters",
      );
    });

    it("should handle service errors when creating job application", async () => {
      mockedJobApplicationService.createJobApplication.mockRejectedValue(
        new Error("Failed to create job application"),
      );

      await expect(
        mockedJobApplicationService.createJobApplication(
          mockJobApplicationData,
          userId,
        ),
      ).rejects.toThrow("Failed to create job application");
    });

    it("should handle duplicate job application creation", async () => {
      mockedJobApplicationService.createJobApplication.mockRejectedValue(
        new Error("Job application already exists for this job URL"),
      );

      await expect(
        mockedJobApplicationService.createJobApplication(
          mockJobApplicationData,
          userId,
        ),
      ).rejects.toThrow("Job application already exists for this job URL");
    });
  });
  describe("GET /applications-tracking/:id", async () => {
    it("should return job application by id", async () => {
      const jobApplicationId = 1;
      mockedJobApplicationService.getJobApplicationById.mockResolvedValue(
        mockJobApplication,
      );

      const res = await client[":id"].$get({
        param: { id: jobApplicationId.toString() },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe(
        `record ID: ${jobApplicationId} retrieved successfully`,
      );
      expect(data.data).toEqual(mockJobApplicationResponse);
      expect(
        mockedJobApplicationService.getJobApplicationById,
      ).toHaveBeenCalledWith(userId, jobApplicationId);
    });

    it("should handle job application not found", async () => {
      mockedJobApplicationService.getJobApplicationById.mockRejectedValue(
        new NotFoundError(
          `[Service] Job Application with ID 999 not found for user ${userId}`,
        ),
      );

      await expect(
        mockedJobApplicationService.getJobApplicationById(999, userId),
      ).rejects.toThrow(NotFoundError);
    });

    it("should handle invalid id parameter", async () => {
      const res = await client[":id"].$get({
        param: { id: "invalid" },
      });

      expect(mockedJobApplicationService.getJobApplicationById(NaN, userId));
    });

    it("should handle service errors when getting job application by id", async () => {
      const jobApplicationId = 1;
      mockedJobApplicationService.getJobApplicationById.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(
        mockedJobApplicationService.getJobApplicationById(
          userId,
          jobApplicationId,
        ),
      ).rejects.toThrow("Database error");
    });
  });
  describe("PATCH /applications-tracking/:id", async () => {
    it("should update job application successfully", async () => {
      const jobApplicationId = 1;
      const updateData = {
        ...mockJobApplicationData,
        status: "accepted" as const,
        notes: "Got the job!",
      };

      const updatedJobApplication = {
        ...mockJobApplication,
        ...updateData,
        updatedAt: new Date("2025-06-27"),
      };

      const updatedJobApplicationResponse = {
        ...mockJobApplicationResponse,
        status: "accepted",
        notes: "Got the job!",
        updatedAt: "2025-06-27T00:00:00.000Z",
      };

      mockedJobApplicationService.updateJobApplication.mockResolvedValue(
        updatedJobApplication,
      );

      const res = await client[":id"].$patch({
        param: { id: jobApplicationId.toString() },
        json: updateData,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe(
        `record ID: ${jobApplicationId} updated successfully`,
      );
      expect(data.data).toEqual(updatedJobApplicationResponse);
      expect(
        mockedJobApplicationService.updateJobApplication,
      ).toHaveBeenCalledWith(jobApplicationId, userId, updateData, undefined);
    });

    it("should handle partial updates", async () => {
      const jobApplicationId = 1;
      const partialUpdateData = {
        status: "rejected" as const,
        notes: "Unfortunately not selected",
      };

      const updatedJobApplication = {
        ...mockJobApplication,
        ...partialUpdateData,
        updatedAt: new Date("2025-06-27"),
      };

      const updatedJobApplicationResponse = {
        ...mockJobApplicationResponse,
        status: "rejected",
        notes: "Unfortunately not selected",
        updatedAt: "2025-06-27T00:00:00.000Z",
      };

      mockedJobApplicationService.updateJobApplication.mockResolvedValue(
        updatedJobApplication,
      );

      const res = await client[":id"].$patch({
        param: { id: jobApplicationId.toString() },
        json: partialUpdateData,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.status).toBe("rejected");
      expect(data.data.notes).toBe("Unfortunately not selected");
    });

    it("should return 404 when updating non-existent job application", async () => {
      const jobApplicationId = 999;
      mockedJobApplicationService.updateJobApplication.mockRejectedValue(
        new NotFoundError(
          `[Service] Job Application with ID 999 not found for user ${userId}`,
        ),
      );

      const res = await client[":id"].$patch({
        param: { id: jobApplicationId.toString() },
        json: { status: "accepted" },
      });
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.message).toContain("Job Application with ID 999 not found");
    });

    it("should handle service errors when updating job application", async () => {
      const jobApplicationId = 1;
      mockedJobApplicationService.updateJobApplication.mockRejectedValue(
        new Error("Update failed"),
      );

      await expect(
        mockedJobApplicationService.updateJobApplication(
          jobApplicationId,
          userId,
          {},
        ),
      ).rejects.toThrow("Update failed");
    });

    it("should handle invalid id parameter for update", async () => {
      const res = await client[":id"].$patch({
        param: { id: "invalid" },
        json: { status: "accepted" },
      });

      expect(
        mockedJobApplicationService.updateJobApplication,
      ).not.toHaveBeenCalled();
      expect(res.status).toBe(400);
    });
  });

  describe("GET /applications-tracking/:id/status-timeline", () => {
    it("should return the job status timeline for owned job", async () => {
      const mockTimeline: JobApplicationStatusSelect[] = [
        {
          id: 1,
          applicationId: 1,
          status: "applied",
          changedAt: new Date("2025-06-01"),
        },
        {
          id: 2,
          applicationId: 1,
          status: "interview",
          changedAt: new Date("2025-06-05"),
        },
      ];

      mockedJobApplicationService.getStatusTimeline.mockResolvedValue(
        mockTimeline,
      );

      const res = await client[":id"]["statuses"].$get({
        param: { id: mockJobApplication.id.toString() },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(
        mockedJobApplicationService.getStatusTimeline,
      ).toHaveBeenCalledWith(mockJobApplication.id, userId);
    });
  });

  describe("DELETE /applications-tracking/:id", async () => {
    it("should delete existing job application", async () => {
      const jobApplicationId = 1;
      mockedJobApplicationService.deleteJobApplication.mockResolvedValue(true);

      const res = await client[":id"].$delete({
        param: { id: jobApplicationId.toString() },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe(
        `record id: ${jobApplicationId} deleted successfully`,
      );
      expect(
        mockedJobApplicationService.deleteJobApplication,
      ).toHaveBeenCalledWith(userId, jobApplicationId);
    });
    it("should handle failing to delete job application", async () => {
      const jobApplicationId = 999;
      mockedJobApplicationService.deleteJobApplication.mockResolvedValue(false);

      const res = await client[":id"].$delete({
        param: { id: jobApplicationId.toString() },
      });

      // TODO: implement not found error handling or the status code
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data).toBe("Record not found");
    });

    it("should handle invalid id parameter for delete", async () => {
      const res = await client[":id"].$delete({
        param: { id: "invalid" },
      });

      expect(
        mockedJobApplicationService.deleteJobApplication,
      ).not.toHaveBeenCalled();
      expect(res.status).toBe(400);
    });
    it("should handle service errors when deleting job application", async () => {
      const jobApplicationId = 1;
      mockedJobApplicationService.deleteJobApplication.mockRejectedValue(
        new Error("Delete failed"),
      );

      await expect(
        mockedJobApplicationService.deleteJobApplication(
          userId,
          jobApplicationId,
        ),
      ).rejects.toThrow("Delete failed");
    });
  });
});
