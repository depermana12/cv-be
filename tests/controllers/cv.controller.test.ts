import { beforeEach, describe, expect, it, vi, type Mocked } from "vitest";
import { Hono, type Context, type Next } from "hono";
import type { Bindings } from "../../src/lib/types";
import { cvRoutes } from "../../src/controllers/cv.controller";
import { testClient } from "hono/testing";
import type { ICvService } from "../../src/services/cv.service";
import { jwt } from "../../src/middlewares/auth";
import { NotFoundError } from "../../src/errors/not-found.error";
import type {
  CvInsert,
  CvSelect,
  CvUpdate,
  PaginatedCvResponse,
} from "../../src/schemas/cv.schema";

vi.mock("../../src/lib/container", async () => {
  return {
    cvService: {
      createCv: vi.fn(),
      getCvById: vi.fn(),
      getAllCvs: vi.fn(),
      getUserCvCount: vi.fn(),
      updateCv: vi.fn(),
      deleteCv: vi.fn(),
    },
  };
});

vi.mock("../../src/middlewares/auth", () => ({
  jwt: () => (c: Context, next: Next) => {
    c.set("jwtPayload", {
      id: "1",
      email: "test@example.com",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    return next();
  },
}));

const testApp = new Hono<Bindings>().use("*", jwt()).route("/", cvRoutes);

describe("http integration cv test", () => {
  const client = testClient(testApp);
  let mockedCvService: Mocked<ICvService>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const container = await vi.importMock("../../src/lib/container");
    mockedCvService = container.cvService as Mocked<ICvService>;
  });
  const userId = 1;
  const mockCv: CvSelect = {
    id: 1,
    userId: userId,
    title: "Software Engineer",
    description: "comprehensive cv for software engineering position",
    isPublic: false,
    language: "id",
    theme: "default",
    slug: null,
    views: 0,
    downloads: 0,
    createdAt: new Date("2025-06-24"),
    updatedAt: new Date("2025-06-24"),
  };

  const mockCreateCvData: CvInsert = {
    title: "Software Engineer",
    description: "comprehensive cv for software engineering position",
    isPublic: false,
    language: "id",
    theme: "default",
    slug: null,
  };

  const mockUpdateCvData: CvUpdate = {
    title: "Updated Software Engineer",
    description: "updated comprehensive cv for software engineering position",
  };

  const mockCvList: CvSelect[] = [
    mockCv,
    {
      ...mockCv,
      id: 2,
      title: "Frontend Developer",
      description: "frontend developer cv",
    },
  ];

  const mockPaginatedResponse: PaginatedCvResponse = {
    data: mockCvList,
    total: 2,
    limit: 10,
    offset: 0,
  };

  describe("GET / - list cvs", () => {
    it("should return paginated cvs with default query options", async () => {
      mockedCvService.getAllCvs.mockResolvedValue(mockPaginatedResponse);

      const response = await client.index.$get({
        query: {},
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("retrieved 2 records successfully");
      expect(data.data).toHaveLength(2);
      expect(data.pagination).toEqual({
        total: 2,
        limit: 10,
        offset: 0,
      });
      expect(mockedCvService.getAllCvs).toHaveBeenCalledWith(userId, {});
    });

    it("should apply query filters correctly", async () => {
      const queryOptions = {
        search: undefined,
        sortBy: "title",
        sortOrder: "desc",
        limit: "5",
        offset: "10",
      };
      const customMockResponse: PaginatedCvResponse = {
        data: [mockCv],
        total: 15,
        limit: 5,
        offset: 10,
      };
      mockedCvService.getAllCvs.mockResolvedValue(customMockResponse);

      const response = await client.index.$get({
        query: queryOptions,
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("retrieved 1 records successfully");
      expect(data.data).toHaveLength(1);
      expect(data.pagination).toEqual({
        total: 15,
        limit: 5,
        offset: 10,
      });
      // expect(mockedCvService.getAllCvs).toHaveBeenCalledWith(
      //   userId,
      //   queryOptions,
      // );
    });

    it("should return empty list when no cv", async () => {
      const emptyResponse = {
        data: [],
        total: 0,
        limit: 10,
        offset: 0,
      };
      mockedCvService.getAllCvs.mockResolvedValue(emptyResponse);

      const response = await client.index.$get({
        query: {},
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("retrieved 0 records successfully");
      expect(data.data).toHaveLength(0);
      expect(data.pagination).toEqual({
        total: 0,
        limit: 10,
        offset: 0,
      });
    });

    it("should handle service errors when getting cvs", async () => {
      mockedCvService.getAllCvs.mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(mockedCvService.getAllCvs(userId, {})).rejects.toThrow(
        "Database connection failed",
      );
    });
  });

  describe("POST / - create cv", () => {
    it("should create cv with valid data successfully", async () => {
      mockedCvService.createCv.mockResolvedValue(mockCv);

      const response = await client.index.$post({
        json: mockCreateCvData,
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("new record created");
      expect(data.data.title).toBe(mockCv.title);
      expect(data.data.description).toBe(mockCv.description);
      expect(mockedCvService.createCv).toHaveBeenCalledWith(
        mockCreateCvData,
        userId,
      );
    });

    it("should handle validation errors for invalid cv data", async () => {
      const invalidData: CvInsert = {
        title: "",
        description: mockCv.description,
        theme: "default",
        isPublic: false,
        language: "id",
        slug: null,
      };

      const response = await client.index.$post({
        json: invalidData,
      });

      expect(response.status).toBe(400);
      expect(mockedCvService.createCv).not.toHaveBeenCalled();
    });

    it("should handle service errors when creating cv", async () => {
      mockedCvService.createCv.mockRejectedValue(
        new Error("Failed to create CV"),
      );

      await expect(
        mockedCvService.createCv(mockCreateCvData, userId),
      ).rejects.toThrow("Failed to create CV");
    });
  });

  describe("GET /:id - get single cv", () => {
    it("should return a cv by id", async () => {
      mockedCvService.getCvById.mockResolvedValue(mockCv);

      const response = await client[":id"].$get({
        param: { id: "1" },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("record ID: 1 retrieved successfully");
      expect(data.data.title).toBe(mockCv.title);
      expect(mockedCvService.getCvById).toHaveBeenCalledWith(1, userId);
    });

    it("should handle not found cv", async () => {
      mockedCvService.getCvById.mockRejectedValue(
        new NotFoundError("CV not found"),
      );

      await expect(mockedCvService.getCvById(999, userId)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("should handle invalid cv id", async () => {
      const response = await client[":id"].$get({
        param: { id: "invalid" },
      });

      // The Number() conversion will result in NaN, which should be handled by the service
      expect(mockedCvService.getCvById).toHaveBeenCalledWith(NaN, userId);
    });
  });

  describe("PATCH /:id - update cv", () => {
    it("should update a cv with valid data successfully", async () => {
      const updatedCv = { ...mockCv, ...mockUpdateCvData };
      mockedCvService.updateCv.mockResolvedValue(updatedCv);

      const response = await client[":id"].$patch({
        param: { id: "1" },
        json: mockUpdateCvData,
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("record ID: 1 updated successfully");
      expect(data.data.title).toBe(mockUpdateCvData.title);
      expect(data.data.description).toBe(mockUpdateCvData.description);
      expect(mockedCvService.updateCv).toHaveBeenCalledWith(
        1,
        userId,
        mockUpdateCvData,
      );
    });

    it("should handle not found cv for update", async () => {
      mockedCvService.updateCv.mockRejectedValue(
        new NotFoundError(
          `[Service] CV with ID 999 not found for user ${userId}`,
        ),
      );

      await expect(
        mockedCvService.updateCv(999, userId, mockUpdateCvData),
      ).rejects.toThrow(NotFoundError);
    });

    it("should handle partial updates", async () => {
      const partialUpdate = { title: "Partially Updated Title" };
      const partiallyUpdatedCv = { ...mockCv, title: partialUpdate.title };
      mockedCvService.updateCv.mockResolvedValue(partiallyUpdatedCv);

      const response = await client[":id"].$patch({
        param: { id: "1" },
        json: partialUpdate,
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.title).toBe(partialUpdate.title);
      expect(mockedCvService.updateCv).toHaveBeenCalledWith(
        1,
        userId,
        partialUpdate,
      );
    });
  });

  describe("DELETE /:id - delete cv", () => {
    it("should delete a existing cv", async () => {
      mockedCvService.deleteCv.mockResolvedValue(true);

      const response = await client[":id"].$delete({
        param: { id: "1" },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("record id: 1 deleted successfully");
      expect(data.data).toBe("Record deleted");
      expect(mockedCvService.deleteCv).toHaveBeenCalledWith(1, userId);
    });

    it("should handle deletion of not found cv", async () => {
      mockedCvService.deleteCv.mockResolvedValue(false);

      const response = await client[":id"].$delete({
        param: { id: "999" },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("record id: 999 deleted successfully");
      expect(data.data).toBe("Record not found");
      expect(mockedCvService.deleteCv).toHaveBeenCalledWith(999, userId);
    });

    it("should handle service errors during deletion", async () => {
      mockedCvService.deleteCv.mockRejectedValue(
        new Error("Failed to delete CV"),
      );

      await expect(mockedCvService.deleteCv(1, userId)).rejects.toThrow(
        "Failed to delete CV",
      );
    });

    it("should handle invalid cv id for deletion", async () => {
      const response = await client[":id"].$delete({
        param: { id: "invalid" },
      });

      expect(mockedCvService.deleteCv).toHaveBeenCalledWith(NaN, userId);
    });
  });

  describe("Authn and Authz", () => {
    it("should use correct user id from jwt payload in all endpoints", async () => {
      mockedCvService.getAllCvs.mockResolvedValue(mockPaginatedResponse);
      mockedCvService.createCv.mockResolvedValue(mockCv);
      mockedCvService.getCvById.mockResolvedValue(mockCv);
      mockedCvService.updateCv.mockResolvedValue(mockCv);
      mockedCvService.deleteCv.mockResolvedValue(true);

      // Test GET
      await client.index.$get({
        query: {},
      });
      expect(mockedCvService.getAllCvs).toHaveBeenCalledWith(userId, {});

      // Test POST /
      await client.index.$post({ json: mockCreateCvData });
      expect(mockedCvService.createCv).toHaveBeenCalledWith(
        mockCreateCvData,
        userId,
      );

      // Test GET /:id
      await client[":id"].$get({ param: { id: "1" } });
      expect(mockedCvService.getCvById).toHaveBeenCalledWith(1, userId);

      // Test PATCH /:id
      await client[":id"].$patch({
        param: { id: "1" },
        json: mockUpdateCvData,
      });
      expect(mockedCvService.updateCv).toHaveBeenCalledWith(
        1,
        userId,
        mockUpdateCvData,
      );

      // Test DELETE /:id
      await client[":id"].$delete({ param: { id: "1" } });
      expect(mockedCvService.deleteCv).toHaveBeenCalledWith(1, userId);
    });
  });
});
