import { describe, test, expect, mock, beforeEach } from "bun:test";
import { EducationService } from "../src/services/education.service";
import { NotFoundError } from "../src/errors/not-found.error";
import { BadRequestError } from "../src/errors/bad-request.error";

// Create mock repository with the standard CRUD methods
const createMockRepo = () => {
  return {
    getAll: mock(() => Promise.resolve([{ id: 1, name: "Test" }])),
    getById: mock((id: number) => Promise.resolve({ id, name: "Test" })),
    create: mock((data: any) => Promise.resolve({ id: 1, ...data })),
    update: mock((id: number, data: any) => Promise.resolve({ id, ...data })),
    delete: mock((id: number) => Promise.resolve(true)),
    exists: mock((id: number) => Promise.resolve(false)),
    getAllByPersonalId: mock((personalId: number) => Promise.resolve([])),
    db: {},
    table: "education",
    primaryKey: "id",
  };
};

describe("Education Service", () => {
  let mockRepo: ReturnType<typeof createMockRepo>;
  let educationService: EducationService;

  beforeEach(() => {
    // Reset mocks before each test
    mockRepo = createMockRepo();
    educationService = new EducationService(mockRepo);
  });

  describe("getAll", () => {
    test("should return all education records", async () => {
      const mockData = [
        {
          id: 1,
          institution: "University A",
          personalId: 1,
          degree: "BS",
          field: "Computer Science",
          startDate: "2018-09",
          endDate: "2022-05",
        },
        {
          id: 2,
          institution: "University B",
          personalId: 1,
          degree: "MS",
          field: "Data Science",
          startDate: "2022-09",
          endDate: "2024-05",
        },
      ];
      mockRepo.getAll.mockReturnValue(Promise.resolve(mockData));

      const result = await educationService.getAll();

      expect(mockRepo.getAll).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe("getById", () => {
    test("should return an education record when it exists", async () => {
      const mockData = {
        id: 1,
        institution: "University A",
        degree: "BS",
        field: "Computer Science",
        startDate: "2018-09",
        endDate: "2022-05",
      };
      mockRepo.getById.mockReturnValue(Promise.resolve(mockData));

      const result = await educationService.getById(1);

      expect(mockRepo.getById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockData);
    });

    test("should throw NotFoundError when record doesn't exist", async () => {
      mockRepo.getById.mockReturnValue(Promise.resolve(null));

      try {
        await educationService.getById(999);
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect(error.message).toContain("not found");
      }

      expect(mockRepo.getById).toHaveBeenCalledWith(999);
    });
  });

  describe("create", () => {
    test("should create and return a new education record", async () => {
      const inputData = {
        institution: "University A",
        degree: "BS",
        field: "Computer Science",
        startDate: "2018-09",
        endDate: "2022-05",
      };
      const mockResult = {
        id: 1,
        ...inputData,
      };

      mockRepo.create.mockReturnValue(Promise.resolve(mockResult));

      const result = await educationService.create(inputData);

      expect(mockRepo.create).toHaveBeenCalledWith(inputData);
      expect(result).toEqual(mockResult);
    });

    test("should throw BadRequestError when creation fails", async () => {
      const inputData = {
        institution: "University A",
        degree: "BS",
        field: "Computer Science",
        startDate: "2018-09",
        endDate: "2022-05",
      };

      mockRepo.create.mockReturnValue(Promise.resolve(null));

      try {
        await educationService.create(inputData);
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestError);
        expect(error.message).toContain("failed to create");
      }

      expect(mockRepo.create).toHaveBeenCalledWith(inputData);
    });
  });

  describe("update", () => {
    test("should update and return the updated education record", async () => {
      const id = 1;
      const updateData = {
        institution: "Updated University",
        degree: "Updated Degree",
      };
      const existingData = {
        id: 1,
        institution: "University A",
        degree: "BS",
        field: "Computer Science",
        startDate: "2018-09",
        endDate: "2022-05",
      };
      const updatedData = {
        ...existingData,
        institution: "Updated University",
        degree: "Updated Degree",
      };

      mockRepo.getById.mockReturnValue(Promise.resolve(existingData));
      mockRepo.update.mockReturnValue(Promise.resolve(updatedData));

      const result = await educationService.update(id, updateData);

      expect(mockRepo.getById).toHaveBeenCalledWith(id);
      expect(mockRepo.update).toHaveBeenCalledWith(id, updateData);
      expect(result).toEqual(updatedData);
    });

    test("should throw NotFoundError when record to update doesn't exist", async () => {
      const id = 999;
      const updateData = { institution: "Updated University" };

      mockRepo.getById.mockReturnValue(Promise.resolve(null));

      try {
        await educationService.update(id, updateData);
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect(error.message).toContain("not found");
      }

      expect(mockRepo.getById).toHaveBeenCalledWith(id);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    test("should throw BadRequestError when update fails", async () => {
      const id = 1;
      const updateData = { institution: "Updated University" };
      const existingData = {
        id: 1,
        institution: "University A",
        degree: "BS",
        field: "Computer Science",
        startDate: "2018-09",
        endDate: "2022-05",
      };

      mockRepo.getById.mockReturnValue(Promise.resolve(existingData));
      mockRepo.update.mockReturnValue(Promise.resolve(null));

      try {
        await educationService.update(id, updateData);
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestError);
        expect(error.message).toContain("failed to update");
      }

      expect(mockRepo.getById).toHaveBeenCalledWith(id);
      expect(mockRepo.update).toHaveBeenCalledWith(id, updateData);
    });
  });

  describe("delete", () => {
    test("should delete an education record when it exists", async () => {
      const id = 1;
      const existingData = {
        id: 1,
        institution: "University A",
        degree: "BS",
        field: "Computer Science",
        startDate: "2018-09",
        endDate: "2022-05",
      };

      mockRepo.getById.mockReturnValue(Promise.resolve(existingData));
      mockRepo.delete.mockReturnValue(Promise.resolve());

      await educationService.delete(id);

      expect(mockRepo.getById).toHaveBeenCalledWith(id);
      expect(mockRepo.delete).toHaveBeenCalledWith(id);
    });

    test("should throw NotFoundError when record to delete doesn't exist", async () => {
      const id = 999;

      mockRepo.getById.mockReturnValue(Promise.resolve(null));

      try {
        await educationService.delete(id);
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect(error.message).toContain("not found");
      }

      expect(mockRepo.getById).toHaveBeenCalledWith(id);
      expect(mockRepo.delete).not.toHaveBeenCalled();
    });
  });
});
