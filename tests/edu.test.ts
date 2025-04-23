import { describe, test, beforeEach, expect } from "bun:test";
import { EducationService } from "../src/services/education.service";
import { NotFoundError } from "../src/errors/not-found.error";

const mockRepository = {
  getAll: () =>
    Promise.resolve([
      {
        id: 1,
        personalId: 1,
        institution: "UNJ",
        degree: "Bachelor's",
        fieldOfStudy: "EE",
        gpa: 3.22,
      },
    ]),
  getById: (id: number) => {
    if (id === 1) {
      return {
        id: 1,
        personalId: 1,
        institution: "UNJ",
        degree: "Bachelor's",
        fieldOfStudy: "EE",
        gpa: 3.22,
      };
    }
    return null;
  },
  create: (data: any) =>
    Promise.resolve({
      id: 2,
      personalId: 2,
      institution: "UI",
      degree: "Master's",
      fieldOfStudy: "EE",
      gpa: 3.55,
    }),
  update: (id: number, data: any) => {
    if (id === 1) {
      return {
        id: 1,
        personalId: 1,
        ...data,
      };
    }
    throw new NotFoundError("cannot update: ${id} not found");
  },
  delete: (id: number) => Promise.resolve(true),
  exists: (id: number) => Promise.resolve(false),
  getAllByPersonalId: (personalId: number) => Promise.resolve([]),
};

let educationService: EducationService;

beforeEach(() => {
  educationService = new EducationService(mockRepository as any);
});

describe("Education Service", () => {
  test("should return all education records", async () => {
    const records = await educationService.getAll();
    expect(records.length).toBe(1);
    expect(records[0].institution).toBe("UNJ");
  });

  describe("getById method", async () => {
    test("should return an education record by id", async () => {
      const record = await educationService.getById(1);
      expect(record).toBeTruthy();
      expect(record.institution).toBe("UNJ");
    });

    test("should throw error if record by id is not found", async () => {
      await expect(educationService.getById(99)).rejects.toThrowError(
        "cannot get: 99 not found",
      );
    });

    test("should throw if database got stolen", async () => {
      const mockRepo = {
        getById: async (id: number) => {
          throw new Error("Database missing, someone stole my cloud");
        },
      };
      const educationService = new EducationService(mockRepo as any);
      expect(educationService.getById(2)).rejects.toThrowError(
        "Database missing, someone stole my cloud",
      );
    });
  });
});
