import { describe, it, expect, beforeEach, vi } from "vitest";
import { JobApplicationService } from "../../src/services/jobApplication.service";
import { NotFoundError } from "../../src/errors/not-found.error";
import type { IJobApplication } from "../../src/repositories/jobApplication.repo";
import type { IJobApplicationStatus } from "../../src/repositories/jobApplicationStatus.repo";
import {
  createMockJobApplicationRepository,
  createMockJobApplicationStatusRepository,
  setupJobApplicationMocks,
  createMockJobApplicationData,
  createMockJobApplication,
  createMockJobApplicationUpdate,
  createMockQueryOptions,
  createMockPaginatedResponse,
  createJobApplicationsArray,
  createMinimalJobApplicationData,
  createFullJobApplicationData,
  createFutureDate,
  createPastDate,
  VALID_USER_ID,
  INVALID_USER_ID,
  VALID_JOB_ID,
  INVALID_JOB_ID,
  VALID_CV_ID,
} from "../utils/jobApplication.test-helpers";

describe("JobApplicationService", () => {
  let service: JobApplicationService;
  let mockJobRepo: ReturnType<typeof createMockJobApplicationRepository>;
  let mockStatusRepo: ReturnType<
    typeof createMockJobApplicationStatusRepository
  >;

  beforeEach(() => {
    mockJobRepo = createMockJobApplicationRepository();
    mockStatusRepo = createMockJobApplicationStatusRepository();
    service = new JobApplicationService(mockJobRepo, mockStatusRepo);
  });

  describe("createJobApplication", () => {
    it("should create job application with minimal required data", async () => {
      // Arrange
      const jobData = createMinimalJobApplicationData();
      const { mockJobApp } = setupJobApplicationMocks(
        mockJobRepo,
        mockStatusRepo,
      );

      // Act
      const result = await service.createJobApplication(jobData, VALID_USER_ID);

      // Assert
      expect(mockJobRepo.create).toHaveBeenCalledWith({
        ...jobData,
        userId: VALID_USER_ID,
      });
      expect(mockStatusRepo.addStatus).toHaveBeenCalledWith(
        mockJobApp.id,
        expect.objectContaining({
          applicationId: mockJobApp.id,
          status: "applied",
          changedAt: expect.any(Date),
        }),
      );
      expect(result).toEqual(mockJobApp);
    });

    it("should create job application with full data including custom status", async () => {
      // Arrange
      const jobData = createFullJobApplicationData();
      const { mockJobApp } = setupJobApplicationMocks(
        mockJobRepo,
        mockStatusRepo,
      );

      // Act
      const result = await service.createJobApplication(jobData, VALID_USER_ID);

      // Assert
      expect(mockJobRepo.create).toHaveBeenCalledWith({
        ...jobData,
        userId: VALID_USER_ID,
      });
      expect(mockStatusRepo.addStatus).toHaveBeenCalledWith(
        mockJobApp.id,
        expect.objectContaining({
          applicationId: mockJobApp.id,
          status: jobData.status,
          changedAt: jobData.appliedAt,
        }),
      );
      expect(result).toEqual(mockJobApp);
    });

    it("should create job application with default 'applied' status when not specified", async () => {
      // Arrange
      const jobData = createMockJobApplicationData({ status: undefined });
      const { mockJobApp } = setupJobApplicationMocks(
        mockJobRepo,
        mockStatusRepo,
      );

      // Act
      await service.createJobApplication(jobData, VALID_USER_ID);

      // Assert
      expect(mockStatusRepo.addStatus).toHaveBeenCalledWith(
        mockJobApp.id,
        expect.objectContaining({
          status: "applied",
        }),
      );
    });

    it("should use current date for appliedAt when not provided", async () => {
      // Arrange
      const jobData = createMockJobApplicationData({ appliedAt: undefined });
      const { mockJobApp } = setupJobApplicationMocks(
        mockJobRepo,
        mockStatusRepo,
      );
      const beforeCreate = new Date();

      // Act
      await service.createJobApplication(jobData, VALID_USER_ID);

      // Assert
      const afterCreate = new Date();
      expect(mockStatusRepo.addStatus).toHaveBeenCalledWith(
        mockJobApp.id,
        expect.objectContaining({
          changedAt: expect.any(Date),
        }),
      );

      const statusCall = mockStatusRepo.addStatus.mock.calls[0][1];
      expect(statusCall.changedAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime(),
      );
      expect(statusCall.changedAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime(),
      );
    });

    it("should handle repository errors during creation", async () => {
      // Arrange
      const jobData = createMockJobApplicationData();
      const error = new Error("Database connection failed");
      mockJobRepo.create.mockRejectedValue(error);

      // Act & Assert
      await expect(
        service.createJobApplication(jobData, VALID_USER_ID),
      ).rejects.toThrow("Database connection failed");
    });

    it("should handle status repository errors during initial status creation", async () => {
      // Arrange
      const jobData = createMockJobApplicationData();
      const mockJobApp = createMockJobApplication();
      mockJobRepo.create.mockResolvedValue(mockJobApp);
      mockStatusRepo.addStatus.mockRejectedValue(
        new Error("Status creation failed"),
      );

      // Act & Assert
      await expect(
        service.createJobApplication(jobData, VALID_USER_ID),
      ).rejects.toThrow("Status creation failed");
    });
  });

  describe("getJobApplicationById", () => {
    it("should return job application for valid ID and user", async () => {
      // Arrange
      const mockJobApp = createMockJobApplication();
      mockJobRepo.getByIdAndUser.mockResolvedValue(mockJobApp);

      // Act
      const result = await service.getJobApplicationById(
        VALID_JOB_ID,
        VALID_USER_ID,
      );

      // Assert
      expect(mockJobRepo.getByIdAndUser).toHaveBeenCalledWith(
        VALID_JOB_ID,
        VALID_USER_ID,
      );
      expect(result).toEqual(mockJobApp);
    });

    it("should throw NotFoundError when application does not exist", async () => {
      // Arrange
      mockJobRepo.getByIdAndUser.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.getJobApplicationById(INVALID_JOB_ID, VALID_USER_ID),
      ).rejects.toThrow(NotFoundError);
      await expect(
        service.getJobApplicationById(INVALID_JOB_ID, VALID_USER_ID),
      ).rejects.toThrow(
        `Job Application with ID ${INVALID_JOB_ID} not found or not accessible for user ${VALID_USER_ID}`,
      );
    });

    it("should throw NotFoundError when application belongs to different user", async () => {
      // Arrange
      mockJobRepo.getByIdAndUser.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.getJobApplicationById(VALID_JOB_ID, INVALID_USER_ID),
      ).rejects.toThrow(NotFoundError);
    });

    it("should handle repository errors", async () => {
      // Arrange
      const error = new Error("Database query failed");
      mockJobRepo.getByIdAndUser.mockRejectedValue(error);

      // Act & Assert
      await expect(
        service.getJobApplicationById(VALID_JOB_ID, VALID_USER_ID),
      ).rejects.toThrow("Database query failed");
    });
  });

  describe("getAllJobApplications", () => {
    it("should return paginated job applications without query options", async () => {
      // Arrange
      const jobApps = createJobApplicationsArray(3);
      const mockPaginated = createMockPaginatedResponse(jobApps);
      mockJobRepo.getAllByUser.mockResolvedValue(mockPaginated);

      // Act
      const result = await service.getAllJobApplications(VALID_USER_ID);

      // Assert
      expect(mockJobRepo.getAllByUser).toHaveBeenCalledWith(
        VALID_USER_ID,
        undefined,
      );
      expect(result).toEqual(mockPaginated);
      expect(result.data).toHaveLength(3);
    });

    it("should return paginated job applications with query options", async () => {
      // Arrange
      const queryOptions = createMockQueryOptions({
        search: "engineer",
        sortBy: "companyName",
        sortOrder: "asc",
        limit: 5,
        offset: 10,
      });
      const jobApps = createJobApplicationsArray(5);
      const mockPaginated = createMockPaginatedResponse(jobApps, {
        limit: 5,
        offset: 10,
        total: 15,
      });
      mockJobRepo.getAllByUser.mockResolvedValue(mockPaginated);

      // Act
      const result = await service.getAllJobApplications(
        VALID_USER_ID,
        queryOptions,
      );

      // Assert
      expect(mockJobRepo.getAllByUser).toHaveBeenCalledWith(
        VALID_USER_ID,
        queryOptions,
      );
      expect(result).toEqual(mockPaginated);
      expect(result.limit).toBe(5);
      expect(result.offset).toBe(10);
      expect(result.total).toBe(15);
    });

    it("should return empty results when user has no job applications", async () => {
      // Arrange
      const emptyResponse = createMockPaginatedResponse([], { total: 0 });
      mockJobRepo.getAllByUser.mockResolvedValue(emptyResponse);

      // Act
      const result = await service.getAllJobApplications(VALID_USER_ID);

      // Assert
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it("should handle repository errors", async () => {
      // Arrange
      const error = new Error("Database query failed");
      mockJobRepo.getAllByUser.mockRejectedValue(error);

      // Act & Assert
      await expect(
        service.getAllJobApplications(VALID_USER_ID),
      ).rejects.toThrow("Database query failed");
    });
  });

  describe("updateJobApplication", () => {
    it("should update job application without status change", async () => {
      // Arrange
      const currentApp = createMockJobApplication({ status: "applied" });
      const updateData = createMockJobApplicationUpdate({
        companyName: "Updated Company",
        notes: "Updated notes",
        status: undefined, // No status change
      });
      const updatedApp = { ...currentApp, ...updateData };

      mockJobRepo.getByIdAndUser.mockResolvedValue(currentApp);
      mockJobRepo.updateByIdAndUser.mockResolvedValue(updatedApp);
      mockJobRepo.getByIdAndUser
        .mockResolvedValueOnce(currentApp)
        .mockResolvedValueOnce(updatedApp);

      // Act
      const result = await service.updateJobApplication(
        VALID_JOB_ID,
        VALID_USER_ID,
        updateData,
      );

      // Assert
      expect(mockJobRepo.updateByIdAndUser).toHaveBeenCalledWith(
        VALID_JOB_ID,
        VALID_USER_ID,
        updateData,
      );
      expect(mockStatusRepo.addStatus).not.toHaveBeenCalled();
      expect(result).toEqual(updatedApp);
    });

    it("should update job application with status change", async () => {
      // Arrange
      const currentApp = createMockJobApplication({ status: "applied" });
      const updateData = createMockJobApplicationUpdate({
        status: "interview",
      });
      const updatedApp = { ...currentApp, ...updateData };
      const statusChangeAt = new Date("2025-01-20");

      mockJobRepo.getByIdAndUser.mockResolvedValue(currentApp);
      mockJobRepo.updateByIdAndUser.mockResolvedValue(updatedApp);
      mockJobRepo.getByIdAndUser
        .mockResolvedValueOnce(currentApp)
        .mockResolvedValueOnce(updatedApp);

      // Act
      const result = await service.updateJobApplication(
        VALID_JOB_ID,
        VALID_USER_ID,
        updateData,
        statusChangeAt,
      );

      // Assert
      expect(mockStatusRepo.addStatus).toHaveBeenCalledWith(
        VALID_JOB_ID,
        expect.objectContaining({
          applicationId: VALID_JOB_ID,
          status: "interview",
          changedAt: statusChangeAt,
        }),
      );
      expect(result).toEqual(updatedApp);
    });

    it("should use current date for status change when not provided", async () => {
      // Arrange
      const currentApp = createMockJobApplication({ status: "applied" });
      const updateData = createMockJobApplicationUpdate({
        status: "interview",
      });
      const updatedApp = { ...currentApp, ...updateData };

      mockJobRepo.getByIdAndUser.mockResolvedValue(currentApp);
      mockJobRepo.updateByIdAndUser.mockResolvedValue(updatedApp);
      mockJobRepo.getByIdAndUser
        .mockResolvedValueOnce(currentApp)
        .mockResolvedValueOnce(updatedApp);

      const beforeUpdate = new Date();

      // Act
      await service.updateJobApplication(
        VALID_JOB_ID,
        VALID_USER_ID,
        updateData,
      );

      // Assert
      const afterUpdate = new Date();
      expect(mockStatusRepo.addStatus).toHaveBeenCalledWith(
        VALID_JOB_ID,
        expect.objectContaining({
          changedAt: expect.any(Date),
        }),
      );

      const statusCall = mockStatusRepo.addStatus.mock.calls[0][1];
      expect(statusCall.changedAt.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
      expect(statusCall.changedAt.getTime()).toBeLessThanOrEqual(
        afterUpdate.getTime(),
      );
    });

    it("should not create status entry when status is same as current", async () => {
      // Arrange
      const currentApp = createMockJobApplication({ status: "applied" });
      const updateData = createMockJobApplicationUpdate({
        status: "applied", // Same status
        notes: "Just updating notes",
      });
      const updatedApp = { ...currentApp, ...updateData };

      mockJobRepo.getByIdAndUser.mockResolvedValue(currentApp);
      mockJobRepo.updateByIdAndUser.mockResolvedValue(updatedApp);
      mockJobRepo.getByIdAndUser
        .mockResolvedValueOnce(currentApp)
        .mockResolvedValueOnce(updatedApp);

      // Act
      await service.updateJobApplication(
        VALID_JOB_ID,
        VALID_USER_ID,
        updateData,
      );

      // Assert
      expect(mockStatusRepo.addStatus).not.toHaveBeenCalled();
    });

    it("should throw NotFoundError when application does not exist", async () => {
      // Arrange
      const updateData = createMockJobApplicationUpdate();
      mockJobRepo.getByIdAndUser.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateJobApplication(INVALID_JOB_ID, VALID_USER_ID, updateData),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when update fails", async () => {
      // Arrange
      const currentApp = createMockJobApplication();
      const updateData = createMockJobApplicationUpdate();

      mockJobRepo.getByIdAndUser.mockResolvedValue(currentApp);
      mockJobRepo.updateByIdAndUser.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateJobApplication(VALID_JOB_ID, VALID_USER_ID, updateData),
      ).rejects.toThrow(NotFoundError);
      await expect(
        service.updateJobApplication(VALID_JOB_ID, VALID_USER_ID, updateData),
      ).rejects.toThrow(
        `Failed to update Job Application with ID ${VALID_JOB_ID} for user ${VALID_USER_ID}`,
      );
    });

    it("should handle status repository errors during status change", async () => {
      // Arrange
      const currentApp = createMockJobApplication({ status: "applied" });
      const updateData = createMockJobApplicationUpdate({
        status: "interview",
      });

      mockJobRepo.getByIdAndUser.mockResolvedValue(currentApp);
      mockStatusRepo.addStatus.mockRejectedValue(
        new Error("Status update failed"),
      );

      // Act & Assert
      await expect(
        service.updateJobApplication(VALID_JOB_ID, VALID_USER_ID, updateData),
      ).rejects.toThrow("Status update failed");
    });
  });

  describe("getStatusTimeline", () => {
    it("should return status timeline for valid application", async () => {
      // Arrange
      const mockApp = createMockJobApplication();
      const mockStatuses = [
        {
          id: 1,
          applicationId: VALID_JOB_ID,
          status: "applied" as const,
          changedAt: createPastDate(5),
        },
        {
          id: 2,
          applicationId: VALID_JOB_ID,
          status: "interview" as const,
          changedAt: createPastDate(2),
        },
        {
          id: 3,
          applicationId: VALID_JOB_ID,
          status: "offer" as const,
          changedAt: new Date(),
        },
      ];

      mockJobRepo.getByIdAndUser.mockResolvedValue(mockApp);
      mockStatusRepo.getStatuses.mockResolvedValue(mockStatuses);

      // Act
      const result = await service.getStatusTimeline(
        VALID_JOB_ID,
        VALID_USER_ID,
      );

      // Assert
      expect(mockJobRepo.getByIdAndUser).toHaveBeenCalledWith(
        VALID_JOB_ID,
        VALID_USER_ID,
      );
      expect(mockStatusRepo.getStatuses).toHaveBeenCalledWith(VALID_JOB_ID);
      expect(result).toEqual(mockStatuses);
      expect(result).toHaveLength(3);
    });

    it("should throw NotFoundError when application does not exist", async () => {
      // Arrange
      mockJobRepo.getByIdAndUser.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.getStatusTimeline(INVALID_JOB_ID, VALID_USER_ID),
      ).rejects.toThrow(NotFoundError);
    });

    it("should return empty array when no status history exists", async () => {
      // Arrange
      const mockApp = createMockJobApplication();
      mockJobRepo.getByIdAndUser.mockResolvedValue(mockApp);
      mockStatusRepo.getStatuses.mockResolvedValue([]);

      // Act
      const result = await service.getStatusTimeline(
        VALID_JOB_ID,
        VALID_USER_ID,
      );

      // Assert
      expect(result).toEqual([]);
    });

    it("should handle status repository errors", async () => {
      // Arrange
      const mockApp = createMockJobApplication();
      mockJobRepo.getByIdAndUser.mockResolvedValue(mockApp);
      mockStatusRepo.getStatuses.mockRejectedValue(
        new Error("Status query failed"),
      );

      // Act & Assert
      await expect(
        service.getStatusTimeline(VALID_JOB_ID, VALID_USER_ID),
      ).rejects.toThrow("Status query failed");
    });
  });

  describe("deleteJobApplication", () => {
    it("should delete job application and associated statuses", async () => {
      // Arrange
      const mockApp = createMockJobApplication();
      mockJobRepo.getByIdAndUser.mockResolvedValue(mockApp);
      mockStatusRepo.deleteStatuses.mockResolvedValue(true);
      mockJobRepo.deleteByIdAndUser.mockResolvedValue(true);

      // Act
      const result = await service.deleteJobApplication(
        VALID_JOB_ID,
        VALID_USER_ID,
      );

      // Assert
      expect(mockJobRepo.getByIdAndUser).toHaveBeenCalledWith(
        VALID_JOB_ID,
        VALID_USER_ID,
      );
      expect(mockStatusRepo.deleteStatuses).toHaveBeenCalledWith(VALID_JOB_ID);
      expect(mockJobRepo.deleteByIdAndUser).toHaveBeenCalledWith(
        VALID_JOB_ID,
        VALID_USER_ID,
      );
      expect(result).toBe(true);
    });

    it("should throw NotFoundError when application does not exist", async () => {
      // Arrange
      mockJobRepo.getByIdAndUser.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.deleteJobApplication(INVALID_JOB_ID, VALID_USER_ID),
      ).rejects.toThrow(NotFoundError);

      // Should not attempt to delete statuses or application
      expect(mockStatusRepo.deleteStatuses).not.toHaveBeenCalled();
      expect(mockJobRepo.deleteByIdAndUser).not.toHaveBeenCalled();
    });

    it("should handle status deletion errors", async () => {
      // Arrange
      const mockApp = createMockJobApplication();
      mockJobRepo.getByIdAndUser.mockResolvedValue(mockApp);
      mockStatusRepo.deleteStatuses.mockRejectedValue(
        new Error("Status deletion failed"),
      );

      // Act & Assert
      await expect(
        service.deleteJobApplication(VALID_JOB_ID, VALID_USER_ID),
      ).rejects.toThrow("Status deletion failed");
    });

    it("should handle application deletion errors", async () => {
      // Arrange
      const mockApp = createMockJobApplication();
      mockJobRepo.getByIdAndUser.mockResolvedValue(mockApp);
      mockStatusRepo.deleteStatuses.mockResolvedValue(true);
      mockJobRepo.deleteByIdAndUser.mockRejectedValue(
        new Error("Application deletion failed"),
      );

      // Act & Assert
      await expect(
        service.deleteJobApplication(VALID_JOB_ID, VALID_USER_ID),
      ).rejects.toThrow("Application deletion failed");
    });

    it("should return false when application deletion returns false", async () => {
      // Arrange
      const mockApp = createMockJobApplication();
      mockJobRepo.getByIdAndUser.mockResolvedValue(mockApp);
      mockStatusRepo.deleteStatuses.mockResolvedValue(true);
      mockJobRepo.deleteByIdAndUser.mockResolvedValue(false);

      // Act
      const result = await service.deleteJobApplication(
        VALID_JOB_ID,
        VALID_USER_ID,
      );

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("Edge Cases and Boundary Conditions", () => {
    describe("Date Validation", () => {
      it("should handle future appliedAt dates gracefully", async () => {
        // Arrange
        const futureDate = createFutureDate(30);
        const jobData = createMockJobApplicationData({ appliedAt: futureDate });
        const { mockJobApp } = setupJobApplicationMocks(
          mockJobRepo,
          mockStatusRepo,
        );

        // Act
        await service.createJobApplication(jobData, VALID_USER_ID);

        // Assert
        expect(mockStatusRepo.addStatus).toHaveBeenCalledWith(
          mockJobApp.id,
          expect.objectContaining({
            changedAt: futureDate,
          }),
        );
      });

      it("should handle very old appliedAt dates", async () => {
        // Arrange
        const oldDate = new Date("2020-01-01");
        const jobData = createMockJobApplicationData({ appliedAt: oldDate });
        const { mockJobApp } = setupJobApplicationMocks(
          mockJobRepo,
          mockStatusRepo,
        );

        // Act
        await service.createJobApplication(jobData, VALID_USER_ID);

        // Assert
        expect(mockStatusRepo.addStatus).toHaveBeenCalledWith(
          mockJobApp.id,
          expect.objectContaining({
            changedAt: oldDate,
          }),
        );
      });
    });

    describe("Large Data Handling", () => {
      it("should handle applications with very long notes", async () => {
        // Arrange
        const longNotes = "A".repeat(10000); // 10k characters
        const jobData = createMockJobApplicationData({ notes: longNotes });
        const { mockJobApp } = setupJobApplicationMocks(
          mockJobRepo,
          mockStatusRepo,
        );

        // Act
        const result = await service.createJobApplication(
          jobData,
          VALID_USER_ID,
        );

        // Assert
        expect(mockJobRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ notes: longNotes }),
        );
        expect(result).toEqual(mockJobApp);
      });

      it("should handle pagination with large offsets", async () => {
        // Arrange
        const largeOffset = 1000000;
        const queryOptions = createMockQueryOptions({
          offset: largeOffset,
          limit: 50,
        });
        const mockPaginated = createMockPaginatedResponse([], {
          offset: largeOffset,
          total: 1000050,
        });
        mockJobRepo.getAllByUser.mockResolvedValue(mockPaginated);

        // Act
        const result = await service.getAllJobApplications(
          VALID_USER_ID,
          queryOptions,
        );

        // Assert
        expect(result.offset).toBe(largeOffset);
      });
    });

    describe("Concurrent Operations", () => {
      it("should handle multiple status changes in sequence", async () => {
        // Arrange
        const currentApp = createMockJobApplication({ status: "applied" });
        const updates = [
          { status: "interview" as const },
          { status: "offer" as const },
          { status: "accepted" as const },
        ];

        mockJobRepo.getByIdAndUser.mockResolvedValue(currentApp);
        mockJobRepo.updateByIdAndUser.mockResolvedValue({
          ...currentApp,
          status: "accepted",
        });

        // Act
        for (const update of updates) {
          await service.updateJobApplication(
            VALID_JOB_ID,
            VALID_USER_ID,
            update,
          );
        }

        // Assert
        expect(mockStatusRepo.addStatus).toHaveBeenCalledTimes(3);
        expect(mockStatusRepo.addStatus).toHaveBeenNthCalledWith(
          1,
          VALID_JOB_ID,
          expect.objectContaining({ status: "interview" }),
        );
        expect(mockStatusRepo.addStatus).toHaveBeenNthCalledWith(
          2,
          VALID_JOB_ID,
          expect.objectContaining({ status: "offer" }),
        );
        expect(mockStatusRepo.addStatus).toHaveBeenNthCalledWith(
          3,
          VALID_JOB_ID,
          expect.objectContaining({ status: "accepted" }),
        );
      });
    });

    describe("Type Safety and Validation", () => {
      it("should handle undefined/null values in optional fields", async () => {
        // Arrange
        const jobData = {
          companyName: "Test Company",
          jobTitle: "Test Role",
          notes: undefined,
          cvId: null,
          appliedAt: undefined,
        };
        const { mockJobApp } = setupJobApplicationMocks(
          mockJobRepo,
          mockStatusRepo,
        );

        // Act
        const result = await service.createJobApplication(
          jobData as any,
          VALID_USER_ID,
        );

        // Assert
        expect(mockJobRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            companyName: "Test Company",
            jobTitle: "Test Role",
            userId: VALID_USER_ID,
          }),
        );
        expect(result).toEqual(mockJobApp);
      });
    });
  });
});
