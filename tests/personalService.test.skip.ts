import { describe, test, expect, mock, beforeEach } from "bun:test";
import { PersonalService } from "../src/services/personal.service";
import { NotFoundError } from "../src/errors/not-found.error";
import { BadRequestError } from "../src/errors/bad-request.error";

// Create mock repository with all the methods used in Personal class
const createMockRepo = () => {
  return {
    getAll: mock(() => {}),
    getById: mock(() => {}),
    create: mock(() => {}),
    update: mock(() => {}),
    delete: mock(() => {}),
  };
};

describe("Personal Service", () => {
  let mockRepo;
  let personalService;

  beforeEach(() => {
    // Reset mocks before each test
    mockRepo = createMockRepo();
    personalService = new PersonalService(mockRepo);
  });

  describe("getAll", () => {
    test("should return all personal records", async () => {
      const mockData = [{ id: 1, name: "Test Person" }];
      mockRepo.getAll.mockReturnValue(Promise.resolve(mockData));

      const result = await personalService.getAll();

      expect(mockRepo.getAll).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe("getById", () => {
    test("should return a personal record when it exists", async () => {
      const mockData = { id: 1, name: "Test Person" };
      mockRepo.getById.mockReturnValue(Promise.resolve(mockData));

      const result = await personalService.getById(1);

      expect(mockRepo.getById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockData);
    });

    test("should throw NotFoundError when record doesn't exist", async () => {
      mockRepo.getById.mockReturnValue(Promise.resolve(null));

      try {
        await personalService.getById(999);
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect(error.message).toContain("personal ID 999 not found");
      }

      expect(mockRepo.getById).toHaveBeenCalledWith(999);
    });
  });

  describe("create", () => {
    test("should create and return a new personal record", async () => {
      const inputData = {
        basic: { name: "Test Person" },
        location: { address: "Test Address" },
        socials: [],
      };
      const mockResult = {
        id: 1,
        name: "Test Person",
        location: { address: "Test Address" },
        socials: [],
      };

      mockRepo.create.mockReturnValue(Promise.resolve(mockResult));

      const result = await personalService.create(inputData);

      expect(mockRepo.create).toHaveBeenCalledWith(inputData);
      expect(result).toEqual(mockResult);
    });

    test("should throw BadRequestError when creation fails", async () => {
      const inputData = {
        basic: { name: "Test Person" },
        location: { address: "Test Address" },
        socials: [],
      };

      mockRepo.create.mockReturnValue(Promise.resolve(null));

      try {
        await personalService.create(inputData);
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestError);
        expect(error.message).toContain("failed to create the record");
      }

      expect(mockRepo.create).toHaveBeenCalledWith(inputData);
    });
  });

  describe("update", () => {
    test("should update and return the updated personal record", async () => {
      const id = 1;
      const updateData = {
        basic: { name: "Updated Person" },
      };
      const existingData = { id: 1, name: "Test Person" };
      const updatedData = { id: 1, name: "Updated Person" };

      mockRepo.getById.mockReturnValue(Promise.resolve(existingData));
      mockRepo.update.mockReturnValue(Promise.resolve(updatedData));

      const result = await personalService.update(id, updateData);

      expect(mockRepo.getById).toHaveBeenCalledWith(id);
      expect(mockRepo.update).toHaveBeenCalledWith(id, updateData);
      expect(result).toEqual(updatedData);
    });

    test("should throw NotFoundError when record to update doesn't exist", async () => {
      const id = 999;
      const updateData = { basic: { name: "Updated Person" } };

      mockRepo.getById.mockReturnValue(Promise.resolve(null));

      try {
        await personalService.update(id, updateData);
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect(error.message).toContain(`personal ID ${id} not found`);
      }

      expect(mockRepo.getById).toHaveBeenCalledWith(id);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    test("should throw BadRequestError when update fails", async () => {
      const id = 1;
      const updateData = { basic: { name: "Updated Person" } };
      const existingData = { id: 1, name: "Test Person" };

      mockRepo.getById.mockReturnValue(Promise.resolve(existingData));
      mockRepo.update.mockReturnValue(Promise.resolve(null));

      try {
        await personalService.update(id, updateData);
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestError);
        expect(error.message).toContain(`failed to update: ID ${id}`);
      }

      expect(mockRepo.getById).toHaveBeenCalledWith(id);
      expect(mockRepo.update).toHaveBeenCalledWith(id, updateData);
    });
  });

  describe("delete", () => {
    test("should delete a personal record when it exists", async () => {
      const id = 1;
      const existingData = { id: 1, name: "Test Person" };

      mockRepo.getById.mockReturnValue(Promise.resolve(existingData));
      mockRepo.delete.mockReturnValue(Promise.resolve());

      await personalService.delete(id);

      expect(mockRepo.getById).toHaveBeenCalledWith(id);
      expect(mockRepo.delete).toHaveBeenCalledWith(id);
    });

    test("should throw NotFoundError when record to delete doesn't exist", async () => {
      const id = 999;

      mockRepo.getById.mockReturnValue(Promise.resolve(null));

      try {
        await personalService.delete(id);
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect(error.message).toContain(`personal ID ${id} not found`);
      }

      expect(mockRepo.getById).toHaveBeenCalledWith(id);
      expect(mockRepo.delete).not.toHaveBeenCalled();
    });
  });
});
