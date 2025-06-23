import { describe, it, expect, vi, beforeEach, type Mocked } from "vitest";
import { testClient } from "hono/testing";
import { Hono } from "hono";
import { userRoutes } from "../../src/controllers/user.controller";
import type { IUserService } from "../../src/services/user.service";
import type { AuthUserSafe } from "../../src/db/types/auth.type";
import { NotFoundError } from "../../src/errors/not-found.error";

vi.mock("../../src/lib/container", async () => {
  return {
    userService: {
      getUserByIdSafe: vi.fn(),
      getUserByEmail: vi.fn(),
      getUserByEmailSafe: vi.fn(),
      updateUserProfile: vi.fn(),
      isUserEmailVerified: vi.fn(),
      isUsernameExists: vi.fn(),
      getUserStats: vi.fn(),
    },
  };
});

const testApp = new Hono()
  .use("*", (c, next) => {
    c.set("jwtPayload", {
      id: "1",
      email: "test@email.com",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    return next();
  })
  .route("/", userRoutes);

describe("http integration", () => {
  const client = testClient(testApp);

  let mockedUserService: Mocked<IUserService>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const container = await vi.importMock("../../src/lib/container");
    mockedUserService = container.userService as Mocked<IUserService>;
  });

  const userId = 1;
  const mockUser: AuthUserSafe = {
    id: userId,
    email: "test@email.com",
    firstName: "joni",
    lastName: "knalpot",
    username: "joniknalpot",
    isEmailVerified: true,
    profileImage: "imageurlofknalpotracing",
    gender: "male",
    birthDate: new Date("2013-03-08"),
    createdAt: new Date("2025-06-23"),
    updatedAt: new Date("2025-06-23"),
  };

  const mockStats = {
    user: mockUser,
    accountAge: 365, // days
    isEmailVerified: true,
    cvCreated: 3,
    totalJobApplications: 15,
  };

  describe("GET /me", () => {
    it("should return current user profile", async () => {
      mockedUserService.getUserByIdSafe.mockResolvedValue(mockUser);

      const response = await client.me.$get();

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("it's me");
      // expect(data.data).toEqual(mockUser); fix later, the expected date is date but it serialize
      expect(mockedUserService.getUserByIdSafe).toHaveBeenCalledWith(1);
    });

    it("should handle service errors", async () => {
      mockedUserService.getUserByIdSafe.mockRejectedValue(
        new NotFoundError("user record not found"),
      );

      await expect(mockedUserService.getUserByIdSafe(999)).rejects.toThrow(
        NotFoundError,
      );
    });
  });
  describe("GET /me/stats", () => {
    it("should return user statistics", async () => {
      mockedUserService.getUserStats.mockResolvedValue(mockStats);

      const response = await client.me.stats.$get();

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("user statistics retrieved");
      // expect(data.data).toEqual(mockStats); same, the date got serialize
      expect(data.data.user.email).toBe("test@email.com");
      expect(data.data.accountAge).toBe(365);
      expect(data.data.isEmailVerified).toBe(true);
      expect(data.data.cvCreated).toBe(3);
      expect(data.data.totalJobApplications).toBe(15);
      expect(mockedUserService.getUserStats).toHaveBeenCalledWith(1);
    });

    it("should handle new user with no CVs", async () => {
      const newUserStats = {
        user: {
          ...mockUser,
          id: 2,
          firstName: "jane",
          lastName: "dagguise",
          username: "janda",
          email: "jandablonde@email.com",
        },
        accountAge: 0,
        isEmailVerified: false,
        cvCreated: 0,
      };
      mockedUserService.getUserStats.mockResolvedValue(newUserStats);

      const response = await client.me.stats.$get();

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.user.email).toBe("jandablonde@email.com");
      expect(data.data.accountAge).toBe(0);
      expect(data.data.isEmailVerified).toBe(false);
      expect(data.data.cvCreated).toBe(0);
      expect(data.data.totalJobApplications).toBeUndefined();
    });
  });

  describe("PATCH /me", () => {
    it("should update user profile successfully", async () => {
      const updateData = {
        firstName: "jane",
        lastName: "senior",
        username: "janesr",
      };
      const updatedUser = {
        ...mockUser,
        ...updateData,
      };
      mockedUserService.updateUserProfile.mockResolvedValue(updatedUser);

      const response = await client.me.$patch({
        json: updateData,
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("user profile updated successfully");
      expect(data.data.firstName).toBe("jane");
      expect(data.data.lastName).toBe("senior");
      expect(mockedUserService.updateUserProfile).toHaveBeenCalledWith(1, {
        firstName: "jane",
        lastName: "senior",
      });
    });
    it("should validate update data", async () => {
      const invalidData = {
        firstName: "",
      };
      mockedUserService.updateUserProfile.mockRejectedValue(
        new Error("Validation failed"),
      );

      const response = await client.me.$patch({
        json: invalidData,
      });

      expect(response.status).toBe(500);
    });
  });

  describe("GET /check-username/:username", () => {
    it("should return available if not exist", async () => {
      const username = "newuser";
      mockedUserService.isUsernameExists.mockResolvedValue(false);

      const response = await client["check-username"][":username"].$get({
        param: { username },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("username availability checked");
      expect(data.data.username).toBe(username);
      expect(data.data.available).toBe(true);
      expect(data.data.exists).toBe(false);
      expect(mockedUserService.isUsernameExists).toHaveBeenCalledWith(username);
    });

    it("should return unavailable if exist", async () => {
      const username = "existinguser";
      mockedUserService.isUsernameExists.mockResolvedValue(true);

      const response = await client["check-username"][":username"].$get({
        param: { username },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.username).toBe(username);
      expect(data.data.available).toBe(false);
      expect(data.data.exists).toBe(true);
    });
  });

  describe("GET /me/email-verification-status", () => {
    it("should return verified", async () => {
      mockedUserService.isUserEmailVerified.mockResolvedValue({
        verified: true,
      });

      const response = await client.me["email-verification-status"].$get();

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("email verification status retrieved");
      expect(data.data).toEqual({ verified: true });
      expect(mockedUserService.isUserEmailVerified).toHaveBeenCalledWith(1);
    });

    it("should return unverified", async () => {
      mockedUserService.isUserEmailVerified.mockResolvedValue({
        verified: false,
      });

      const response = await client.me["email-verification-status"].$get();

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toEqual({ verified: false });
    });
  });
});
