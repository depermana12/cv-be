import { describe, it, expect, vi, beforeEach, type Mocked } from "vitest";
import { CvChildService } from "../../src/services/cvChild.service";
import { BadRequestError } from "../../src/errors/bad-request.error";
import { NotFoundError } from "../../src/errors/not-found.error";
import type { CvChildCrudRepository } from "../../src/repositories/cvChild.repo";
import {
  createMockCvChildRepository,
  createMockChildSelect,
  createMockChildInsert,
  createMockChildUpdate,
  createChildArray,
  setupRepositoryMocks,
  setupRepositoryFailures,
  setupRepositoryErrors,
  VALID_CV_ID,
  INVALID_CV_ID,
  VALID_CHILD_ID,
  INVALID_CHILD_ID,
  NONEXISTENT_CHILD_ID,
  TEST_SCENARIOS,
  EDGE_CASES,
  BOUNDARY_VALUES,
  type MockChildSelect,
  type MockChildInsert,
} from "../utils/cvChild.test-helpers";

class TestCvChildService extends CvChildService<
  MockChildSelect,
  MockChildInsert
> {
  constructor(
    repository: CvChildCrudRepository<MockChildSelect, MockChildInsert>,
  ) {
    super(repository);
  }
}

describe("CvChildService", () => {
  let cvChildService: TestCvChildService;
  let mockRepository: Mocked<
    CvChildCrudRepository<MockChildSelect, MockChildInsert>
  >;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepository = createMockCvChildRepository();
    cvChildService = new TestCvChildService(mockRepository);
  });

  describe("create", () => {
    it("should create child record successfully", async () => {
      const createData = createMockChildInsert();
      const expectedResult = createMockChildSelect();
      mockRepository.create.mockResolvedValue(expectedResult);

      const result = await cvChildService.create(VALID_CV_ID, createData);

      expect(result).toEqual(expectedResult);
      expect(mockRepository.create).toHaveBeenCalledWith(
        VALID_CV_ID,
        createData,
      );
    });

    it("should create child record with minimal data", async () => {
      const createData = TEST_SCENARIOS.MINIMAL_CREATE_DATA;
      const expectedResult = createMockChildSelect({
        name: "Minimal",
        description: undefined,
        displayOrder: undefined,
      });
      mockRepository.create.mockResolvedValue(expectedResult);

      const result = await cvChildService.create(VALID_CV_ID, createData);

      expect(result).toEqual(expectedResult);
      expect(mockRepository.create).toHaveBeenCalledWith(
        VALID_CV_ID,
        createData,
      );
    });

    it("should handle special characters in data", async () => {
      const createData = EDGE_CASES.SPECIAL_CHARACTERS;
      const expectedResult = createMockChildSelect({ name: "Test@#$%^&*()" });
      mockRepository.create.mockResolvedValue(expectedResult);

      const result = await cvChildService.create(VALID_CV_ID, createData);

      expect(result.name).toBe("Test@#$%^&*()");
    });

    it("should handle unicode characters in data", async () => {
      const createData = EDGE_CASES.UNICODE_NAME;
      const expectedResult = createMockChildSelect({ name: "测试数据" });
      mockRepository.create.mockResolvedValue(expectedResult);

      const result = await cvChildService.create(VALID_CV_ID, createData);

      expect(result.name).toBe("测试数据");
    });

    it("should handle boundary CV ID values", async () => {
      const createData = createMockChildInsert();
      const expectedResult = createMockChildSelect({
        cvId: BOUNDARY_VALUES.MAX_CV_ID,
      });
      mockRepository.create.mockResolvedValue(expectedResult);

      const result = await cvChildService.create(
        BOUNDARY_VALUES.MAX_CV_ID,
        createData,
      );

      expect(mockRepository.create).toHaveBeenCalledWith(
        BOUNDARY_VALUES.MAX_CV_ID,
        createData,
      );
    });

    it("should handle negative display order", async () => {
      const createData = EDGE_CASES.NEGATIVE_DISPLAY_ORDER;
      const expectedResult = createMockChildSelect({ displayOrder: -1 });
      mockRepository.create.mockResolvedValue(expectedResult);

      const result = await cvChildService.create(VALID_CV_ID, createData);

      expect(result.displayOrder).toBe(-1);
    });

    it("should handle large display order values", async () => {
      const createData = EDGE_CASES.LARGE_DISPLAY_ORDER;
      const expectedResult = createMockChildSelect({ displayOrder: 999999 });
      mockRepository.create.mockResolvedValue(expectedResult);

      const result = await cvChildService.create(VALID_CV_ID, createData);

      expect(result.displayOrder).toBe(999999);
    });

    it("should throw BadRequestError when repository returns null", async () => {
      const createData = createMockChildInsert();
      mockRepository.create.mockResolvedValue(null as any);

      await expect(
        cvChildService.create(VALID_CV_ID, createData),
      ).rejects.toThrow(
        new BadRequestError(`Failed to create record in CV: ${VALID_CV_ID}`),
      );
    });

    it("should throw BadRequestError when repository returns undefined", async () => {
      const createData = createMockChildInsert();
      mockRepository.create.mockResolvedValue(undefined as any);

      await expect(
        cvChildService.create(VALID_CV_ID, createData),
      ).rejects.toThrow(
        new BadRequestError(`Failed to create record in CV: ${VALID_CV_ID}`),
      );
    });

    it("should handle database connection errors", async () => {
      const createData = createMockChildInsert();
      mockRepository.create.mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(
        cvChildService.create(VALID_CV_ID, createData),
      ).rejects.toThrow("Database connection failed");
    });

    it("should handle zero CV ID", async () => {
      const createData = createMockChildInsert();
      const expectedResult = createMockChildSelect({ cvId: 0 });
      mockRepository.create.mockResolvedValue(expectedResult);

      const result = await cvChildService.create(
        BOUNDARY_VALUES.ZERO_CV_ID,
        createData,
      );

      expect(mockRepository.create).toHaveBeenCalledWith(
        BOUNDARY_VALUES.ZERO_CV_ID,
        createData,
      );
    });

    it("should handle negative CV ID", async () => {
      const createData = createMockChildInsert();

      await expect(
        cvChildService.create(BOUNDARY_VALUES.NEGATIVE_CV_ID, createData),
      ).rejects.toThrow();
    });

    it("should handle empty string name", async () => {
      const createData = EDGE_CASES.EMPTY_STRING_NAME;
      const expectedResult = createMockChildSelect({ name: "" });
      mockRepository.create.mockResolvedValue(expectedResult);

      const result = await cvChildService.create(VALID_CV_ID, createData);

      expect(result.name).toBe("");
    });

    it("should handle very long names", async () => {
      const createData = EDGE_CASES.VERY_LONG_NAME;
      const longName = "A".repeat(1000);
      const expectedResult = createMockChildSelect({ name: longName });
      mockRepository.create.mockResolvedValue(expectedResult);

      const result = await cvChildService.create(VALID_CV_ID, createData);

      expect(result.name).toBe(longName);
    });
  });

  describe("getOne", () => {
    it("should return child record when found", async () => {
      const expectedResult = createMockChildSelect();
      mockRepository.getOne.mockResolvedValue(expectedResult);

      const result = await cvChildService.getOne(VALID_CV_ID, VALID_CHILD_ID);

      expect(result).toEqual(expectedResult);
      expect(mockRepository.getOne).toHaveBeenCalledWith(
        VALID_CV_ID,
        VALID_CHILD_ID,
      );
    });

    it("should return record with all field types", async () => {
      const expectedResult = createMockChildSelect({
        id: 1,
        cvId: VALID_CV_ID,
        name: "Complete Record",
        description: "Full description",
        displayOrder: 5,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      });
      mockRepository.getOne.mockResolvedValue(expectedResult);

      const result = await cvChildService.getOne(VALID_CV_ID, VALID_CHILD_ID);

      expect(result.id).toBe(1);
      expect(result.cvId).toBe(VALID_CV_ID);
      expect(result.name).toBe("Complete Record");
      expect(result.description).toBe("Full description");
      expect(result.displayOrder).toBe(5);
      expect(result.createdAt).toEqual(new Date("2024-01-01"));
      expect(result.updatedAt).toEqual(new Date("2024-01-02"));
    });

    it("should handle boundary ID values", async () => {
      const expectedResult = createMockChildSelect({
        id: BOUNDARY_VALUES.MAX_CHILD_ID,
      });
      mockRepository.getOne.mockResolvedValue(expectedResult);

      const result = await cvChildService.getOne(
        BOUNDARY_VALUES.MAX_CV_ID,
        BOUNDARY_VALUES.MAX_CHILD_ID,
      );

      expect(mockRepository.getOne).toHaveBeenCalledWith(
        BOUNDARY_VALUES.MAX_CV_ID,
        BOUNDARY_VALUES.MAX_CHILD_ID,
      );
    });

    it("should throw NotFoundError when record does not exist", async () => {
      mockRepository.getOne.mockResolvedValue(null);

      await expect(
        cvChildService.getOne(VALID_CV_ID, NONEXISTENT_CHILD_ID),
      ).rejects.toThrow(
        new NotFoundError(
          `Record with ID ${NONEXISTENT_CHILD_ID} not found in CV: ${VALID_CV_ID}`,
        ),
      );
    });

    it("should throw NotFoundError for invalid CV ID", async () => {
      mockRepository.getOne.mockResolvedValue(null);

      await expect(
        cvChildService.getOne(INVALID_CV_ID, VALID_CHILD_ID),
      ).rejects.toThrow(
        new NotFoundError(
          `Record with ID ${VALID_CHILD_ID} not found in CV: ${INVALID_CV_ID}`,
        ),
      );
    });

    it("should throw NotFoundError for invalid child ID", async () => {
      mockRepository.getOne.mockResolvedValue(null);

      await expect(
        cvChildService.getOne(VALID_CV_ID, INVALID_CHILD_ID),
      ).rejects.toThrow(
        new NotFoundError(
          `Record with ID ${INVALID_CHILD_ID} not found in CV: ${VALID_CV_ID}`,
        ),
      );
    });

    it("should handle database connection errors", async () => {
      mockRepository.getOne.mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(
        cvChildService.getOne(VALID_CV_ID, VALID_CHILD_ID),
      ).rejects.toThrow("Database connection failed");
    });

    it("should handle zero IDs", async () => {
      mockRepository.getOne.mockResolvedValue(null);

      await expect(
        cvChildService.getOne(
          BOUNDARY_VALUES.ZERO_CV_ID,
          BOUNDARY_VALUES.ZERO_CHILD_ID,
        ),
      ).rejects.toThrow(
        new NotFoundError(
          `Record with ID ${BOUNDARY_VALUES.ZERO_CHILD_ID} not found in CV: ${BOUNDARY_VALUES.ZERO_CV_ID}`,
        ),
      );
    });

    it("should handle negative IDs", async () => {
      mockRepository.getOne.mockResolvedValue(null);

      await expect(
        cvChildService.getOne(
          BOUNDARY_VALUES.NEGATIVE_CV_ID,
          BOUNDARY_VALUES.NEGATIVE_CHILD_ID,
        ),
      ).rejects.toThrow(
        new NotFoundError(
          `Record with ID ${BOUNDARY_VALUES.NEGATIVE_CHILD_ID} not found in CV: ${BOUNDARY_VALUES.NEGATIVE_CV_ID}`,
        ),
      );
    });

    it("should handle repository timeout errors", async () => {
      mockRepository.getOne.mockRejectedValue(new Error("Query timeout"));

      await expect(
        cvChildService.getOne(VALID_CV_ID, VALID_CHILD_ID),
      ).rejects.toThrow("Query timeout");
    });

    it("should handle malformed response from repository", async () => {
      mockRepository.getOne.mockResolvedValue({} as any);

      const result = await cvChildService.getOne(VALID_CV_ID, VALID_CHILD_ID);

      expect(result).toEqual({});
    });
  });

  describe("getAll", () => {
    it("should return all child records for CV", async () => {
      const expectedRecords = createChildArray(3);
      mockRepository.getAll.mockResolvedValue(expectedRecords);

      const result = await cvChildService.getAll(VALID_CV_ID);

      expect(result).toEqual(expectedRecords);
      expect(result).toHaveLength(3);
      expect(mockRepository.getAll).toHaveBeenCalledWith(VALID_CV_ID);
    });

    it("should return empty array when no records exist", async () => {
      mockRepository.getAll.mockResolvedValue([]);

      const result = await cvChildService.getAll(VALID_CV_ID);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should return single record array", async () => {
      const singleRecord = [createMockChildSelect()];
      mockRepository.getAll.mockResolvedValue(singleRecord);

      const result = await cvChildService.getAll(VALID_CV_ID);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(singleRecord[0]);
    });

    it("should handle large datasets", async () => {
      const largeDataset = TEST_SCENARIOS.LARGE_DATASET;
      mockRepository.getAll.mockResolvedValue(largeDataset);

      const result = await cvChildService.getAll(VALID_CV_ID);

      expect(result).toHaveLength(100);
      expect(result).toEqual(largeDataset);
    });

    it("should handle records with different display orders", async () => {
      const recordsWithOrders = [
        createMockChildSelect({ id: 1, displayOrder: 3 }),
        createMockChildSelect({ id: 2, displayOrder: 1 }),
        createMockChildSelect({ id: 3, displayOrder: 2 }),
      ];
      mockRepository.getAll.mockResolvedValue(recordsWithOrders);

      const result = await cvChildService.getAll(VALID_CV_ID);

      expect(result).toHaveLength(3);
      expect(result).toEqual(recordsWithOrders);
    });

    it("should handle records with null display orders", async () => {
      const recordsWithNullOrders = [
        createMockChildSelect({ displayOrder: undefined }),
        createMockChildSelect({ displayOrder: 1 }),
      ];
      mockRepository.getAll.mockResolvedValue(recordsWithNullOrders);

      const result = await cvChildService.getAll(VALID_CV_ID);

      expect(result).toHaveLength(2);
    });

    it("should handle boundary CV ID values", async () => {
      const expectedRecords = createChildArray(2);
      mockRepository.getAll.mockResolvedValue(expectedRecords);

      const result = await cvChildService.getAll(BOUNDARY_VALUES.MAX_CV_ID);

      expect(mockRepository.getAll).toHaveBeenCalledWith(
        BOUNDARY_VALUES.MAX_CV_ID,
      );
    });

    it("should handle database connection errors", async () => {
      mockRepository.getAll.mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(cvChildService.getAll(VALID_CV_ID)).rejects.toThrow(
        "Database connection failed",
      );
    });

    it("should handle zero CV ID", async () => {
      mockRepository.getAll.mockResolvedValue([]);

      const result = await cvChildService.getAll(BOUNDARY_VALUES.ZERO_CV_ID);

      expect(result).toEqual([]);
    });

    it("should handle negative CV ID", async () => {
      mockRepository.getAll.mockResolvedValue([]);

      const result = await cvChildService.getAll(
        BOUNDARY_VALUES.NEGATIVE_CV_ID,
      );

      expect(mockRepository.getAll).toHaveBeenCalledWith(
        BOUNDARY_VALUES.NEGATIVE_CV_ID,
      );
    });

    it("should handle repository query errors", async () => {
      mockRepository.getAll.mockRejectedValue(new Error("Query syntax error"));

      await expect(cvChildService.getAll(VALID_CV_ID)).rejects.toThrow(
        "Query syntax error",
      );
    });

    it("should handle memory allocation errors for large datasets", async () => {
      mockRepository.getAll.mockRejectedValue(new Error("Out of memory"));

      await expect(cvChildService.getAll(VALID_CV_ID)).rejects.toThrow(
        "Out of memory",
      );
    });
  });

  describe("update", () => {
    it("should update child record successfully", async () => {
      const existingRecord = createMockChildSelect();
      const updateData = createMockChildUpdate();
      const updatedRecord = createMockChildSelect({ ...updateData });

      mockRepository.getOne.mockResolvedValue(existingRecord);
      mockRepository.update.mockResolvedValue(updatedRecord);

      const result = await cvChildService.update(
        VALID_CV_ID,
        VALID_CHILD_ID,
        updateData,
      );

      expect(result).toEqual(updatedRecord);
      expect(mockRepository.getOne).toHaveBeenCalledWith(
        VALID_CV_ID,
        VALID_CHILD_ID,
      );
      expect(mockRepository.update).toHaveBeenCalledWith(
        VALID_CV_ID,
        VALID_CHILD_ID,
        updateData,
      );
    });

    it("should update with partial data", async () => {
      const existingRecord = createMockChildSelect();
      const partialUpdate = { name: "Updated Name Only" };
      const updatedRecord = createMockChildSelect({
        name: "Updated Name Only",
      });

      mockRepository.getOne.mockResolvedValue(existingRecord);
      mockRepository.update.mockResolvedValue(updatedRecord);

      const result = await cvChildService.update(
        VALID_CV_ID,
        VALID_CHILD_ID,
        partialUpdate,
      );

      expect(result.name).toBe("Updated Name Only");
      expect(mockRepository.update).toHaveBeenCalledWith(
        VALID_CV_ID,
        VALID_CHILD_ID,
        partialUpdate,
      );
    });

    it("should update with empty data object", async () => {
      const existingRecord = createMockChildSelect();
      const emptyUpdate = {};

      mockRepository.getOne.mockResolvedValue(existingRecord);
      mockRepository.update.mockResolvedValue(existingRecord);

      const result = await cvChildService.update(
        VALID_CV_ID,
        VALID_CHILD_ID,
        emptyUpdate,
      );

      expect(result).toEqual(existingRecord);
      expect(mockRepository.update).toHaveBeenCalledWith(
        VALID_CV_ID,
        VALID_CHILD_ID,
        emptyUpdate,
      );
    });

    it("should update display order only", async () => {
      const existingRecord = createMockChildSelect();
      const displayOrderUpdate = { displayOrder: 5 };
      const updatedRecord = createMockChildSelect({ displayOrder: 5 });

      mockRepository.getOne.mockResolvedValue(existingRecord);
      mockRepository.update.mockResolvedValue(updatedRecord);

      const result = await cvChildService.update(
        VALID_CV_ID,
        VALID_CHILD_ID,
        displayOrderUpdate,
      );

      expect(result.displayOrder).toBe(5);
    });

    it("should update description to null", async () => {
      const existingRecord = createMockChildSelect();
      const nullDescriptionUpdate = { description: undefined };
      const updatedRecord = createMockChildSelect({ description: undefined });

      mockRepository.getOne.mockResolvedValue(existingRecord);
      mockRepository.update.mockResolvedValue(updatedRecord);

      const result = await cvChildService.update(
        VALID_CV_ID,
        VALID_CHILD_ID,
        nullDescriptionUpdate,
      );

      expect(result.description).toBeUndefined();
    });

    it("should handle special characters in update", async () => {
      const existingRecord = createMockChildSelect();
      const specialCharUpdate = { name: "Updated@#$%^&*()" };
      const updatedRecord = createMockChildSelect({ name: "Updated@#$%^&*()" });

      mockRepository.getOne.mockResolvedValue(existingRecord);
      mockRepository.update.mockResolvedValue(updatedRecord);

      const result = await cvChildService.update(
        VALID_CV_ID,
        VALID_CHILD_ID,
        specialCharUpdate,
      );

      expect(result.name).toBe("Updated@#$%^&*()");
    });

    it("should handle unicode characters in update", async () => {
      const existingRecord = createMockChildSelect();
      const unicodeUpdate = { name: "更新的数据" };
      const updatedRecord = createMockChildSelect({ name: "更新的数据" });

      mockRepository.getOne.mockResolvedValue(existingRecord);
      mockRepository.update.mockResolvedValue(updatedRecord);

      const result = await cvChildService.update(
        VALID_CV_ID,
        VALID_CHILD_ID,
        unicodeUpdate,
      );

      expect(result.name).toBe("更新的数据");
    });

    it("should handle boundary ID values", async () => {
      const existingRecord = createMockChildSelect();
      const updateData = createMockChildUpdate();
      const updatedRecord = createMockChildSelect({ ...updateData });

      mockRepository.getOne.mockResolvedValue(existingRecord);
      mockRepository.update.mockResolvedValue(updatedRecord);

      const result = await cvChildService.update(
        BOUNDARY_VALUES.MAX_CV_ID,
        BOUNDARY_VALUES.MAX_CHILD_ID,
        updateData,
      );

      expect(mockRepository.getOne).toHaveBeenCalledWith(
        BOUNDARY_VALUES.MAX_CV_ID,
        BOUNDARY_VALUES.MAX_CHILD_ID,
      );
    });

    it("should throw NotFoundError when record does not exist", async () => {
      const updateData = createMockChildUpdate();
      mockRepository.getOne.mockResolvedValue(null);

      await expect(
        cvChildService.update(VALID_CV_ID, NONEXISTENT_CHILD_ID, updateData),
      ).rejects.toThrow(
        new NotFoundError(
          `Record with ID ${NONEXISTENT_CHILD_ID} not found in CV: ${VALID_CV_ID}`,
        ),
      );

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("should throw NotFoundError for invalid CV ID", async () => {
      const updateData = createMockChildUpdate();
      mockRepository.getOne.mockResolvedValue(null);

      await expect(
        cvChildService.update(INVALID_CV_ID, VALID_CHILD_ID, updateData),
      ).rejects.toThrow(
        new NotFoundError(
          `Record with ID ${VALID_CHILD_ID} not found in CV: ${INVALID_CV_ID}`,
        ),
      );
    });

    it("should throw BadRequestError when update operation fails", async () => {
      const existingRecord = createMockChildSelect();
      const updateData = createMockChildUpdate();

      mockRepository.getOne.mockResolvedValue(existingRecord);
      mockRepository.update.mockResolvedValue(null as any);

      await expect(
        cvChildService.update(VALID_CV_ID, VALID_CHILD_ID, updateData),
      ).rejects.toThrow(
        new BadRequestError(
          `Failed to update record with ID ${VALID_CHILD_ID} in CV: ${VALID_CV_ID}`,
        ),
      );
    });

    it("should throw BadRequestError when update returns undefined", async () => {
      const existingRecord = createMockChildSelect();
      const updateData = createMockChildUpdate();

      mockRepository.getOne.mockResolvedValue(existingRecord);
      mockRepository.update.mockResolvedValue(undefined as any);

      await expect(
        cvChildService.update(VALID_CV_ID, VALID_CHILD_ID, updateData),
      ).rejects.toThrow(
        new BadRequestError(
          `Failed to update record with ID ${VALID_CHILD_ID} in CV: ${VALID_CV_ID}`,
        ),
      );
    });

    it("should handle database connection errors during existence check", async () => {
      const updateData = createMockChildUpdate();
      mockRepository.getOne.mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(
        cvChildService.update(VALID_CV_ID, VALID_CHILD_ID, updateData),
      ).rejects.toThrow("Database connection failed");
    });

    it("should handle database connection errors during update", async () => {
      const existingRecord = createMockChildSelect();
      const updateData = createMockChildUpdate();

      mockRepository.getOne.mockResolvedValue(existingRecord);
      mockRepository.update.mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(
        cvChildService.update(VALID_CV_ID, VALID_CHILD_ID, updateData),
      ).rejects.toThrow("Database connection failed");
    });

    it("should handle zero IDs", async () => {
      const updateData = createMockChildUpdate();
      mockRepository.getOne.mockResolvedValue(null);

      await expect(
        cvChildService.update(
          BOUNDARY_VALUES.ZERO_CV_ID,
          BOUNDARY_VALUES.ZERO_CHILD_ID,
          updateData,
        ),
      ).rejects.toThrow(
        new NotFoundError(
          `Record with ID ${BOUNDARY_VALUES.ZERO_CHILD_ID} not found in CV: ${BOUNDARY_VALUES.ZERO_CV_ID}`,
        ),
      );
    });

    it("should handle negative IDs", async () => {
      const updateData = createMockChildUpdate();
      mockRepository.getOne.mockResolvedValue(null);

      await expect(
        cvChildService.update(
          BOUNDARY_VALUES.NEGATIVE_CV_ID,
          BOUNDARY_VALUES.NEGATIVE_CHILD_ID,
          updateData,
        ),
      ).rejects.toThrow(
        new NotFoundError(
          `Record with ID ${BOUNDARY_VALUES.NEGATIVE_CHILD_ID} not found in CV: ${BOUNDARY_VALUES.NEGATIVE_CV_ID}`,
        ),
      );
    });
  });

  describe("delete", () => {
    it("should delete child record successfully", async () => {
      const existingRecord = createMockChildSelect();
      mockRepository.getOne.mockResolvedValue(existingRecord);
      mockRepository.delete.mockResolvedValue(true);

      const result = await cvChildService.delete(VALID_CV_ID, VALID_CHILD_ID);

      expect(result).toBe(true);
      expect(mockRepository.getOne).toHaveBeenCalledWith(
        VALID_CV_ID,
        VALID_CHILD_ID,
      );
      expect(mockRepository.delete).toHaveBeenCalledWith(
        VALID_CV_ID,
        VALID_CHILD_ID,
      );
    });

    it("should handle deletion of record with all field types", async () => {
      const complexRecord = createMockChildSelect({
        id: VALID_CHILD_ID,
        cvId: VALID_CV_ID,
        name: "Complex Record",
        description: "Detailed description",
        displayOrder: 5,
      });
      mockRepository.getOne.mockResolvedValue(complexRecord);
      mockRepository.delete.mockResolvedValue(true);

      const result = await cvChildService.delete(VALID_CV_ID, VALID_CHILD_ID);

      expect(result).toBe(true);
    });

    it("should handle deletion with boundary ID values", async () => {
      const existingRecord = createMockChildSelect();
      mockRepository.getOne.mockResolvedValue(existingRecord);
      mockRepository.delete.mockResolvedValue(true);

      const result = await cvChildService.delete(
        BOUNDARY_VALUES.MAX_CV_ID,
        BOUNDARY_VALUES.MAX_CHILD_ID,
      );

      expect(result).toBe(true);
      expect(mockRepository.getOne).toHaveBeenCalledWith(
        BOUNDARY_VALUES.MAX_CV_ID,
        BOUNDARY_VALUES.MAX_CHILD_ID,
      );
    });

    it("should throw NotFoundError when record does not exist", async () => {
      mockRepository.getOne.mockResolvedValue(null);

      await expect(
        cvChildService.delete(VALID_CV_ID, NONEXISTENT_CHILD_ID),
      ).rejects.toThrow(
        new NotFoundError(
          `Record with ID ${NONEXISTENT_CHILD_ID} not found in CV: ${VALID_CV_ID}`,
        ),
      );

      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw NotFoundError for invalid CV ID", async () => {
      mockRepository.getOne.mockResolvedValue(null);

      await expect(
        cvChildService.delete(INVALID_CV_ID, VALID_CHILD_ID),
      ).rejects.toThrow(
        new NotFoundError(
          `Record with ID ${VALID_CHILD_ID} not found in CV: ${INVALID_CV_ID}`,
        ),
      );
    });

    it("should throw NotFoundError for invalid child ID", async () => {
      mockRepository.getOne.mockResolvedValue(null);

      await expect(
        cvChildService.delete(VALID_CV_ID, INVALID_CHILD_ID),
      ).rejects.toThrow(
        new NotFoundError(
          `Record with ID ${INVALID_CHILD_ID} not found in CV: ${VALID_CV_ID}`,
        ),
      );
    });

    it("should throw BadRequestError when deletion operation fails", async () => {
      const existingRecord = createMockChildSelect();
      mockRepository.getOne.mockResolvedValue(existingRecord);
      mockRepository.delete.mockResolvedValue(false);

      await expect(
        cvChildService.delete(VALID_CV_ID, VALID_CHILD_ID),
      ).rejects.toThrow(
        new BadRequestError(
          `Failed to delete record with ID ${VALID_CHILD_ID} in CV: ${VALID_CV_ID}`,
        ),
      );
    });

    it("should handle database connection errors during existence check", async () => {
      mockRepository.getOne.mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(
        cvChildService.delete(VALID_CV_ID, VALID_CHILD_ID),
      ).rejects.toThrow("Database connection failed");
    });

    it("should handle database connection errors during deletion", async () => {
      const existingRecord = createMockChildSelect();
      mockRepository.getOne.mockResolvedValue(existingRecord);
      mockRepository.delete.mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(
        cvChildService.delete(VALID_CV_ID, VALID_CHILD_ID),
      ).rejects.toThrow("Database connection failed");
    });

    it("should handle zero IDs", async () => {
      mockRepository.getOne.mockResolvedValue(null);

      await expect(
        cvChildService.delete(
          BOUNDARY_VALUES.ZERO_CV_ID,
          BOUNDARY_VALUES.ZERO_CHILD_ID,
        ),
      ).rejects.toThrow(
        new NotFoundError(
          `Record with ID ${BOUNDARY_VALUES.ZERO_CHILD_ID} not found in CV: ${BOUNDARY_VALUES.ZERO_CV_ID}`,
        ),
      );
    });

    it("should handle negative IDs", async () => {
      mockRepository.getOne.mockResolvedValue(null);

      await expect(
        cvChildService.delete(
          BOUNDARY_VALUES.NEGATIVE_CV_ID,
          BOUNDARY_VALUES.NEGATIVE_CHILD_ID,
        ),
      ).rejects.toThrow(
        new NotFoundError(
          `Record with ID ${BOUNDARY_VALUES.NEGATIVE_CHILD_ID} not found in CV: ${BOUNDARY_VALUES.NEGATIVE_CV_ID}`,
        ),
      );
    });

    it("should handle constraint violation errors", async () => {
      const existingRecord = createMockChildSelect();
      mockRepository.getOne.mockResolvedValue(existingRecord);
      mockRepository.delete.mockRejectedValue(
        new Error("Foreign key constraint violation"),
      );

      await expect(
        cvChildService.delete(VALID_CV_ID, VALID_CHILD_ID),
      ).rejects.toThrow("Foreign key constraint violation");
    });

    it("should handle repository timeout errors", async () => {
      const existingRecord = createMockChildSelect();
      mockRepository.getOne.mockResolvedValue(existingRecord);
      mockRepository.delete.mockRejectedValue(new Error("Query timeout"));

      await expect(
        cvChildService.delete(VALID_CV_ID, VALID_CHILD_ID),
      ).rejects.toThrow("Query timeout");
    });

    it("should handle transaction rollback scenarios", async () => {
      const existingRecord = createMockChildSelect();
      mockRepository.getOne.mockResolvedValue(existingRecord);
      mockRepository.delete.mockRejectedValue(
        new Error("Transaction rolled back"),
      );

      await expect(
        cvChildService.delete(VALID_CV_ID, VALID_CHILD_ID),
      ).rejects.toThrow("Transaction rolled back");
    });
  });

  describe("exists", () => {
    it("should return true when record exists", async () => {
      mockRepository.exists.mockResolvedValue(true);

      const result = await cvChildService.exists(VALID_CV_ID, VALID_CHILD_ID);

      expect(result).toBe(true);
      expect(mockRepository.exists).toHaveBeenCalledWith(
        VALID_CV_ID,
        VALID_CHILD_ID,
      );
    });

    it("should return false when record does not exist", async () => {
      mockRepository.exists.mockResolvedValue(false);

      const result = await cvChildService.exists(
        VALID_CV_ID,
        NONEXISTENT_CHILD_ID,
      );

      expect(result).toBe(false);
      expect(mockRepository.exists).toHaveBeenCalledWith(
        VALID_CV_ID,
        NONEXISTENT_CHILD_ID,
      );
    });

    it("should return false for invalid CV ID", async () => {
      mockRepository.exists.mockResolvedValue(false);

      const result = await cvChildService.exists(INVALID_CV_ID, VALID_CHILD_ID);

      expect(result).toBe(false);
      expect(mockRepository.exists).toHaveBeenCalledWith(
        INVALID_CV_ID,
        VALID_CHILD_ID,
      );
    });

    it("should return false for invalid child ID", async () => {
      mockRepository.exists.mockResolvedValue(false);

      const result = await cvChildService.exists(VALID_CV_ID, INVALID_CHILD_ID);

      expect(result).toBe(false);
      expect(mockRepository.exists).toHaveBeenCalledWith(
        VALID_CV_ID,
        INVALID_CHILD_ID,
      );
    });

    it("should handle boundary ID values", async () => {
      mockRepository.exists.mockResolvedValue(true);

      const result = await cvChildService.exists(
        BOUNDARY_VALUES.MAX_CV_ID,
        BOUNDARY_VALUES.MAX_CHILD_ID,
      );

      expect(result).toBe(true);
      expect(mockRepository.exists).toHaveBeenCalledWith(
        BOUNDARY_VALUES.MAX_CV_ID,
        BOUNDARY_VALUES.MAX_CHILD_ID,
      );
    });

    it("should handle zero IDs", async () => {
      mockRepository.exists.mockResolvedValue(false);

      const result = await cvChildService.exists(
        BOUNDARY_VALUES.ZERO_CV_ID,
        BOUNDARY_VALUES.ZERO_CHILD_ID,
      );

      expect(result).toBe(false);
      expect(mockRepository.exists).toHaveBeenCalledWith(
        BOUNDARY_VALUES.ZERO_CV_ID,
        BOUNDARY_VALUES.ZERO_CHILD_ID,
      );
    });

    it("should handle negative IDs", async () => {
      mockRepository.exists.mockResolvedValue(false);

      const result = await cvChildService.exists(
        BOUNDARY_VALUES.NEGATIVE_CV_ID,
        BOUNDARY_VALUES.NEGATIVE_CHILD_ID,
      );

      expect(result).toBe(false);
      expect(mockRepository.exists).toHaveBeenCalledWith(
        BOUNDARY_VALUES.NEGATIVE_CV_ID,
        BOUNDARY_VALUES.NEGATIVE_CHILD_ID,
      );
    });

    it("should handle database connection errors", async () => {
      mockRepository.exists.mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(
        cvChildService.exists(VALID_CV_ID, VALID_CHILD_ID),
      ).rejects.toThrow("Database connection failed");
    });

    it("should handle repository query errors", async () => {
      mockRepository.exists.mockRejectedValue(new Error("Query syntax error"));

      await expect(
        cvChildService.exists(VALID_CV_ID, VALID_CHILD_ID),
      ).rejects.toThrow("Query syntax error");
    });

    it("should handle repository timeout errors", async () => {
      mockRepository.exists.mockRejectedValue(new Error("Query timeout"));

      await expect(
        cvChildService.exists(VALID_CV_ID, VALID_CHILD_ID),
      ).rejects.toThrow("Query timeout");
    });

    it("should be performant for multiple existence checks", async () => {
      mockRepository.exists.mockResolvedValue(true);

      const promises = Array.from({ length: 10 }, (_, i) =>
        cvChildService.exists(VALID_CV_ID, i + 1),
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      expect(results.every((result) => result === true)).toBe(true);
      expect(mockRepository.exists).toHaveBeenCalledTimes(10);
    });

    it("should handle concurrent existence checks", async () => {
      mockRepository.exists.mockImplementation(async (cvId, childId) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return childId <= 5;
      });

      const concurrentChecks = [
        cvChildService.exists(VALID_CV_ID, 1),
        cvChildService.exists(VALID_CV_ID, 10),
        cvChildService.exists(VALID_CV_ID, 3),
      ];

      const results = await Promise.all(concurrentChecks);

      expect(results).toEqual([true, false, true]);
    });

    it("should handle malformed repository responses", async () => {
      mockRepository.exists.mockResolvedValue(null as any);

      const result = await cvChildService.exists(VALID_CV_ID, VALID_CHILD_ID);

      expect(result).toBeFalsy();
    });
  });
});
