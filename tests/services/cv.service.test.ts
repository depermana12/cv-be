import { describe, it, expect, vi, beforeEach, type Mocked } from "vitest";
import { CvService } from "../../src/services/cv.service";
import { NotFoundError } from "../../src/errors/not-found.error";
import type {
  CvSelect,
  CvInsert,
  CvUpdate,
  CvQueryOptions,
  PaginatedCvResponse,
} from "../../src/db/types/cv.type";
import type { ICvRepository } from "../../src/repositories/cv.repo";

describe("CvService", () => {
  let cvService: CvService;
  let mockCvRepository: Mocked<ICvRepository>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCvRepository = {
      createCv: vi.fn(),
      getCvByIdAndUserId: vi.fn(),
      getAllCvByUserId: vi.fn(),
      getUserCvCount: vi.fn(),
      updateCvByIdAndUserId: vi.fn(),
      deleteCvByIdAndUserId: vi.fn(),
    };

    cvService = new CvService(mockCvRepository);
  });
  const cvId = 1;
  const userId = 1;
  const mockCv: CvSelect = {
    id: cvId,
    userId: userId,
    title: "Software Engineer",
    description: "comprehensive cv for software engineering position",
    isPublic: false,
    language: "ID",
    theme: "default",
    slug: null,
    views: null,
    downloads: null,
    createdAt: new Date("2025-06-24"),
    updatedAt: new Date("2025-06-24"),
  };

  const mockCreateCvData = {
    title: mockCv.title,
    description: mockCv.description,
  };

  describe("createCv", () => {
    it("should successfully create a CV", async () => {
      mockCvRepository.createCv.mockResolvedValue({ id: 1 });
      mockCvRepository.getCvByIdAndUserId.mockResolvedValue(mockCv);

      const result = await cvService.createCv(mockCreateCvData, userId);

      expect(result).toEqual(mockCv);
      expect(mockCvRepository.createCv).toHaveBeenCalledWith({
        ...mockCreateCvData,
        userId,
      });
      expect(mockCvRepository.getCvByIdAndUserId).toHaveBeenCalledWith(
        1,
        userId,
      );
    });

    it("should throw error if CV retrieval after creation fails", async () => {
      mockCvRepository.createCv.mockResolvedValue({ id: 1 });
      mockCvRepository.getCvByIdAndUserId.mockResolvedValue(null);
      await expect(
        cvService.createCv(mockCreateCvData, userId),
      ).rejects.toThrow(
        new NotFoundError("[Service] CV with ID 1 not found for user 1"),
      );
    });
  });

  describe("getCvById", () => {
    it("should return CV when found and belongs to user", async () => {
      mockCvRepository.getCvByIdAndUserId.mockResolvedValue(mockCv);

      const result = await cvService.getCvById(cvId, userId);

      expect(result).toEqual(mockCv);
      expect(mockCvRepository.getCvByIdAndUserId).toHaveBeenCalledWith(
        cvId,
        userId,
      );
    });

    it("should throw NotFoundError when CV does not exist", async () => {
      mockCvRepository.getCvByIdAndUserId.mockResolvedValue(null);
      await expect(cvService.getCvById(999, userId)).rejects.toThrow(
        new NotFoundError("[Service] CV with ID 999 not found for user 1"),
      );
    });

    it("should throw NotFoundError when CV belongs to different user", async () => {
      mockCvRepository.getCvByIdAndUserId.mockResolvedValue(null);
      await expect(cvService.getCvById(cvId, 2)).rejects.toThrow(
        new NotFoundError("[Service] CV with ID 1 not found for user 2"),
      );
    });
  });

  describe("getAllCvs", () => {
    const userId = 1;

    it("should return paginated CVs for user", async () => {
      const mockCvs: CvSelect[] = [
        {
          id: 1,
          title: "CV 1",
          description: "First CV",
          isPublic: true,
          userId,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
          theme: "default",
          slug: null,
          views: null,
          downloads: null,
          language: "id",
        },
        {
          id: 2,
          title: "CV 2",
          description: "Second CV",
          isPublic: false,
          userId,
          createdAt: new Date("2024-01-02"),
          updatedAt: new Date("2024-01-02"),
          theme: "default",
          slug: null,
          views: null,
          downloads: null,
          language: "id",
        },
      ];

      const mockResponse: PaginatedCvResponse = {
        data: mockCvs,
        total: 2,
        limit: 10,
        offset: 0,
      };

      mockCvRepository.getAllCvByUserId.mockResolvedValue(mockResponse);

      const result = await cvService.getAllCvs(userId);

      expect(result).toEqual(mockResponse);
      expect(mockCvRepository.getAllCvByUserId).toHaveBeenCalledWith(
        userId,
        undefined,
      );
    });

    it("should return CVs with query options", async () => {
      const options: CvQueryOptions = {
        search: "software",
        sortBy: "title",
        sortOrder: "desc",
        limit: 5,
        offset: 10,
      };

      const mockResponse: PaginatedCvResponse = {
        data: [],
        total: 0,
        limit: 5,
        offset: 10,
      };

      mockCvRepository.getAllCvByUserId.mockResolvedValue(mockResponse);

      const result = await cvService.getAllCvs(userId, options);

      expect(result).toEqual(mockResponse);
      expect(mockCvRepository.getAllCvByUserId).toHaveBeenCalledWith(
        userId,
        options,
      );
    });

    it("should return empty result for user with no CVs", async () => {
      const mockResponse: PaginatedCvResponse = {
        data: [],
        total: 0,
        limit: 10,
        offset: 0,
      };

      mockCvRepository.getAllCvByUserId.mockResolvedValue(mockResponse);

      const result = await cvService.getAllCvs(userId);

      expect(result).toEqual(mockResponse);
    });
  });

  describe("getUserCvCount", () => {
    it("should return CV count for user", async () => {
      const expectedCount = 5;
      mockCvRepository.getUserCvCount.mockResolvedValue(expectedCount);

      const result = await cvService.getUserCvCount(userId);

      expect(result).toBe(expectedCount);
      expect(mockCvRepository.getUserCvCount).toHaveBeenCalledWith(userId);
    });

    it("should return 0 when repository returns null", async () => {
      mockCvRepository.getUserCvCount.mockResolvedValue(null);

      const result = await cvService.getUserCvCount(userId);

      expect(result).toBe(0);
    });
  });

  describe("updateCv", () => {
    const newCvId = 5;
    const newUserId = 5;
    const existingCv: CvSelect = {
      id: newCvId,
      userId: newUserId,
      title: "Original Title",
      description: "Original description",
      isPublic: false,
      createdAt: new Date("2025-06-23"),
      updatedAt: new Date("2025-06-23"),
      theme: "default",
      slug: null,
      views: null,
      downloads: null,
      language: "id",
    };

    it("should successfully update a CV", async () => {
      const updateData: CvUpdate = {
        title: "Updated Title",
        description: "Updated description",
        isPublic: true,
      };

      const updatedCv: CvSelect = {
        ...existingCv,
        ...updateData,
        updatedAt: new Date("2025-06-23"),
      };

      mockCvRepository.getCvByIdAndUserId.mockResolvedValueOnce(existingCv);
      mockCvRepository.updateCvByIdAndUserId.mockResolvedValue(true);
      mockCvRepository.getCvByIdAndUserId.mockResolvedValueOnce(updatedCv);

      const result = await cvService.updateCv(newCvId, newUserId, updateData);

      expect(result).toEqual(updatedCv);
      expect(mockCvRepository.getCvByIdAndUserId).toHaveBeenCalledTimes(2);
      expect(mockCvRepository.updateCvByIdAndUserId).toHaveBeenCalledWith(
        newCvId,
        newUserId,
        updateData,
      );
    });

    it("should update only specific fields", async () => {
      const updateData: CvUpdate = {
        title: "New Title Only",
      };

      const updatedCv: CvSelect = {
        ...existingCv,
        title: "New Title Only",
        updatedAt: new Date("2025-06-24"),
      };

      mockCvRepository.getCvByIdAndUserId.mockResolvedValueOnce(existingCv);
      mockCvRepository.updateCvByIdAndUserId.mockResolvedValue(true);
      mockCvRepository.getCvByIdAndUserId.mockResolvedValueOnce(updatedCv);

      const result = await cvService.updateCv(newCvId, newUserId, updateData);

      expect(result).toEqual(updatedCv);
    });
    it("should throw NotFoundError when CV does not exist", async () => {
      const updateData: CvUpdate = { title: "New Title" };
      mockCvRepository.getCvByIdAndUserId.mockResolvedValue(null);

      await expect(
        cvService.updateCv(newCvId, newUserId, updateData),
      ).rejects.toThrow(
        new NotFoundError("[Service] CV with ID 5 not found for user 5"),
      );
    });

    it("should handle empty update data", async () => {
      const updateData: CvUpdate = {};
      mockCvRepository.getCvByIdAndUserId.mockResolvedValueOnce(existingCv);
      mockCvRepository.updateCvByIdAndUserId.mockResolvedValue(true);
      mockCvRepository.getCvByIdAndUserId.mockResolvedValueOnce(existingCv);

      const result = await cvService.updateCv(newCvId, newUserId, updateData);

      expect(result).toEqual(existingCv);
    });
  });

  describe("deleteCv", () => {
    it("should successfully delete a CV", async () => {
      mockCvRepository.deleteCvByIdAndUserId.mockResolvedValue(true);

      const result = await cvService.deleteCv(cvId, userId);

      expect(result).toBe(true);
      expect(mockCvRepository.deleteCvByIdAndUserId).toHaveBeenCalledWith(
        cvId,
        userId,
      );
    });

    it("should return false when CV does not exist or belongs to different user", async () => {
      const userId = 1;
      mockCvRepository.deleteCvByIdAndUserId.mockResolvedValue(false);

      const result = await cvService.deleteCv(999, userId);

      expect(result).toBe(false);
    });

    it("should handle deletion of non-existent CV gracefully", async () => {
      mockCvRepository.deleteCvByIdAndUserId.mockResolvedValue(false);

      const result = await cvService.deleteCv(cvId, 69);

      expect(result).toBe(false);
    });
  });

  describe("assertCvOwnedByUser (private method behavior)", () => {
    it("should validate CV ownership through public methods", async () => {
      const cvId = 10;
      const userId = 3;
      const otherUserId = 4;

      mockCvRepository.getCvByIdAndUserId.mockImplementation((id, user) => {
        if (id === cvId && user === userId) {
          return Promise.resolve({
            id: cvId,
            title: "Test CV",
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        return Promise.resolve(null);
      });

      // User 3 can access their CV
      await expect(cvService.getCvById(cvId, userId)).resolves.toBeDefined();
      // User 4 cannot access CV belonging to user 3
      await expect(cvService.getCvById(cvId, otherUserId)).rejects.toThrow(
        new NotFoundError("[Service] CV with ID 10 not found for user 4"),
      );
    });
  });
});
