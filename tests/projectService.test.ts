import { describe, test, beforeEach, expect, mock } from "bun:test";
import { ProjectService } from "../src/services/project.service";
import { NotFoundError } from "../src/errors/not-found.error";

const mockProjectRecords = [
  {
    id: 1,
    personalId: 1,
    name: "smart home IoT",
    startDate: "2023-01-01",
    endDate: "2023-02-28",
    url: "https://github.com/depermana/iot",
  },
  {
    id: 2,
    personalId: 1,
    name: "cv management",
    startDate: "2025-03-01",
    endDate: "2025-03-31",
    url: "https://github.com/depermana/cv",
  },
];

const mockProjectDescRecords = [
  {
    id: 1,
    projectId: 1,
    description: "smart home IoT",
  },
  {
    id: 2,
    projectId: 2,
    description: "cv management",
  },
  {
    id: 3,
    projectId: 2,
    description: "backend build with bun hono drizzle",
  },
];

const mockProjectRepository = {
  getDescription: mock((id: number) => {
    const record = mockProjectDescRecords.find((desc) => desc.id === id);
    return Promise.resolve(record || null);
  }),
  addDescription: mock((projectId: number, desc: any) => {
    const newRecord = {
      id: mockProjectDescRecords.length + 1,
      projectId,
      ...desc,
    };
    mockProjectDescRecords.push(newRecord);
    return Promise.resolve(newRecord);
  }),
  updateDescription: mock((id: number, newDesc: any) => {
    const index = mockProjectDescRecords.findIndex((desc) => desc.id === id);
    if (index === -1) return Promise.resolve(null);

    const updatedRecord = { ...mockProjectDescRecords[index], ...newDesc };
    mockProjectDescRecords[index] = updatedRecord;
    return Promise.resolve(updatedRecord);
  }),
  deleteProjectCascade: mock((id: number) => {
    const index = mockProjectDescRecords.findIndex((desc) => desc.id === id);
    if (index === -1) return Promise.resolve(false);

    mockProjectDescRecords.splice(index, 1);
    return Promise.resolve(true);
  }),
};

let projectService: ProjectService;

beforeEach(() => {
  mockProjectDescRecords.length = 0;
  mockProjectDescRecords.push(
    {
      id: 1,
      projectId: 1,
      description: "smart home IoT",
    },
    {
      id: 2,
      projectId: 2,
      description: "cv management",
    },
    {
      id: 3,
      projectId: 2,
      description: "backend build with bun hono drizzle",
    },
  );

  mockProjectRepository.getDescription.mockClear();
  mockProjectRepository.addDescription.mockClear();
  mockProjectRepository.updateDescription.mockClear();
  mockProjectRepository.deleteProjectCascade.mockClear();
  projectService = new ProjectService(mockProjectRepository as any);
});

describe("ProjectService", () => {
  describe("getDescription", () => {
    test("should return project description if exists", async () => {
      const result = await projectService.getDescription(1);

      expect(result.description).toBe("smart home IoT");
      expect(mockProjectRepository.getDescription).toHaveBeenCalledWith(1);
    });

    test("should throw NotFoundError if project description does not exist", async () => {
      mockProjectRepository.getDescription.mockResolvedValueOnce(null);

      await expect(projectService.getDescription(999)).rejects.toThrow(
        NotFoundError,
      );
      await expect(projectService.getDescription(999)).rejects.toThrow(
        "cannot get: detail 999 not found",
      );
    });
  });
  describe("add description method", () => {
    test("should add new description and fetch record", async () => {
      const newDescription = {
        description: "new test description",
      };

      const result = await projectService.addDescription(1, newDescription);

      expect(result).toMatchObject({
        id: expect.any(Number),
        projectId: 1,
        description: newDescription.description,
      });
      await expect(mockProjectRepository.addDescription).toHaveBeenCalledWith(
        1,
        newDescription,
      );
    });

    test("should verify data persistence after add operation", async () => {
      const newDescription = { description: "persistence test" };
      const result = await projectService.addDescription(1, newDescription);

      const found = mockProjectDescRecords.find(
        (desc) => desc.id === result.id,
      );
      expect(found).toBeDefined();
      expect(found!.description).toBe("persistence test");
    });

    test("should throw error when repository fails to create record", async () => {
      mockProjectRepository.addDescription.mockResolvedValueOnce(null);

      await expect(
        projectService.addDescription(1, { description: "should fail" }),
      ).rejects.toThrow("failed to create the record.");
    });
  });
  describe("updateDescription", () => {
    test("should successfully update an existing description", async () => {
      const descId = 1;
      const updateData = {
        description: "updated IoT description",
      };

      const result = await projectService.updateDescription(descId, updateData);

      expect(result).toMatchObject({
        id: descId,
        projectId: 1,
        description: updateData.description,
      });
      await expect(mockProjectRepository.getDescription).toHaveBeenCalledWith(
        descId,
      );
      await expect(
        mockProjectRepository.updateDescription,
      ).toHaveBeenCalledWith(descId, updateData);
    });

    test("should throw NotFoundError when updating non-existent description", async () => {
      const nonExistentId = 999;
      const updateData = {
        description: "this should fail",
      };

      await expect(
        projectService.updateDescription(nonExistentId, updateData),
      ).rejects.toThrow(NotFoundError);
      await expect(
        projectService.updateDescription(nonExistentId, updateData),
      ).rejects.toThrow(`cannot update: detail ${nonExistentId} not found`);
    });

    test("should allow partial updates", async () => {
      const descId = 2;
      const partialUpdate = {
        description: "updated CV description",
      };

      const result = await projectService.updateDescription(
        descId,
        partialUpdate,
      );

      expect(result).toMatchObject({
        id: descId,
        projectId: 2,
        description: partialUpdate.description,
      });
    });
  });

  describe("delete", () => {
    test("should successfully delete an existing description", async () => {
      const descId = 1;
      await projectService.delete(descId);

      await expect(mockProjectRepository.getDescription).toHaveBeenCalledWith(
        descId,
      );
      await expect(
        mockProjectRepository.deleteProjectCascade,
      ).toHaveBeenCalledWith(descId);
    });

    test("should throw NotFoundError when deleting non-existent description", async () => {
      const nonExistentId = 999;

      await expect(projectService.delete(nonExistentId)).rejects.toThrow(
        NotFoundError,
      );
      await expect(projectService.delete(nonExistentId)).rejects.toThrow(
        `cannot delete: detail ${nonExistentId} not found`,
      );
    });
  });
});
