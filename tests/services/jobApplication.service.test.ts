import { describe, it, expect, vi, beforeEach, type Mocked } from "vitest";
import { JobApplicationService } from "../../src/services/jobApplication.service";
import { NotFoundError } from "../../src/errors/not-found.error";
import type {
  JobApplicationInsert,
  JobApplicationSelect,
  JobApplicationUpdate,
  JobApplicationQueryOptions,
  PaginatedJobApplicationResponse,
} from "../../src/db/types/jobApplication.type";
import type { IJobApplication } from "../../src/repositories/jobApplication.repo";

describe("JobApplicationService", () => {
  let jobApplicationService: JobApplicationService;
  let mockJobApplicationRepository: Mocked<IJobApplication>;

  const userId = 1;
  const jobApplicationId = 1;

  const mockJobApplicationData: Omit<JobApplicationInsert, "userId"> = {
    companyName: "Depermana Tech USA",
    jobTitle: "Software Engineer",
    jobType: "Full-time",
    position: "Mid-level",
    location: "San Francisco, CA",
    locationType: "On-site",
    status: "applied",
    jobPortal: "LinkedIn",
    jobUrl: "https://linkedin.com/jobs/1235",
    cvId: 1,
    notes: "Interesting opportunity",
    appliedAt: new Date("2025-01-15"),
  };
  const mockJobApplication: JobApplicationSelect = {
    id: jobApplicationId,
    userId,
    companyName: "Depermana Tech Asia",
    jobTitle: "Software Engineer",
    jobType: "Full-time",
    position: "Mid-level",
    location: "Jakarta, ID",
    locationType: "On-site",
    status: "applied",
    jobPortal: "LinkedIn",
    jobUrl: "https://linkedin.com/jobs/123",
    cvId: 1,
    notes: "Interesting opportunity",
    appliedAt: new Date("2025-06-15"),
    createdAt: new Date("2025-06-15"),
    updatedAt: new Date("2025-06-15"),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockJobApplicationRepository = {
      createJobApplication: vi.fn(),
      getJobApplicationByIdAndUserId: vi.fn(),
      getAllJobApplicationsByUserId: vi.fn(),
      updateJobApplicationByIdAndUserId: vi.fn(),
      deleteJobApplicationByIdAndUserId: vi.fn(),
    };

    jobApplicationService = new JobApplicationService(
      mockJobApplicationRepository,
    );
  });

  describe("createJobApplication", () => {
    it("should create a job application", async () => {
      mockJobApplicationRepository.createJobApplication.mockResolvedValue({
        id: jobApplicationId,
      });
      mockJobApplicationRepository.getJobApplicationByIdAndUserId.mockResolvedValue(
        mockJobApplication,
      );

      const result = await jobApplicationService.createJobApplication(
        mockJobApplicationData,
        userId,
      );

      expect(result).toEqual(mockJobApplication);
      expect(
        mockJobApplicationRepository.createJobApplication,
      ).toHaveBeenCalledWith({
        ...mockJobApplicationData,
        userId,
      });
      expect(
        mockJobApplicationRepository.getJobApplicationByIdAndUserId,
      ).toHaveBeenCalledWith(jobApplicationId, userId);
    });

    it("should create with minimal required data", async () => {
      const minimalData = {
        companyName: "Minimal Tech Corp",
        jobTitle: "Backend Developer",
      };
      const expectedJobApp: JobApplicationSelect = {
        ...mockJobApplication,
        ...minimalData,
        id: jobApplicationId,
        userId,
        createdAt: new Date("2025-06-15"),
        updatedAt: new Date("2025-06-15"),
      };

      mockJobApplicationRepository.createJobApplication.mockResolvedValue({
        id: jobApplicationId,
      });
      mockJobApplicationRepository.getJobApplicationByIdAndUserId.mockResolvedValue(
        expectedJobApp,
      );

      const result = await jobApplicationService.createJobApplication(
        minimalData,
        userId,
      );

      expect(result).toEqual(expectedJobApp);
      expect(
        mockJobApplicationRepository.createJobApplication,
      ).toHaveBeenCalledWith({
        ...minimalData,
        userId,
      });
    });

    it("should handle date fields correctly", async () => {
      const appliedDate = new Date("2024-06-21T10:30:00Z");
      const dataWithDates = {
        ...mockJobApplicationData,
        appliedAt: appliedDate,
      };
      const expectedJobApp = { ...mockJobApplication, appliedAt: appliedDate };

      mockJobApplicationRepository.createJobApplication.mockResolvedValue({
        id: jobApplicationId,
      });
      mockJobApplicationRepository.getJobApplicationByIdAndUserId.mockResolvedValue(
        expectedJobApp,
      );

      const result = await jobApplicationService.createJobApplication(
        dataWithDates,
        userId,
      );

      expect(result.appliedAt).toEqual(appliedDate);
    });

    it("should handle concurrent operations correctly", async () => {
      const promises = Array.from({ length: 5 }, (_, i) => {
        const data = { ...mockJobApplicationData, companyName: `Company ${i}` };
        const response = {
          ...mockJobApplication,
          id: i + 1,
          companyName: `Company ${i}`,
        };

        mockJobApplicationRepository.createJobApplication.mockResolvedValueOnce(
          { id: i + 1 },
        );
        mockJobApplicationRepository.getJobApplicationByIdAndUserId.mockResolvedValueOnce(
          response,
        );

        return jobApplicationService.createJobApplication(data, userId);
      });

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      expect(
        mockJobApplicationRepository.createJobApplication,
      ).toHaveBeenCalledTimes(5);
    });

    it("should throw error if retrieval after creation fails", async () => {
      mockJobApplicationRepository.createJobApplication.mockResolvedValue({
        id: jobApplicationId,
      });
      mockJobApplicationRepository.getJobApplicationByIdAndUserId.mockResolvedValue(
        null,
      );

      await expect(
        jobApplicationService.createJobApplication(
          mockJobApplicationData,
          userId,
        ),
      ).rejects.toThrow(
        new NotFoundError(
          `[Service] Job Application with ID ${jobApplicationId} not found for user ${userId}`,
        ),
      );
    });

    it("should handle repository errors gracefully", async () => {
      const repositoryError = new Error("Database connection failed");
      mockJobApplicationRepository.createJobApplication.mockRejectedValue(
        repositoryError,
      );

      await expect(
        jobApplicationService.createJobApplication(
          mockJobApplicationData,
          userId,
        ),
      ).rejects.toThrow("Database connection failed");
    });

    it("should handle job application with all optional fields", async () => {
      const fullData = {
        ...mockJobApplicationData,
        notes: "Very detailed notes about the position and company culture",
        appliedAt: new Date("2024-06-21"),
      };
      const expectedJobApp = { ...mockJobApplication, ...fullData };

      mockJobApplicationRepository.createJobApplication.mockResolvedValue({
        id: jobApplicationId,
      });
      mockJobApplicationRepository.getJobApplicationByIdAndUserId.mockResolvedValue(
        expectedJobApp,
      );

      const result = await jobApplicationService.createJobApplication(
        fullData,
        userId,
      );

      expect(result).toEqual(expectedJobApp);
    });
  });

  describe("getJobApplicationById", () => {
    it("should return job application by id", async () => {
      mockJobApplicationRepository.getJobApplicationByIdAndUserId.mockResolvedValue(
        mockJobApplication,
      );

      const result = await jobApplicationService.getJobApplicationById(
        jobApplicationId,
        userId,
      );

      expect(result).toEqual(mockJobApplication);
      expect(
        mockJobApplicationRepository.getJobApplicationByIdAndUserId,
      ).toHaveBeenCalledWith(jobApplicationId, userId);
    });

    it("should throw NotFoundError if not found", async () => {
      const nonExistentId = 999;
      mockJobApplicationRepository.getJobApplicationByIdAndUserId.mockResolvedValue(
        null,
      );

      await expect(
        jobApplicationService.getJobApplicationById(nonExistentId, userId),
      ).rejects.toThrow(
        new NotFoundError(
          `[Service] Job Application with ID ${nonExistentId} not found for user ${userId}`,
        ),
      );
    });

    it("should throw NotFoundError job application not owned", async () => {
      const otherUserId = 2;
      mockJobApplicationRepository.getJobApplicationByIdAndUserId.mockResolvedValue(
        null,
      );

      await expect(
        jobApplicationService.getJobApplicationById(
          jobApplicationId,
          otherUserId,
        ),
      ).rejects.toThrow(
        new NotFoundError(
          `[Service] Job Application with ID ${jobApplicationId} not found for user ${otherUserId}`,
        ),
      );
    });
  });

  describe("getAllJobApplications", () => {
    it("should return paginated job applications", async () => {
      const mockResponse: PaginatedJobApplicationResponse = {
        data: [mockJobApplication],
        total: 1,
        limit: 10,
        offset: 0,
      };
      mockJobApplicationRepository.getAllJobApplicationsByUserId.mockResolvedValue(
        mockResponse,
      );

      const result = await jobApplicationService.getAllJobApplications(userId);

      expect(result).toEqual(mockResponse);
      expect(
        mockJobApplicationRepository.getAllJobApplicationsByUserId,
      ).toHaveBeenCalledWith(userId, undefined);
    });

    it("should return job applications with query options", async () => {
      const queryOptions: JobApplicationQueryOptions = {
        search: "engineer",
        sortBy: "appliedAt",
        sortOrder: "desc",
        limit: 5,
        offset: 10,
      };
      const mockResponse: PaginatedJobApplicationResponse = {
        data: [mockJobApplication],
        total: 1,
        limit: 5,
        offset: 10,
      };
      mockJobApplicationRepository.getAllJobApplicationsByUserId.mockResolvedValue(
        mockResponse,
      );

      const result = await jobApplicationService.getAllJobApplications(
        userId,
        queryOptions,
      );

      expect(result).toEqual(mockResponse);
      expect(
        mockJobApplicationRepository.getAllJobApplicationsByUserId,
      ).toHaveBeenCalledWith(userId, queryOptions);
    });

    it("should return empty result if no job applications", async () => {
      const emptyResponse: PaginatedJobApplicationResponse = {
        data: [],
        total: 0,
        limit: 10,
        offset: 0,
      };
      mockJobApplicationRepository.getAllJobApplicationsByUserId.mockResolvedValue(
        emptyResponse,
      );

      const result = await jobApplicationService.getAllJobApplications(userId);

      expect(result).toEqual(emptyResponse);
      expect(result.data).toHaveLength(0);
    });

    it("should handle search with no matches", async () => {
      const queryOptions: JobApplicationQueryOptions = {
        search: "cappucinnoAssasinno",
      };
      const emptyResponse: PaginatedJobApplicationResponse = {
        data: [],
        total: 0,
        limit: 10,
        offset: 0,
      };
      mockJobApplicationRepository.getAllJobApplicationsByUserId.mockResolvedValue(
        emptyResponse,
      );

      const result = await jobApplicationService.getAllJobApplications(
        userId,
        queryOptions,
      );

      expect(result).toEqual(emptyResponse);
    });
  });

  describe("updateJobApplication", () => {
    const existingJobApplication: JobApplicationSelect = {
      id: jobApplicationId,
      userId,
      companyName: "Original Corp",
      jobTitle: "Original Title",
      jobType: null,
      position: null,
      location: null,
      locationType: null,
      status: "applied",
      jobPortal: null,
      jobUrl: null,
      cvId: null,
      notes: null,
      appliedAt: null,
      createdAt: new Date("2025-06-24"),
      updatedAt: new Date("2025-06-24"),
    };

    it("should update job application", async () => {
      const updateData: JobApplicationUpdate = {
        status: "interview",
        notes: "Got interview call!",
      };
      const updatedJobApplication: JobApplicationSelect = {
        ...existingJobApplication,
        ...updateData,
        updatedAt: new Date("2025-06-24"),
      };

      mockJobApplicationRepository.getJobApplicationByIdAndUserId
        .mockResolvedValueOnce(existingJobApplication) // First call in assertJobApplicationOwnedByUser
        .mockResolvedValueOnce(updatedJobApplication); // Second call after update
      mockJobApplicationRepository.updateJobApplicationByIdAndUserId.mockResolvedValue(
        true,
      );

      const result = await jobApplicationService.updateJobApplication(
        jobApplicationId,
        userId,
        updateData,
      );

      expect(result).toEqual(updatedJobApplication);
      expect(
        mockJobApplicationRepository.getJobApplicationByIdAndUserId,
      ).toHaveBeenCalledTimes(2);
      expect(
        mockJobApplicationRepository.updateJobApplicationByIdAndUserId,
      ).toHaveBeenCalledWith(jobApplicationId, userId, updateData);
    });

    it("should update only specific fields", async () => {
      const updateData: JobApplicationUpdate = {
        status: "offer",
      };
      const updatedJobApplication: JobApplicationSelect = {
        ...existingJobApplication,
        status: "offer",
        updatedAt: new Date("2024-01-16"),
      };

      mockJobApplicationRepository.getJobApplicationByIdAndUserId
        .mockResolvedValueOnce(existingJobApplication)
        .mockResolvedValueOnce(updatedJobApplication);
      mockJobApplicationRepository.updateJobApplicationByIdAndUserId.mockResolvedValue(
        true,
      );

      const result = await jobApplicationService.updateJobApplication(
        jobApplicationId,
        userId,
        updateData,
      );

      expect(result).toEqual(updatedJobApplication);
    });

    it("should throw NotFoundError if job application not found", async () => {
      const updateData: JobApplicationUpdate = { status: "interview" };
      mockJobApplicationRepository.getJobApplicationByIdAndUserId.mockResolvedValue(
        null,
      );

      await expect(
        jobApplicationService.updateJobApplication(
          jobApplicationId,
          userId,
          updateData,
        ),
      ).rejects.toThrow(
        new NotFoundError(
          `[Service] Job Application with ID ${jobApplicationId} not found for user ${userId}`,
        ),
      );
    });

    it("should throw NotFoundError if update fails", async () => {
      const updateData: JobApplicationUpdate = { status: "interview" };
      mockJobApplicationRepository.getJobApplicationByIdAndUserId.mockResolvedValue(
        existingJobApplication,
      );
      mockJobApplicationRepository.updateJobApplicationByIdAndUserId.mockResolvedValue(
        false,
      );

      await expect(
        jobApplicationService.updateJobApplication(
          jobApplicationId,
          userId,
          updateData,
        ),
      ).rejects.toThrow(
        new NotFoundError(
          `[Service] Job Application with ID ${jobApplicationId} not found for user ${userId}`,
        ),
      );
    });

    it("should handle repository errors gracefully", async () => {
      const repositoryError = new Error("Query timeout");
      mockJobApplicationRepository.getAllJobApplicationsByUserId.mockRejectedValue(
        repositoryError,
      );

      await expect(
        jobApplicationService.getAllJobApplications(userId),
      ).rejects.toThrow("Query timeout");
    });

    it("should handle empty update data", async () => {
      const updateData: JobApplicationUpdate = {};
      mockJobApplicationRepository.getJobApplicationByIdAndUserId
        .mockResolvedValueOnce(existingJobApplication)
        .mockResolvedValueOnce(existingJobApplication);
      mockJobApplicationRepository.updateJobApplicationByIdAndUserId.mockResolvedValue(
        true,
      );

      const result = await jobApplicationService.updateJobApplication(
        jobApplicationId,
        userId,
        updateData,
      );

      expect(result).toEqual(existingJobApplication);
    });

    it("should update application status correctly", async () => {
      const updateData: JobApplicationUpdate = {
        status: "rejected",
        notes: "Unfortunately not selected",
      };
      const updatedJobApplication: JobApplicationSelect = {
        ...existingJobApplication,
        ...updateData,
        updatedAt: new Date("2024-01-16"),
      };

      mockJobApplicationRepository.getJobApplicationByIdAndUserId
        .mockResolvedValueOnce(existingJobApplication)
        .mockResolvedValueOnce(updatedJobApplication);
      mockJobApplicationRepository.updateJobApplicationByIdAndUserId.mockResolvedValue(
        true,
      );

      const result = await jobApplicationService.updateJobApplication(
        jobApplicationId,
        userId,
        updateData,
      );

      expect(result).toEqual(updatedJobApplication);
      expect(result.status).toBe("rejected");
      expect(result.notes).toBe("Unfortunately not selected");
    });
  });

  describe("deleteJobApplication", () => {
    it("should delete job application", async () => {
      mockJobApplicationRepository.deleteJobApplicationByIdAndUserId.mockResolvedValue(
        true,
      );

      const result = await jobApplicationService.deleteJobApplication(
        jobApplicationId,
        userId,
      );

      expect(result).toBe(true);
      expect(
        mockJobApplicationRepository.deleteJobApplicationByIdAndUserId,
      ).toHaveBeenCalledWith(jobApplicationId, userId);
    });

    it("should return false if job application not owned or not found", async () => {
      mockJobApplicationRepository.deleteJobApplicationByIdAndUserId.mockResolvedValue(
        false,
      );

      const result = await jobApplicationService.deleteJobApplication(
        jobApplicationId,
        userId,
      );

      expect(result).toBe(false);
    });

    it("should handle deletion of not exist job application gracefully", async () => {
      const nonExistentId = 999;
      mockJobApplicationRepository.deleteJobApplicationByIdAndUserId.mockResolvedValue(
        false,
      );

      const result = await jobApplicationService.deleteJobApplication(
        nonExistentId,
        userId,
      );

      expect(result).toBe(false);
    });
  });

  describe("assertJobApplicationOwnedByUser", () => {
    it("should validate job application ownership through public methods", async () => {
      // Test the private method behavior through public method calls
      const otherUserId = 2;

      // Setup mock to simulate job application belonging to user 1
      mockJobApplicationRepository.getJobApplicationByIdAndUserId.mockImplementation(
        (id: number, user: number) => {
          if (user === userId) return Promise.resolve(mockJobApplication);
          return Promise.resolve(null);
        },
      );

      // User 1 can access their job application
      await expect(
        jobApplicationService.getJobApplicationById(jobApplicationId, userId),
      ).resolves.toBeDefined();

      // User 2 cannot access job application belonging to user 1
      await expect(
        jobApplicationService.getJobApplicationById(
          jobApplicationId,
          otherUserId,
        ),
      ).rejects.toThrow(
        new NotFoundError(
          `[Service] Job Application with ID ${jobApplicationId} not found for user ${otherUserId}`,
        ),
      );
    });
  });
});
