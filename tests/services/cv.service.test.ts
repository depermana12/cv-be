import { describe, it, expect, vi, beforeEach, type Mocked } from "vitest";
import { CvService } from "../../src/services/cv.service";
import { NotFoundError } from "../../src/errors/not-found.error";
import type { ICvRepository } from "../../src/repositories/cv.repo";
import type { ContactRepository } from "../../src/repositories/cvChildren/contact.repo";
import type { EducationRepository } from "../../src/repositories/cvChildren/education.repo";
import type { WorkRepository } from "../../src/repositories/cvChildren/work.repo";
import type { ProjectRepository } from "../../src/repositories/cvChildren/project.repo";
import type { OrganizationRepository } from "../../src/repositories/cvChildren/organization.repo";
import type { CourseRepository } from "../../src/repositories/cvChildren/course.repo";
import type { SkillRepository } from "../../src/repositories/cvChildren/skill.repo";
import type { LanguageRepository } from "../../src/repositories/cvChildren/language.repo";
import {
  createMockCvRepository,
  createMockContactRepository,
  createMockEducationRepository,
  createMockWorkRepository,
  createMockProjectRepository,
  createMockOrganizationRepository,
  createMockCourseRepository,
  createMockSkillRepository,
  createMockLanguageRepository,
  setupCvRepositoryMocks,
  setupChildRepositoryMocks,
  createMockCv,
  createMockPublicCv,
  createMockPrivateCv,
  createMockCvInsert,
  createMockCvUpdate,
  createMockCvQueryOptions,
  createMockPaginatedCvResponse,
  createMockCvMinimal,
  createMockCompleteCvResponse,
  createMockCvStats,
  createCvArray,
  VALID_USER_ID,
  INVALID_USER_ID,
  VALID_CV_ID,
  INVALID_CV_ID,
  VALID_USERNAME,
  INVALID_USERNAME,
  VALID_SLUG,
  INVALID_SLUG,
  AVAILABLE_SLUG,
  TAKEN_SLUG,
} from "../utils/cv.test-helpers";

describe("CvService", () => {
  let cvService: CvService;
  let mockCvRepository: Mocked<ICvRepository>;
  let mockContactRepository: Mocked<ContactRepository>;
  let mockEducationRepository: Mocked<EducationRepository>;
  let mockWorkRepository: Mocked<WorkRepository>;
  let mockProjectRepository: Mocked<ProjectRepository>;
  let mockOrganizationRepository: Mocked<OrganizationRepository>;
  let mockCourseRepository: Mocked<CourseRepository>;
  let mockSkillRepository: Mocked<SkillRepository>;
  let mockLanguageRepository: Mocked<LanguageRepository>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCvRepository = createMockCvRepository();
    mockContactRepository = createMockContactRepository();
    mockEducationRepository = createMockEducationRepository();
    mockWorkRepository = createMockWorkRepository();
    mockProjectRepository = createMockProjectRepository();
    mockOrganizationRepository = createMockOrganizationRepository();
    mockCourseRepository = createMockCourseRepository();
    mockSkillRepository = createMockSkillRepository();
    mockLanguageRepository = createMockLanguageRepository();

    cvService = new CvService(
      mockCvRepository,
      mockContactRepository,
      mockEducationRepository,
      mockWorkRepository,
      mockProjectRepository,
      mockOrganizationRepository,
      mockCourseRepository,
      mockSkillRepository,
      mockLanguageRepository,
    );
  });

  describe("createCv", () => {
    it("should create a CV successfully", async () => {
      const cvData = createMockCvInsert();
      const mockCv = createMockCv();
      mockCvRepository.createCv.mockResolvedValue(mockCv);
      mockCvRepository.getCvForUser.mockResolvedValue(mockCv);

      const result = await cvService.createCv(cvData, VALID_USER_ID);

      expect(result).toEqual(mockCv);
      expect(mockCvRepository.createCv).toHaveBeenCalledWith({
        ...cvData,
        userId: VALID_USER_ID,
      });
      expect(mockCvRepository.getCvForUser).toHaveBeenCalledWith(
        mockCv.id,
        VALID_USER_ID,
      );
    });

    it("should handle creation with minimal data", async () => {
      const cvData = createMockCvInsert({
        title: "Basic CV",
        description: "Simple description",
      });
      const mockCv = createMockCv(cvData);
      mockCvRepository.createCv.mockResolvedValue(mockCv);
      mockCvRepository.getCvForUser.mockResolvedValue(mockCv);

      const result = await cvService.createCv(cvData, VALID_USER_ID);

      expect(result).toEqual(mockCv);
      expect(mockCvRepository.createCv).toHaveBeenCalledWith({
        ...cvData,
        userId: VALID_USER_ID,
      });
    });

    it("should handle creation with all optional fields", async () => {
      const cvData = createMockCvInsert({
        title: "Complete CV",
        description: "Full description",
        isPublic: true,
        slug: "complete-cv",
        theme: "modern",
        language: "es",
      });
      const mockCv = createMockCv(cvData);
      mockCvRepository.createCv.mockResolvedValue(mockCv);
      mockCvRepository.getCvForUser.mockResolvedValue(mockCv);

      const result = await cvService.createCv(cvData, VALID_USER_ID);

      expect(result).toEqual(mockCv);
    });

    it("should throw error if CV retrieval after creation fails", async () => {
      const cvData = createMockCvInsert();
      const mockCv = createMockCv();
      mockCvRepository.createCv.mockResolvedValue(mockCv);
      mockCvRepository.getCvForUser.mockResolvedValue(null);

      await expect(cvService.createCv(cvData, VALID_USER_ID)).rejects.toThrow(
        new NotFoundError(
          `CV with ID ${mockCv.id} not found or not accessible for user ${VALID_USER_ID}`,
        ),
      );
    });

    it("should handle repository creation error", async () => {
      const cvData = createMockCvInsert();
      mockCvRepository.createCv.mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(cvService.createCv(cvData, VALID_USER_ID)).rejects.toThrow(
        "Database connection failed",
      );
    });

    it("should handle different user IDs", async () => {
      const cvData = createMockCvInsert();
      const mockCv = createMockCv({ userId: 2 });
      mockCvRepository.createCv.mockResolvedValue(mockCv);
      mockCvRepository.getCvForUser.mockResolvedValue(mockCv);

      const result = await cvService.createCv(cvData, 2);

      expect(mockCvRepository.createCv).toHaveBeenCalledWith({
        ...cvData,
        userId: 2,
      });
    });
  });

  describe("getCvById", () => {
    it("should return CV when found and belongs to user", async () => {
      const mockCv = createMockCv();
      mockCvRepository.getCvForUser.mockResolvedValue(mockCv);

      const result = await cvService.getCvById(VALID_CV_ID, VALID_USER_ID);

      expect(result).toEqual(mockCv);
      expect(mockCvRepository.getCvForUser).toHaveBeenCalledWith(
        VALID_CV_ID,
        VALID_USER_ID,
      );
    });

    it("should throw NotFoundError when CV does not exist", async () => {
      mockCvRepository.getCvForUser.mockResolvedValue(null);

      await expect(
        cvService.getCvById(INVALID_CV_ID, VALID_USER_ID),
      ).rejects.toThrow(
        new NotFoundError(
          `CV with ID ${INVALID_CV_ID} not found or not accessible for user ${VALID_USER_ID}`,
        ),
      );
    });

    it("should throw NotFoundError when CV belongs to different user", async () => {
      mockCvRepository.getCvForUser.mockResolvedValue(null);

      await expect(
        cvService.getCvById(VALID_CV_ID, INVALID_USER_ID),
      ).rejects.toThrow(
        new NotFoundError(
          `CV with ID ${VALID_CV_ID} not found or not accessible for user ${INVALID_USER_ID}`,
        ),
      );
    });

    it("should handle repository errors", async () => {
      mockCvRepository.getCvForUser.mockRejectedValue(
        new Error("Database query failed"),
      );

      await expect(
        cvService.getCvById(VALID_CV_ID, VALID_USER_ID),
      ).rejects.toThrow("Database query failed");
    });

    it("should work with different CV and user combinations", async () => {
      const mockCv = createMockCv({ id: 5, userId: 3 });
      mockCvRepository.getCvForUser.mockResolvedValue(mockCv);

      const result = await cvService.getCvById(5, 3);

      expect(result).toEqual(mockCv);
      expect(mockCvRepository.getCvForUser).toHaveBeenCalledWith(5, 3);
    });
  });

  describe("getAllCvs", () => {
    it("should return paginated CVs for user", async () => {
      const cvs = createCvArray(3);
      const mockPaginated = createMockPaginatedCvResponse(cvs);
      mockCvRepository.getAllCvForUser.mockResolvedValue(mockPaginated);

      const result = await cvService.getAllCvs(VALID_USER_ID);

      expect(result).toEqual(mockPaginated);
      expect(mockCvRepository.getAllCvForUser).toHaveBeenCalledWith(
        VALID_USER_ID,
        undefined,
      );
    });

    it("should return CVs with query options", async () => {
      const options = createMockCvQueryOptions();
      const cvs = createCvArray(5);
      const mockPaginated = createMockPaginatedCvResponse(cvs, {
        limit: 5,
        offset: 10,
        total: 15,
      });
      mockCvRepository.getAllCvForUser.mockResolvedValue(mockPaginated);

      const result = await cvService.getAllCvs(VALID_USER_ID, options);

      expect(result).toEqual(mockPaginated);
      expect(mockCvRepository.getAllCvForUser).toHaveBeenCalledWith(
        VALID_USER_ID,
        options,
      );
    });

    it("should return empty result when user has no CVs", async () => {
      const mockPaginated = createMockPaginatedCvResponse([], {
        total: 0,
        data: [],
      });
      mockCvRepository.getAllCvForUser.mockResolvedValue(mockPaginated);

      const result = await cvService.getAllCvs(VALID_USER_ID);

      expect(result).toEqual(mockPaginated);
      expect(result.data).toHaveLength(0);
    });

    it("should handle search queries", async () => {
      const options = createMockCvQueryOptions({ search: "engineer" });
      const cvs = [createMockCv({ title: "Software Engineer CV" })];
      const mockPaginated = createMockPaginatedCvResponse(cvs);
      mockCvRepository.getAllCvForUser.mockResolvedValue(mockPaginated);

      const result = await cvService.getAllCvs(VALID_USER_ID, options);

      expect(result.data).toHaveLength(1);
      expect(mockCvRepository.getAllCvForUser).toHaveBeenCalledWith(
        VALID_USER_ID,
        options,
      );
    });

    it("should handle pagination options", async () => {
      const options = createMockCvQueryOptions({
        limit: 5,
        offset: 10,
      });
      const cvs = createCvArray(5);
      const mockPaginated = createMockPaginatedCvResponse(cvs, {
        limit: 5,
        offset: 10,
      });
      mockCvRepository.getAllCvForUser.mockResolvedValue(mockPaginated);

      const result = await cvService.getAllCvs(VALID_USER_ID, options);

      expect(result.limit).toBe(5);
      expect(result.offset).toBe(10);
    });

    it("should handle sorting options", async () => {
      const options = createMockCvQueryOptions({
        sortBy: "title",
        sortOrder: "desc",
      });
      const cvs = createCvArray(3);
      const mockPaginated = createMockPaginatedCvResponse(cvs);
      mockCvRepository.getAllCvForUser.mockResolvedValue(mockPaginated);

      const result = await cvService.getAllCvs(VALID_USER_ID, options);

      expect(mockCvRepository.getAllCvForUser).toHaveBeenCalledWith(
        VALID_USER_ID,
        options,
      );
    });

    it("should handle public/private filtering", async () => {
      const options = createMockCvQueryOptions({ isPublic: true });
      const publicCvs = [createMockPublicCv()];
      const mockPaginated = createMockPaginatedCvResponse(publicCvs);
      mockCvRepository.getAllCvForUser.mockResolvedValue(mockPaginated);

      const result = await cvService.getAllCvs(VALID_USER_ID, options);

      expect(result.data.every((cv) => cv.isPublic)).toBe(true);
    });

    it("should handle large datasets", async () => {
      const options = createMockCvQueryOptions({ limit: 100 });
      const cvs = createCvArray(100);
      const mockPaginated = createMockPaginatedCvResponse(cvs, {
        limit: 100,
        total: 1000,
      });
      mockCvRepository.getAllCvForUser.mockResolvedValue(mockPaginated);

      const result = await cvService.getAllCvs(VALID_USER_ID, options);

      expect(result.data).toHaveLength(100);
      expect(result.total).toBe(1000);
    });

    it("should handle repository errors", async () => {
      mockCvRepository.getAllCvForUser.mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(cvService.getAllCvs(VALID_USER_ID)).rejects.toThrow(
        "Database connection failed",
      );
    });
  });

  describe("updateCv", () => {
    it("should update CV successfully", async () => {
      const existingCv = createMockCv();
      const updateData = createMockCvUpdate();
      const updatedCv = createMockCv({ ...updateData });

      mockCvRepository.getCvForUser
        .mockResolvedValueOnce(existingCv)
        .mockResolvedValueOnce(updatedCv);
      mockCvRepository.updateCvForUser.mockResolvedValue(updatedCv);

      const result = await cvService.updateCv(
        VALID_CV_ID,
        VALID_USER_ID,
        updateData,
      );

      expect(result).toEqual(updatedCv);
      expect(mockCvRepository.updateCvForUser).toHaveBeenCalledWith(
        VALID_CV_ID,
        VALID_USER_ID,
        updateData,
      );
    });

    it("should update only specific fields", async () => {
      const existingCv = createMockCv();
      const updateData = createMockCvUpdate({ title: "New Title Only" });
      const updatedCv = createMockCv({ title: "New Title Only" });

      mockCvRepository.getCvForUser
        .mockResolvedValueOnce(existingCv)
        .mockResolvedValueOnce(updatedCv);
      mockCvRepository.updateCvForUser.mockResolvedValue(updatedCv);

      const result = await cvService.updateCv(
        VALID_CV_ID,
        VALID_USER_ID,
        updateData,
      );

      expect(result.title).toBe("New Title Only");
    });

    it("should handle empty update data", async () => {
      const existingCv = createMockCv();
      const updateData = {};

      mockCvRepository.getCvForUser
        .mockResolvedValueOnce(existingCv)
        .mockResolvedValueOnce(existingCv);
      mockCvRepository.updateCvForUser.mockResolvedValue(existingCv);

      const result = await cvService.updateCv(
        VALID_CV_ID,
        VALID_USER_ID,
        updateData,
      );

      expect(result).toEqual(existingCv);
    });

    it("should throw NotFoundError when CV does not exist", async () => {
      const updateData = createMockCvUpdate();
      mockCvRepository.getCvForUser.mockResolvedValue(null);

      await expect(
        cvService.updateCv(VALID_CV_ID, VALID_USER_ID, updateData),
      ).rejects.toThrow(
        new NotFoundError(
          `CV with ID ${VALID_CV_ID} not found or not accessible for user ${VALID_USER_ID}`,
        ),
      );
    });

    it("should throw NotFoundError when CV belongs to different user", async () => {
      const updateData = createMockCvUpdate();
      mockCvRepository.getCvForUser.mockResolvedValue(null);

      await expect(
        cvService.updateCv(VALID_CV_ID, INVALID_USER_ID, updateData),
      ).rejects.toThrow(
        new NotFoundError(
          `CV with ID ${VALID_CV_ID} not found or not accessible for user ${INVALID_USER_ID}`,
        ),
      );
    });

    it("should throw NotFoundError when update fails", async () => {
      const existingCv = createMockCv();
      const updateData = createMockCvUpdate();

      mockCvRepository.getCvForUser.mockResolvedValueOnce(existingCv);
      mockCvRepository.updateCvForUser.mockResolvedValue(null as any);

      await expect(
        cvService.updateCv(VALID_CV_ID, VALID_USER_ID, updateData),
      ).rejects.toThrow(
        new NotFoundError(
          `Failed to update CV with ID ${VALID_CV_ID} for user ${VALID_USER_ID}`,
        ),
      );
    });

    it("should handle slug updates", async () => {
      const existingCv = createMockCv({ slug: null });
      const updateData = createMockCvUpdate({ slug: "new-slug" });
      const updatedCv = createMockCv({ slug: "new-slug" });

      mockCvRepository.getCvForUser
        .mockResolvedValueOnce(existingCv)
        .mockResolvedValueOnce(updatedCv);
      mockCvRepository.updateCvForUser.mockResolvedValue(updatedCv);

      const result = await cvService.updateCv(
        VALID_CV_ID,
        VALID_USER_ID,
        updateData,
      );

      expect(result.slug).toBe("new-slug");
    });

    it("should handle theme updates", async () => {
      const existingCv = createMockCv({ theme: "default" });
      const updateData = createMockCvUpdate({ theme: "modern" });
      const updatedCv = createMockCv({ theme: "modern" });

      mockCvRepository.getCvForUser
        .mockResolvedValueOnce(existingCv)
        .mockResolvedValueOnce(updatedCv);
      mockCvRepository.updateCvForUser.mockResolvedValue(updatedCv);

      const result = await cvService.updateCv(
        VALID_CV_ID,
        VALID_USER_ID,
        updateData,
      );

      expect(result.theme).toBe("modern");
    });

    it("should handle visibility changes", async () => {
      const existingCv = createMockPrivateCv();
      const updateData = createMockCvUpdate({ isPublic: true });
      const updatedCv = createMockPublicCv();

      mockCvRepository.getCvForUser
        .mockResolvedValueOnce(existingCv)
        .mockResolvedValueOnce(updatedCv);
      mockCvRepository.updateCvForUser.mockResolvedValue(updatedCv);

      const result = await cvService.updateCv(
        VALID_CV_ID,
        VALID_USER_ID,
        updateData,
      );

      expect(result.isPublic).toBe(true);
    });

    it("should handle repository errors during validation", async () => {
      const updateData = createMockCvUpdate();
      mockCvRepository.getCvForUser.mockRejectedValue(
        new Error("Database query failed"),
      );

      await expect(
        cvService.updateCv(VALID_CV_ID, VALID_USER_ID, updateData),
      ).rejects.toThrow("Database query failed");
    });

    it("should handle repository errors during update", async () => {
      const existingCv = createMockCv();
      const updateData = createMockCvUpdate();

      mockCvRepository.getCvForUser.mockResolvedValueOnce(existingCv);
      mockCvRepository.updateCvForUser.mockRejectedValue(
        new Error("Update failed"),
      );

      await expect(
        cvService.updateCv(VALID_CV_ID, VALID_USER_ID, updateData),
      ).rejects.toThrow("Update failed");
    });
  });

  describe("deleteCv", () => {
    it("should delete CV successfully", async () => {
      const mockCv = createMockCv();
      mockCvRepository.getCvForUser.mockResolvedValue(mockCv);
      mockCvRepository.deleteCvForUser.mockResolvedValue(true);

      const result = await cvService.deleteCv(VALID_CV_ID, VALID_USER_ID);

      expect(result).toBe(true);
      expect(mockCvRepository.deleteCvForUser).toHaveBeenCalledWith(
        VALID_CV_ID,
        VALID_USER_ID,
      );
    });

    it("should throw NotFoundError when CV does not exist", async () => {
      mockCvRepository.getCvForUser.mockResolvedValue(null);

      await expect(
        cvService.deleteCv(INVALID_CV_ID, VALID_USER_ID),
      ).rejects.toThrow(
        new NotFoundError(
          `CV with ID ${INVALID_CV_ID} not found or not accessible for user ${VALID_USER_ID}`,
        ),
      );
    });

    it("should throw NotFoundError when CV belongs to different user", async () => {
      mockCvRepository.getCvForUser.mockResolvedValue(null);

      await expect(
        cvService.deleteCv(VALID_CV_ID, INVALID_USER_ID),
      ).rejects.toThrow(
        new NotFoundError(
          `CV with ID ${VALID_CV_ID} not found or not accessible for user ${INVALID_USER_ID}`,
        ),
      );
    });

    it("should handle deletion failure", async () => {
      const mockCv = createMockCv();
      mockCvRepository.getCvForUser.mockResolvedValue(mockCv);
      mockCvRepository.deleteCvForUser.mockResolvedValue(false);

      const result = await cvService.deleteCv(VALID_CV_ID, VALID_USER_ID);

      expect(result).toBe(false);
    });

    it("should handle repository errors during validation", async () => {
      mockCvRepository.getCvForUser.mockRejectedValue(
        new Error("Database query failed"),
      );

      await expect(
        cvService.deleteCv(VALID_CV_ID, VALID_USER_ID),
      ).rejects.toThrow("Database query failed");
    });

    it("should handle repository errors during deletion", async () => {
      const mockCv = createMockCv();
      mockCvRepository.getCvForUser.mockResolvedValue(mockCv);
      mockCvRepository.deleteCvForUser.mockRejectedValue(
        new Error("Deletion failed"),
      );

      await expect(
        cvService.deleteCv(VALID_CV_ID, VALID_USER_ID),
      ).rejects.toThrow("Deletion failed");
    });

    it("should delete public CVs", async () => {
      const mockCv = createMockPublicCv();
      mockCvRepository.getCvForUser.mockResolvedValue(mockCv);
      mockCvRepository.deleteCvForUser.mockResolvedValue(true);

      const result = await cvService.deleteCv(VALID_CV_ID, VALID_USER_ID);

      expect(result).toBe(true);
    });

    it("should delete private CVs", async () => {
      const mockCv = createMockPrivateCv();
      mockCvRepository.getCvForUser.mockResolvedValue(mockCv);
      mockCvRepository.deleteCvForUser.mockResolvedValue(true);

      const result = await cvService.deleteCv(VALID_CV_ID, VALID_USER_ID);

      expect(result).toBe(true);
    });
  });

  describe("getCvByUsernameAndSlug", () => {
    beforeEach(() => {
      setupChildRepositoryMocks(
        mockContactRepository,
        mockEducationRepository,
        mockWorkRepository,
        mockProjectRepository,
        mockOrganizationRepository,
        mockCourseRepository,
        mockSkillRepository,
        mockLanguageRepository,
      );
    });

    it("should return complete CV data for public CV", async () => {
      const mockCvMinimal = createMockCvMinimal();
      const mockComplete = createMockCompleteCvResponse();
      mockCvRepository.getCvByUsernameAndSlug.mockResolvedValue(mockCvMinimal);
      mockCvRepository.incrementViews.mockResolvedValue();

      const result = await cvService.getCvByUsernameAndSlug(
        VALID_USERNAME,
        VALID_SLUG,
      );

      expect(result).toEqual(mockComplete);
      expect(mockCvRepository.getCvByUsernameAndSlug).toHaveBeenCalledWith(
        VALID_USERNAME,
        VALID_SLUG,
      );
      expect(mockCvRepository.incrementViews).toHaveBeenCalledWith(
        mockCvMinimal.id,
      );
    });

    it("should throw NotFoundError when CV does not exist", async () => {
      mockCvRepository.getCvByUsernameAndSlug.mockResolvedValue(null);

      await expect(
        cvService.getCvByUsernameAndSlug(INVALID_USERNAME, INVALID_SLUG),
      ).rejects.toThrow(
        new NotFoundError(
          `CV with slug '${INVALID_SLUG}' not found for user '${INVALID_USERNAME}'`,
        ),
      );
    });

    it("should throw NotFoundError when CV is not public", async () => {
      const privateCv = createMockCvMinimal({ isPublic: false });
      mockCvRepository.getCvByUsernameAndSlug.mockResolvedValue(privateCv);

      await expect(
        cvService.getCvByUsernameAndSlug(VALID_USERNAME, VALID_SLUG),
      ).rejects.toThrow(
        new NotFoundError(
          `CV with slug '${VALID_SLUG}' for user '${VALID_USERNAME}' is not publicly available`,
        ),
      );
    });

    it("should increment view count correctly", async () => {
      const mockCvMinimal = createMockCvMinimal({ views: 100 });
      const mockComplete = createMockCompleteCvResponse({ views: 101 });
      mockCvRepository.getCvByUsernameAndSlug.mockResolvedValue(mockCvMinimal);
      mockCvRepository.incrementViews.mockResolvedValue();

      const result = await cvService.getCvByUsernameAndSlug(
        VALID_USERNAME,
        VALID_SLUG,
      );

      expect(result.views).toBe(101);
    });

    it("should fetch all CV sections", async () => {
      const mockCvMinimal = createMockCvMinimal();
      mockCvRepository.getCvByUsernameAndSlug.mockResolvedValue(mockCvMinimal);
      mockCvRepository.incrementViews.mockResolvedValue();

      await cvService.getCvByUsernameAndSlug(VALID_USERNAME, VALID_SLUG);

      expect(mockContactRepository.getAll).toHaveBeenCalledWith(
        mockCvMinimal.id,
      );
      expect(mockEducationRepository.getAll).toHaveBeenCalledWith(
        mockCvMinimal.id,
      );
      expect(mockWorkRepository.getAll).toHaveBeenCalledWith(mockCvMinimal.id);
      expect(mockProjectRepository.getAll).toHaveBeenCalledWith(
        mockCvMinimal.id,
      );
      expect(mockOrganizationRepository.getAll).toHaveBeenCalledWith(
        mockCvMinimal.id,
      );
      expect(mockCourseRepository.getAll).toHaveBeenCalledWith(
        mockCvMinimal.id,
      );
      expect(mockSkillRepository.getAll).toHaveBeenCalledWith(mockCvMinimal.id);
      expect(mockLanguageRepository.getAll).toHaveBeenCalledWith(
        mockCvMinimal.id,
      );
    });

    it("should handle repository errors", async () => {
      mockCvRepository.getCvByUsernameAndSlug.mockRejectedValue(
        new Error("Database query failed"),
      );

      await expect(
        cvService.getCvByUsernameAndSlug(VALID_USERNAME, VALID_SLUG),
      ).rejects.toThrow("Database query failed");
    });

    it("should handle view increment errors gracefully", async () => {
      const mockCvMinimal = createMockCvMinimal();
      mockCvRepository.getCvByUsernameAndSlug.mockResolvedValue(mockCvMinimal);
      mockCvRepository.incrementViews.mockRejectedValue(
        new Error("View increment failed"),
      );

      await expect(
        cvService.getCvByUsernameAndSlug(VALID_USERNAME, VALID_SLUG),
      ).rejects.toThrow("View increment failed");
    });

    it("should handle child repository errors", async () => {
      const mockCvMinimal = createMockCvMinimal();
      mockCvRepository.getCvByUsernameAndSlug.mockResolvedValue(mockCvMinimal);
      mockCvRepository.incrementViews.mockResolvedValue();
      mockContactRepository.getAll.mockRejectedValue(
        new Error("Contact fetch failed"),
      );

      await expect(
        cvService.getCvByUsernameAndSlug(VALID_USERNAME, VALID_SLUG),
      ).rejects.toThrow("Contact fetch failed");
    });
  });

  describe("downloadCv", () => {
    it("should download public CV successfully", async () => {
      const mockCv = createMockPublicCv({ downloads: 50 });
      const expectedResult = { ...mockCv, downloads: 51 };
      mockCvRepository.getCvById.mockResolvedValue(mockCv);
      mockCvRepository.incrementDownloads.mockResolvedValue();

      const result = await cvService.downloadCv(VALID_CV_ID);

      expect(result).toEqual(expectedResult);
      expect(mockCvRepository.getCvById).toHaveBeenCalledWith(VALID_CV_ID);
      expect(mockCvRepository.incrementDownloads).toHaveBeenCalledWith(
        VALID_CV_ID,
      );
    });

    it("should throw NotFoundError when CV does not exist", async () => {
      mockCvRepository.getCvById.mockResolvedValue(null);

      await expect(cvService.downloadCv(INVALID_CV_ID)).rejects.toThrow(
        new NotFoundError(`CV with ID ${INVALID_CV_ID} not found`),
      );
    });

    it("should throw NotFoundError when CV is not public", async () => {
      const privateCv = createMockPrivateCv();
      mockCvRepository.getCvById.mockResolvedValue(privateCv);

      await expect(cvService.downloadCv(VALID_CV_ID)).rejects.toThrow(
        new NotFoundError(
          `CV with ID ${VALID_CV_ID} is not publicly available`,
        ),
      );
    });

    it("should handle repository errors", async () => {
      mockCvRepository.getCvById.mockRejectedValue(
        new Error("Database query failed"),
      );

      await expect(cvService.downloadCv(VALID_CV_ID)).rejects.toThrow(
        "Database query failed",
      );
    });

    it("should handle download increment errors", async () => {
      const mockCv = createMockPublicCv();
      mockCvRepository.getCvById.mockResolvedValue(mockCv);
      mockCvRepository.incrementDownloads.mockRejectedValue(
        new Error("Download increment failed"),
      );

      await expect(cvService.downloadCv(VALID_CV_ID)).rejects.toThrow(
        "Download increment failed",
      );
    });

    it("should handle zero downloads correctly", async () => {
      const mockCv = createMockPublicCv({ downloads: 0 });
      const expectedResult = { ...mockCv, downloads: 1 };
      mockCvRepository.getCvById.mockResolvedValue(mockCv);
      mockCvRepository.incrementDownloads.mockResolvedValue();

      const result = await cvService.downloadCv(VALID_CV_ID);

      expect(result.downloads).toBe(1);
    });

    it("should handle large download counts", async () => {
      const mockCv = createMockPublicCv({ downloads: 999999 });
      const expectedResult = { ...mockCv, downloads: 1000000 };
      mockCvRepository.getCvById.mockResolvedValue(mockCv);
      mockCvRepository.incrementDownloads.mockResolvedValue();

      const result = await cvService.downloadCv(VALID_CV_ID);

      expect(result.downloads).toBe(1000000);
    });
  });

  describe("getPopularCvs", () => {
    it("should return popular CVs with default limit", async () => {
      const popularCvs = createCvArray(10);
      mockCvRepository.getPopularCvs.mockResolvedValue(popularCvs);

      const result = await cvService.getPopularCvs();

      expect(result).toEqual(popularCvs);
      expect(mockCvRepository.getPopularCvs).toHaveBeenCalledWith(10);
    });

    it("should return popular CVs with custom limit", async () => {
      const popularCvs = createCvArray(5);
      mockCvRepository.getPopularCvs.mockResolvedValue(popularCvs);

      const result = await cvService.getPopularCvs(5);

      expect(result).toEqual(popularCvs);
      expect(mockCvRepository.getPopularCvs).toHaveBeenCalledWith(5);
    });

    it("should return empty array when no popular CVs", async () => {
      mockCvRepository.getPopularCvs.mockResolvedValue([]);

      const result = await cvService.getPopularCvs();

      expect(result).toEqual([]);
    });

    it("should handle repository errors", async () => {
      mockCvRepository.getPopularCvs.mockRejectedValue(
        new Error("Database query failed"),
      );

      await expect(cvService.getPopularCvs()).rejects.toThrow(
        "Database query failed",
      );
    });

    it("should handle zero limit", async () => {
      mockCvRepository.getPopularCvs.mockResolvedValue([]);

      const result = await cvService.getPopularCvs(0);

      expect(result).toEqual([]);
      expect(mockCvRepository.getPopularCvs).toHaveBeenCalledWith(0);
    });

    it("should handle large limits", async () => {
      const largeCvArray = createCvArray(100);
      mockCvRepository.getPopularCvs.mockResolvedValue(largeCvArray);

      const result = await cvService.getPopularCvs(100);

      expect(result).toHaveLength(100);
      expect(mockCvRepository.getPopularCvs).toHaveBeenCalledWith(100);
    });

    it("should return only public CVs", async () => {
      const publicCvs = [createMockPublicCv(), createMockPublicCv({ id: 2 })];
      mockCvRepository.getPopularCvs.mockResolvedValue(publicCvs);

      const result = await cvService.getPopularCvs();

      expect(result.every((cv) => cv.isPublic)).toBe(true);
    });
  });

  describe("getUserStats", () => {
    it("should return user CV statistics", async () => {
      const mockStats = createMockCvStats();
      mockCvRepository.getUserCvStats.mockResolvedValue(mockStats);

      const result = await cvService.getUserStats(VALID_USER_ID);

      expect(result).toEqual(mockStats);
      expect(mockCvRepository.getUserCvStats).toHaveBeenCalledWith(
        VALID_USER_ID,
      );
    });

    it("should handle user with no CVs", async () => {
      const emptyStats = createMockCvStats({
        totalViews: 0,
        totalDownloads: 0,
        totalCvs: 0,
      });
      mockCvRepository.getUserCvStats.mockResolvedValue(emptyStats);

      const result = await cvService.getUserStats(VALID_USER_ID);

      expect(result).toEqual(emptyStats);
    });

    it("should handle repository errors", async () => {
      mockCvRepository.getUserCvStats.mockRejectedValue(
        new Error("Database query failed"),
      );

      await expect(cvService.getUserStats(VALID_USER_ID)).rejects.toThrow(
        "Database query failed",
      );
    });

    it("should handle large statistics values", async () => {
      const largeStats = createMockCvStats({
        totalViews: 1000000,
        totalDownloads: 500000,
        totalCvs: 100,
      });
      mockCvRepository.getUserCvStats.mockResolvedValue(largeStats);

      const result = await cvService.getUserStats(VALID_USER_ID);

      expect(result.totalViews).toBe(1000000);
      expect(result.totalDownloads).toBe(500000);
      expect(result.totalCvs).toBe(100);
    });

    it("should handle different users", async () => {
      const userStats = createMockCvStats();
      mockCvRepository.getUserCvStats.mockResolvedValue(userStats);

      const result = await cvService.getUserStats(2);

      expect(mockCvRepository.getUserCvStats).toHaveBeenCalledWith(2);
    });
  });

  describe("checkSlugAvailability", () => {
    it("should return availability status for available slug", async () => {
      mockCvRepository.checkSlugAvailability.mockResolvedValue(true);

      const result = await cvService.checkSlugAvailability(AVAILABLE_SLUG);

      expect(result).toEqual({
        available: true,
        slug: AVAILABLE_SLUG,
      });
      expect(mockCvRepository.checkSlugAvailability).toHaveBeenCalledWith(
        AVAILABLE_SLUG,
        undefined,
      );
    });

    it("should return availability status for taken slug", async () => {
      mockCvRepository.checkSlugAvailability.mockResolvedValue(false);

      const result = await cvService.checkSlugAvailability(TAKEN_SLUG);

      expect(result).toEqual({
        available: false,
        slug: TAKEN_SLUG,
      });
    });

    it("should check availability excluding specific CV", async () => {
      mockCvRepository.checkSlugAvailability.mockResolvedValue(true);

      const result = await cvService.checkSlugAvailability(
        TAKEN_SLUG,
        VALID_CV_ID,
      );

      expect(result).toEqual({
        available: true,
        slug: TAKEN_SLUG,
      });
      expect(mockCvRepository.checkSlugAvailability).toHaveBeenCalledWith(
        TAKEN_SLUG,
        VALID_CV_ID,
      );
    });

    it("should handle repository errors", async () => {
      mockCvRepository.checkSlugAvailability.mockRejectedValue(
        new Error("Database query failed"),
      );

      await expect(
        cvService.checkSlugAvailability(AVAILABLE_SLUG),
      ).rejects.toThrow("Database query failed");
    });

    it("should handle empty slug", async () => {
      mockCvRepository.checkSlugAvailability.mockResolvedValue(true);

      const result = await cvService.checkSlugAvailability("");

      expect(result.slug).toBe("");
    });

    it("should handle special characters in slug", async () => {
      const specialSlug = "cv-with-123-special_chars";
      mockCvRepository.checkSlugAvailability.mockResolvedValue(true);

      const result = await cvService.checkSlugAvailability(specialSlug);

      expect(result.slug).toBe(specialSlug);
    });

    it("should handle long slugs", async () => {
      const longSlug = "a".repeat(100);
      mockCvRepository.checkSlugAvailability.mockResolvedValue(false);

      const result = await cvService.checkSlugAvailability(longSlug);

      expect(result.slug).toBe(longSlug);
      expect(result.available).toBe(false);
    });

    it("should handle zero CV ID exclusion", async () => {
      mockCvRepository.checkSlugAvailability.mockResolvedValue(true);

      const result = await cvService.checkSlugAvailability(AVAILABLE_SLUG, 0);

      expect(mockCvRepository.checkSlugAvailability).toHaveBeenCalledWith(
        AVAILABLE_SLUG,
        0,
      );
    });

    it("should handle negative CV ID exclusion", async () => {
      mockCvRepository.checkSlugAvailability.mockResolvedValue(true);

      const result = await cvService.checkSlugAvailability(AVAILABLE_SLUG, -1);

      expect(mockCvRepository.checkSlugAvailability).toHaveBeenCalledWith(
        AVAILABLE_SLUG,
        -1,
      );
    });
  });
});
