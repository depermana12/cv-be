import { test, it, expect, beforeEach, describe } from "bun:test";
import { Education } from "../src/services/education.service";
import { NotFoundError } from "../src/errors/not-found.error";

const mockEdu = [
  {
    id: 1,
    personalId: 1,
    institution: "University of Jakarta",
    degree: "Bachelor of Engineering",
    fieldOfStudy: "Electrical Engineering",
    startDate: new Date("2015-08-01T00:00:00.000Z"),
    endDate: new Date("2019-06-30T00:00:00.000Z"),
    gpa: "3.75",
    url: "https://univ-jkt.ac.id",
  },
  {
    id: 2,
    personalId: 1,
    institution: "Harvard University",
    degree: "Master of Science",
    fieldOfStudy: "Computer Science",
    startDate: new Date("2026-09-01T00:00:00.000Z"),
    endDate: new Date("2029-06-30T00:00:00.000Z"),
    gpa: "4.0",
    url: "https://harvard.edu",
  },
];

let mockRepo: any;

describe("Education Service", () => {
  let education: Education;

  beforeEach(() => {
    mockRepo = {
      getAll: () => Promise.resolve(mockEdu),
      getById: (id: number) => {
        const found = mockEdu.find((p) => p.id === id);
        if (found) {
          return Promise.resolve(found);
        }
        return Promise.reject(
          new NotFoundError(`cannot get: id ${id} not found`),
        );
      },
      create: () => Promise.resolve(mockEdu[0]),
      update: () => Promise.resolve({ ...mockEdu[0], fullName: "updated" }),
      delete: () => Promise.resolve({ success: true }),
    };

    education = new Education(mockRepo);
  });
  describe("getAll", () => {
    it("should return all education records", async () => {
      const result = await education.getAll();
      expect(result).toEqual(mockEdu);
      expect(result.length).toBe(2);
    });
  });

  test("getById should return education record by id", async () => {
    const result = await education.getById(1);
    expect(result).toEqual(mockEdu[0]);
  });

  test("getById should throw error for non-existent id", async () => {
    expect(education.getById(999)).rejects.toThrow(
      "cannot get: id 999 not found",
    );
  });
});
