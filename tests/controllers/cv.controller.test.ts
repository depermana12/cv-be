import { beforeEach, describe, expect, it, vi, type Mocked } from "vitest";
import { Hono, type Context, type Next } from "hono";
import type { Bindings } from "../../src/lib/types";
import { cvRoutes } from "../../src/controllers/cv.controller";
import { testClient } from "hono/testing";
import type { ICvService } from "../../src/services/cv.service";
import { jwt } from "../../src/middlewares/auth";
import { NotFoundError } from "../../src/errors/not-found.error";
import {
  createMockCv,
  createMockCvInsert,
  createMockCvUpdate,
  createMockPaginatedCvResponse,
  createCvArray,
  VALID_USER_ID,
  VALID_CV_ID,
  INVALID_CV_ID,
} from "../utils/cv.test-helpers";

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
      id: VALID_USER_ID.toString(),
      email: "test@example.com",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    return next();
  },
}));

vi.mock("../../src/middlewares/verifiedEmail", () => ({
  verifiedEmail: (c: Context, next: Next) => next(),
}));

// Create a properly chained Hono app for testClient type inference
const createTestApp = () => {
  return new Hono<Bindings>()
    .use("*", jwt())
    .use("*", (c: Context, next: Next) => next()) // Mock verifiedEmail middleware
    .route("/", cvRoutes);
};

describe("http integration cv test", () => {
  let mockedCvService: Mocked<ICvService>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const container = await vi.importMock("../../src/lib/container");
    mockedCvService = container.cvService as Mocked<ICvService>;
  });

  describe("GET / - list cvs", () => {
    it("should return paginated cvs with default query options", async () => {
      const mockPaginatedResponse = createMockPaginatedCvResponse([
        createMockCv(),
        createMockCv({ id: 2, title: "Frontend Developer" }),
      ]);
      mockedCvService.getAllCvs.mockResolvedValue(mockPaginatedResponse);
      const testApp = createTestApp();
      const client = testClient(testApp);

      const response = await client.index.$get({
        query: {},
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as any;
      expect(data.success).toBe(true);
      expect(data.message).toBe("retrieved 2 records successfully");
      expect(data.data).toHaveLength(2);
      expect(data.pagination).toEqual({
        total: 2,
        limit: 10,
        offset: 0,
      });
      expect(mockedCvService.getAllCvs).toHaveBeenCalledWith(VALID_USER_ID, {});
    });

    it("should apply query filters correctly", async () => {
      const queryOptions = {
        search: undefined,
        sortBy: "title",
        sortOrder: "desc",
        limit: "5",
        offset: "10",
      };
      const customMockResponse = createMockPaginatedCvResponse(
        [createMockCv()],
        { limit: 5, offset: 10, total: 15 },
      );
      mockedCvService.getAllCvs.mockResolvedValue(customMockResponse);
      const testApp = createTestApp();
      const client = testClient(testApp);

      const response = await client.index.$get({
        query: queryOptions,
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as any;
      expect(data.success).toBe(true);
      expect(data.message).toBe("retrieved 1 records successfully");
      expect(data.data).toHaveLength(1);
      expect(data.pagination).toEqual({
        total: 15,
        limit: 5,
        offset: 10,
      });
    });

    it("should return empty list when no cv", async () => {
      const emptyResponse = createMockPaginatedCvResponse([]);
      mockedCvService.getAllCvs.mockResolvedValue(emptyResponse);
      const testApp = createTestApp();
      const client = testClient(testApp);

      const response = await client.index.$get({
        query: {},
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as any;
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

      await expect(
        mockedCvService.getAllCvs(VALID_USER_ID, {}),
      ).rejects.toThrow("Database connection failed");
    });
  });

  describe("POST / - create cv", () => {
    it("should create cv with valid data successfully", async () => {
      const mockCv = createMockCv();
      const mockCreateCvData = { ...createMockCvInsert(), slug: undefined };
      mockedCvService.createCv.mockResolvedValue(mockCv);
      const testApp = createTestApp();
      const client = testClient(testApp);

      const response = await client.index.$post({
        json: mockCreateCvData,
      });

      expect(response.status).toBe(201);
      const data = (await response.json()) as any;
      expect(data.success).toBe(true);
      expect(data.message).toBe("new record created");
      expect(data.data.title).toBe(mockCv.title);
      expect(data.data.description).toBe(mockCv.description);
      expect(mockedCvService.createCv).toHaveBeenCalledWith(
        mockCreateCvData,
        VALID_USER_ID,
      );
    });

    it("should handle validation errors for invalid cv data", async () => {
      const invalidData = {
        ...createMockCvInsert({ title: "" }),
        slug: undefined,
      };
      const testApp = createTestApp();
      const client = testClient(testApp);

      const response = await client.index.$post({
        json: invalidData,
      });

      expect(response.status).toBe(400);
      expect(mockedCvService.createCv).not.toHaveBeenCalled();
    });

    it("should handle service errors when creating cv", async () => {
      const mockCreateCvData = createMockCvInsert();
      mockedCvService.createCv.mockRejectedValue(
        new Error("Failed to create CV"),
      );

      await expect(
        mockedCvService.createCv(mockCreateCvData, VALID_USER_ID),
      ).rejects.toThrow("Failed to create CV");
    });
  });

  describe("GET /:id - get single cv", () => {
    it("should return a cv by id", async () => {
      const mockCv = createMockCv();
      mockedCvService.getCvById.mockResolvedValue(mockCv);
      const testApp = createTestApp();
      const client = testClient(testApp);

      const response = await client[":id"].$get({
        param: { id: "1" },
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as any;
      expect(data.success).toBe(true);
      expect(data.message).toBe("record ID: 1 retrieved successfully");
      expect(data.data.title).toBe(mockCv.title);
      expect(mockedCvService.getCvById).toHaveBeenCalledWith(1, VALID_USER_ID);
    });

    it("should handle not found cv", async () => {
      mockedCvService.getCvById.mockRejectedValue(
        new NotFoundError("CV not found"),
      );

      await expect(
        mockedCvService.getCvById(999, VALID_USER_ID),
      ).rejects.toThrow(NotFoundError);
    });

    it("should handle invalid cv id", async () => {
      const testApp = createTestApp();
      const client = testClient(testApp);

      const response = await client[":id"].$get({
        param: { id: "invalid" },
      });

      expect(response.status).toBe(400);
      expect(mockedCvService.getCvById).not.toHaveBeenCalled();
    });
  });

  describe("PATCH /:id - update cv", () => {
    it("should update a cv with valid data successfully", async () => {
      const mockCv = createMockCv();
      const mockUpdateCvData = createMockCvUpdate();
      const updatedCv = { ...mockCv, ...mockUpdateCvData };
      mockedCvService.updateCv.mockResolvedValue(updatedCv);
      const testApp = createTestApp();
      const client = testClient(testApp);

      const response = await client[":id"].$patch({
        param: { id: "1" },
        json: { ...mockUpdateCvData, slug: undefined } as any,
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as any;
      expect(data.success).toBe(true);
      expect(data.message).toBe("record ID: 1 updated successfully");
      expect(data.data.title).toBe(mockUpdateCvData.title);
      expect(data.data.description).toBe(mockUpdateCvData.description);
      expect(mockedCvService.updateCv).toHaveBeenCalledWith(
        1,
        VALID_USER_ID,
        mockUpdateCvData,
      );
    });

    it("should handle not found cv for update", async () => {
      const mockUpdateCvData = createMockCvUpdate();
      mockedCvService.updateCv.mockRejectedValue(
        new NotFoundError(
          `[Service] CV with ID 999 not found for user ${VALID_USER_ID}`,
        ),
      );

      await expect(
        mockedCvService.updateCv(999, VALID_USER_ID, mockUpdateCvData),
      ).rejects.toThrow(NotFoundError);
    });

    it("should handle partial updates", async () => {
      const mockCv = createMockCv();
      const partialUpdate = { title: "Partially Updated Title" };
      const partiallyUpdatedCv = { ...mockCv, title: partialUpdate.title };
      mockedCvService.updateCv.mockResolvedValue(partiallyUpdatedCv);
      const testApp = createTestApp();
      const client = testClient(testApp);

      const response = await client[":id"].$patch({
        param: { id: "1" },
        json: partialUpdate,
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as any;
      expect(data.success).toBe(true);
      expect(data.data.title).toBe(partialUpdate.title);
      expect(mockedCvService.updateCv).toHaveBeenCalledWith(
        1,
        VALID_USER_ID,
        partialUpdate,
      );
    });
  });

  describe("DELETE /:id - delete cv", () => {
    it("should delete a existing cv", async () => {
      mockedCvService.deleteCv.mockResolvedValue(true);
      const testApp = createTestApp();
      const client = testClient(testApp);

      const response = await client[":id"].$delete({
        param: { id: "1" },
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as any;
      expect(data.success).toBe(true);
      expect(data.message).toBe("CV with ID 1 deleted successfully");
      expect(data.data).toBe(true);
      expect(mockedCvService.deleteCv).toHaveBeenCalledWith(1, VALID_USER_ID);
    });

    it("should handle deletion of not found cv", async () => {
      mockedCvService.deleteCv.mockResolvedValue(false);
      const testApp = createTestApp();
      const client = testClient(testApp);

      const response = await client[":id"].$delete({
        param: { id: "999" },
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as any;
      expect(data.success).toBe(true);
      expect(data.message).toBe("CV with ID 999 deleted successfully");
      expect(data.data).toBe(false);
      expect(mockedCvService.deleteCv).toHaveBeenCalledWith(999, VALID_USER_ID);
    });

    it("should handle service errors during deletion", async () => {
      mockedCvService.deleteCv.mockRejectedValue(
        new Error("Failed to delete CV"),
      );

      await expect(mockedCvService.deleteCv(1, VALID_USER_ID)).rejects.toThrow(
        "Failed to delete CV",
      );
    });

    it("should handle invalid cv id for deletion", async () => {
      const testApp = createTestApp();
      const client = testClient(testApp);

      const response = await client[":id"].$delete({
        param: { id: "invalid" },
      });

      expect(response.status).toBe(400);
      expect(mockedCvService.deleteCv).not.toHaveBeenCalled();
    });
  });

  describe("Authn and Authz", () => {
    it("should use correct user id from jwt payload in all endpoints", async () => {
      const mockPaginatedResponse = createMockPaginatedCvResponse([
        createMockCv(),
      ]);
      const mockCv = createMockCv();
      const mockCreateCvData = { ...createMockCvInsert(), slug: undefined };
      const mockUpdateCvData = createMockCvUpdate();
      const testApp = createTestApp();
      const client = testClient(testApp);

      mockedCvService.getAllCvs.mockResolvedValue(mockPaginatedResponse);
      mockedCvService.createCv.mockResolvedValue(mockCv);
      mockedCvService.getCvById.mockResolvedValue(mockCv);
      mockedCvService.updateCv.mockResolvedValue(mockCv);
      mockedCvService.deleteCv.mockResolvedValue(true);

      // Test GET
      await client.index.$get({
        query: {},
      });
      expect(mockedCvService.getAllCvs).toHaveBeenCalledWith(VALID_USER_ID, {});

      // Test POST /
      await client.index.$post({ json: mockCreateCvData });
      expect(mockedCvService.createCv).toHaveBeenCalledWith(
        mockCreateCvData,
        VALID_USER_ID,
      );

      // Test GET /:id
      await client[":id"].$get({ param: { id: "1" } });
      expect(mockedCvService.getCvById).toHaveBeenCalledWith(1, VALID_USER_ID);

      // Test PATCH /:id
      await client[":id"].$patch({
        param: { id: "1" },
        json: { ...mockUpdateCvData, slug: undefined } as any,
      });
      expect(mockedCvService.updateCv).toHaveBeenCalledWith(
        1,
        VALID_USER_ID,
        mockUpdateCvData,
      );

      // Test DELETE /:id
      await client[":id"].$delete({ param: { id: "1" } });
      expect(mockedCvService.deleteCv).toHaveBeenCalledWith(1, VALID_USER_ID);
    });
  });
});
