import { describe, test, beforeEach, expect, mock } from "bun:test";
import { EducationService } from "../src/services/education.service";
import { NotFoundError } from "../src/errors/not-found.error";
import { DataBaseError } from "../src/errors/database.error";
import { BadRequestError } from "../src/errors/bad-request.error";

// next please make repository create to not returning getById

const mockEducationRecords = [
  {
    id: 1,
    personalId: 1,
    institution: "UNJ",
    degree: "Bachelor's",
    fieldOfStudy: "EE",
    gpa: "3.22",
  },
  {
    id: 2,
    personalId: 1,
    institution: "UI",
    degree: "Master's",
    fieldOfStudy: "EE",
    gpa: "3.55",
  },
];

const mockRepository = {
  getAll: mock(() => Promise.resolve([...mockEducationRecords])),
  getById: mock((id: number) => {
    const record = mockEducationRecords.find((edu) => edu.id === id);
    return Promise.resolve(record || null);
  }),
  create: mock((data: any) =>
    Promise.resolve({
      id: 3,
      personalId: data.personalId,
      institution: data.institution,
      degree: data.degree,
      fieldOfStudy: data.fieldOfStudy,
      gpa: data.gpa,
    }),
  ),
  update: mock((id: number, data: any) => {
    const existingRecord = mockEducationRecords.find((edu) => edu.id === id);
    if (!existingRecord)
      throw new NotFoundError(`cannot update: ${id} not found`);

    return Promise.resolve({
      ...existingRecord,
      ...data,
    });
  }),
  delete: mock((id: number) => {
    const recordExists = mockEducationRecords.some((r) => r.id === id);
    return Promise.resolve(recordExists);
  }),
  exists: mock((id: number) => {
    const recordExists = mockEducationRecords.some((r) => r.id === id);
    return Promise.resolve(recordExists);
  }),
};

let educationService: EducationService;

beforeEach(() => {
  mockRepository.getAll.mockClear();
  mockRepository.getById.mockClear();
  mockRepository.create.mockClear();
  mockRepository.update.mockClear();
  mockRepository.delete.mockClear();
  mockRepository.exists.mockClear();
  educationService = new EducationService(mockRepository as any);
});

describe("Education Service", () => {
  describe("getAll method", () => {
    test("should return all education records", async () => {
      const records = await educationService.getAll();

      expect(records.length).toBe(2);
      expect(records[0].institution).toBe("UNJ");
    });

    test("should return empty array when no records exist", async () => {
      mockRepository.getAll.mockResolvedValueOnce([]);

      const records = await educationService.getAll();

      expect(records).toBeArray();
      expect(records.length).toBe(0);
    });

    test("should handle repository errors", async () => {
      mockRepository.getAll.mockRejectedValueOnce(new Error("Database error"));

      await expect(educationService.getAll()).rejects.toThrow("Database error");
    });
  });

  describe("getById method", () => {
    test("should return an education record by id", async () => {
      const record = await educationService.getById(1);

      expect(record).toBeTruthy();
      expect(record.institution).toBe("UNJ");
    });

    test("should throw error if record by id is not found", async () => {
      await expect(educationService.getById(99)).rejects.toThrow(NotFoundError);
      await expect(educationService.getById(99)).rejects.toThrowError(
        "cannot get: 99 not found",
      );
    });

    test("should throw if database got stolen", async () => {
      mockRepository.getById.mockImplementationOnce(() => {
        throw new DataBaseError("Database connection failed");
      });
      await expect(educationService.getById(1)).rejects.toThrow(
        "Database connection failed",
      );
    });
  });

  describe("create method", () => {
    test("should create a record and returning", async () => {
      const eduData = {
        personalId: 1,
        institution: "UI",
        degree: "Master's",
        fieldOfStudy: "EE",
        gpa: "3.55",
      };

      mockRepository.create.mockImplementationOnce((data) =>
        Promise.resolve({
          id: 3,
          ...data,
        }),
      );

      mockRepository.getById.mockImplementationOnce((id) => {
        if (id === 3) {
          return Promise.resolve({
            id: 3,
            ...eduData,
          });
        }
        return Promise.resolve(null);
      });

      const result = await educationService.create(eduData);

      expect(result.id).toBe(3);
      expect(result.institution).toBe("UI");
      expect(result.degree).toBe("Master's");
      expect(mockRepository.create).toHaveBeenCalledWith(eduData);
    });

    test("should handle creation error", async () => {
      mockRepository.create.mockRejectedValueOnce(
        new BadRequestError("failed to create the record"),
      );

      const eduData = {
        personalId: 1,
        institution: "UI",
        degree: "Master's",
        fieldOfStudy: "EE",
        gpa: "3.55",
      };

      expect(educationService.create(eduData)).rejects.toThrow(BadRequestError);
    });
  });
  describe("update method", () => {
    test("should update an existing record", async () => {
      const updateData = {
        institution: "MIT",
        degree: "PhD",
        fieldOfStudy: "CS",
        gpa: "3.8",
      };

      const updated = await educationService.update(1, updateData);
      expect(updated.institution).toBe("MIT");
      expect(updated.degree).toBe("PhD");
      expect(mockRepository.update).toHaveBeenCalledWith(1, updateData);
    });

    test("should throw when want to updating non existing record", async () => {
      const updatedData = {
        fieldOfStudy: "Bussiness",
      };
      await expect(educationService.update(99, updatedData)).rejects.toThrow(
        NotFoundError,
      );
      await expect(educationService.update(99, updatedData)).rejects.toThrow(
        "cannot update: 99 not found",
      );
    });

    test("should handle partial updates", async () => {
      const partialUpdate = {
        gpa: "3.9",
      };
      const result = await educationService.update(1, partialUpdate);
      expect(result.gpa).toBe("3.9");
      expect(result.institution).toBe("UNJ");
    });
  });
  describe("delete method", () => {
    test("should delete and existing record", async () => {
      const deleted = await educationService.delete(1);

      expect(deleted).toBeTruthy();
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    test("should throw an error if not existing", async () => {
      expect(educationService.delete(69)).rejects.toThrow(NotFoundError);
      expect(educationService.delete(69)).rejects.toThrow(
        "cannot delete: 69 not found",
      );
    });
    test("should handle repository deletion errors", async () => {
      mockRepository.delete.mockRejectedValueOnce(new Error("Delete failed"));
      await expect(educationService.delete(1)).rejects.toThrow("Delete failed");
    });
  });
  describe("exists method", () => {
    test("should return true for existing record", async () => {
      const result = await educationService.exists(1);
      expect(result).toBe(true);
      expect(mockRepository.exists).toHaveBeenCalledWith(1);
    });

    test("should return false for non-existent record", async () => {
      mockRepository.exists.mockResolvedValueOnce(false);
      const result = await educationService.exists(999);
      expect(result).toBe(false);
    });

    test("should handle repository errors", async () => {
      mockRepository.exists.mockRejectedValueOnce(
        new Error("Exists check failed"),
      );
      await expect(educationService.exists(1)).rejects.toThrow(
        "Exists check failed",
      );
    });
  });
});
