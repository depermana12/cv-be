import { describe, it, expect, vi, beforeEach } from "vitest";
import { testClient } from "hono/testing";
import { Hono } from "hono";
import {
  userRoutes,
  userBasicRoutes,
} from "../../src/controllers/user.controller";
import { NotFoundError } from "../../src/errors/not-found.error";
import {
  createMockUser,
  createMockUserStats,
  createMockProfileProgress,
  createMockJwtPayload,
  VALID_USER_ID,
  VALID_EMAIL,
} from "../utils/user.test-helpers";

// Hoist mock the container before any imports
vi.mock("../../src/lib/container", () => ({
  userService: {
    getUserByIdSafe: vi.fn(),
    getUserByEmail: vi.fn(),
    getUserByEmailSafe: vi.fn(),
    updateUserProfile: vi.fn(),
    updateUserEmail: vi.fn(),
    updateUserUsername: vi.fn(),
    updateUserPreferences: vi.fn(),
    updateUserSubscription: vi.fn(),
    isUserEmailVerified: vi.fn(),
    isUsernameExists: vi.fn(),
    getUserStats: vi.fn(),
    getMonthlyGoal: vi.fn(),
    updateMonthlyGoal: vi.fn(),
    getProfileProgress: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

// Import after mocking
import { userService } from "../../src/lib/container";

// for routes that requires email verification
const createTestApp = (jwtPayload = createMockJwtPayload()) => {
  return new Hono()
    .use("*", (c, next) => {
      c.set("jwtPayload", jwtPayload);
      return next();
    })
    .route("/", userRoutes);
};
// non email verification
const createBasicTestApp = (jwtPayload = createMockJwtPayload()) => {
  return new Hono()
    .use("*", (c, next) => {
      c.set("jwtPayload", jwtPayload);
      return next();
    })
    .route("/", userBasicRoutes);
};

describe("UserController", () => {
  const mockedUserService = vi.mocked(userService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Routes", () => {
    describe("GET /me", () => {
      it("should return current user profile", async () => {
        const mockUser = createMockUser();
        mockedUserService.getUserByIdSafe.mockResolvedValue(mockUser);
        const testApp = createBasicTestApp();
        const client = testClient(testApp);

        const response = await client.me.$get();

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.message).toBe("user profile retrieved");
        expect(data.data.id).toBe(mockUser.id);
        expect(data.data.email).toBe(mockUser.email);
        expect(mockedUserService.getUserByIdSafe).toHaveBeenCalledWith(
          VALID_USER_ID,
        );
      });

      it("should return user with different ID from JWT", async () => {
        const differentUserId = 5;
        const jwtPayload = createMockJwtPayload({
          id: differentUserId.toString(),
        });
        const mockUser = createMockUser({ id: differentUserId });
        mockedUserService.getUserByIdSafe.mockResolvedValue(mockUser);
        const testApp = createBasicTestApp(jwtPayload);
        const client = testClient(testApp);

        const response = await client.me.$get();

        expect(response.status).toBe(200);
        expect(mockedUserService.getUserByIdSafe).toHaveBeenCalledWith(
          differentUserId,
        );
      });

      it("should handle service errors", async () => {
        mockedUserService.getUserByIdSafe.mockRejectedValue(
          new NotFoundError("user record not found"),
        );
        const testApp = createBasicTestApp();
        const client = testClient(testApp);

        const response = await client.me.$get();

        expect(response.status).toBe(500);
      });

      it("should handle invalid user ID", async () => {
        const jwtPayload = createMockJwtPayload({ id: "invalid" });
        mockedUserService.getUserByIdSafe.mockRejectedValue(
          new NotFoundError("user record not found"),
        );
        const testApp = createBasicTestApp(jwtPayload);
        const client = testClient(testApp);

        const response = await client.me.$get();

        expect(response.status).toBe(500);
      });
    });

    describe("GET /me/email-verification-status", () => {
      it("should return verified status when user is verified", async () => {
        mockedUserService.isUserEmailVerified.mockResolvedValue({
          verified: true,
        });
        const testApp = createBasicTestApp();
        const client = testClient(testApp);

        const response = await client.me["email-verification-status"].$get();

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.message).toBe("email verification status retrieved");
        expect(data.data).toEqual({ verified: true });
        expect(mockedUserService.isUserEmailVerified).toHaveBeenCalledWith(
          VALID_USER_ID,
        );
      });

      it("should return unverified status when user is not verified", async () => {
        mockedUserService.isUserEmailVerified.mockResolvedValue({
          verified: false,
        });
        const testApp = createBasicTestApp();
        const client = testClient(testApp);

        const response = await client.me["email-verification-status"].$get();

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.data).toEqual({ verified: false });
      });

      it("should handle service errors", async () => {
        mockedUserService.isUserEmailVerified.mockRejectedValue(
          new NotFoundError("user record not found"),
        );
        const testApp = createBasicTestApp();
        const client = testClient(testApp);

        const response = await client.me["email-verification-status"].$get();

        expect(response.status).toBe(500);
      });
    });
  });

  describe("Protected Routes", () => {
    describe("GET /me/stats", () => {
      it("should return user statistics", async () => {
        const mockStats = createMockUserStats();
        mockedUserService.getUserStats.mockResolvedValue(mockStats as any);
        const testApp = createTestApp();
        const client = testClient(testApp);

        const response = await client.me.stats.$get();

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.message).toBe("user statistics retrieved");
        expect(data.data.user.email).toBe(VALID_EMAIL);
        expect(data.data.accountAge).toBe(365);
        expect(data.data.isEmailVerified).toBe(true);
        expect(data.data.cvCreated).toBe(3);
        expect(data.data.totalJobApplications).toBe(15);
        expect(mockedUserService.getUserStats).toHaveBeenCalledWith(
          VALID_USER_ID,
        );
      });

      it("should handle new user with minimal stats", async () => {
        const newUserStats = createMockUserStats({
          user: createMockUser({
            id: 2,
            firstName: "Jane",
            lastName: "Doe",
            email: "jane@example.com",
            isEmailVerified: false,
          }),
          accountAge: 0,
          isEmailVerified: false,
          cvCreated: 0,
          totalJobApplications: 0,
        });
        mockedUserService.getUserStats.mockResolvedValue(newUserStats as any);
        const testApp = createTestApp();
        const client = testClient(testApp);

        const response = await client.me.stats.$get();

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.data.user.email).toBe("jane@example.com");
        expect(data.data.accountAge).toBe(0);
        expect(data.data.isEmailVerified).toBe(false);
        expect(data.data.cvCreated).toBe(0);
        expect(data.data.totalJobApplications).toBe(0);
      });

      it("should handle service errors", async () => {
        mockedUserService.getUserStats.mockRejectedValue(
          new NotFoundError("user record not found"),
        );
        const testApp = createTestApp();
        const client = testClient(testApp);

        const response = await client.me.stats.$get();

        expect(response.status).toBe(500);
      });
    });

    describe("GET /me/monthly-goal", () => {
      it("should return monthly goal", async () => {
        mockedUserService.getMonthlyGoal.mockResolvedValue({ goal: 50 });
        const testApp = createTestApp();
        const client = testClient(testApp);

        const response = await client.me["monthly-goal"].$get();

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.message).toBe("Monthly goal retrieved successfully");
        expect(data.data).toEqual({ goal: 50 });
        expect(mockedUserService.getMonthlyGoal).toHaveBeenCalledWith(
          VALID_USER_ID,
        );
      });

      it("should return default goal when not set", async () => {
        mockedUserService.getMonthlyGoal.mockResolvedValue({ goal: 30 });
        const testApp = createTestApp();
        const client = testClient(testApp);

        const response = await client.me["monthly-goal"].$get();

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.data.goal).toBe(30);
      });

      it("should handle user not found", async () => {
        mockedUserService.getMonthlyGoal.mockRejectedValue(
          new NotFoundError("User with ID 1 not found"),
        );
        const testApp = createTestApp();
        const client = testClient(testApp);

        const response = await client.me["monthly-goal"].$get();

        expect(response.status).toBe(500);
      });
    });

    describe("PATCH /me/monthly-goal", () => {
      it("should update monthly goal successfully", async () => {
        const newGoal = 100;
        mockedUserService.updateMonthlyGoal.mockResolvedValue({
          goal: newGoal,
        });
        const testApp = createTestApp();
        const client = testClient(testApp);

        const response = await client.me["monthly-goal"].$patch({
          json: { goal: newGoal },
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.message).toBe("Monthly goal updated successfully");
        expect(data.data.goal).toBe(newGoal);
        expect(mockedUserService.updateMonthlyGoal).toHaveBeenCalledWith(
          VALID_USER_ID,
          newGoal,
        );
      });

      it("should handle minimum goal value", async () => {
        mockedUserService.updateMonthlyGoal.mockResolvedValue({ goal: 1 });
        const testApp = createTestApp();
        const client = testClient(testApp);

        const response = await client.me["monthly-goal"].$patch({
          json: { goal: 1 },
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.data.goal).toBe(1);
      });

      it("should handle invalid goal data (negative)", async () => {
        const testApp = createTestApp();
        const client = testClient(testApp);

        const response = await client.me["monthly-goal"].$patch({
          json: { goal: -1 },
        });

        expect(response.status).toBe(400);
      });

      it("should handle invalid goal data (zero)", async () => {
        const testApp = createTestApp();
        const client = testClient(testApp);

        const response = await client.me["monthly-goal"].$patch({
          json: { goal: 0 },
        });

        expect(response.status).toBe(400);
      });

      it("should handle user not found", async () => {
        mockedUserService.updateMonthlyGoal.mockRejectedValue(
          new NotFoundError("User with ID 1 not found"),
        );
        const testApp = createTestApp();
        const client = testClient(testApp);

        const response = await client.me["monthly-goal"].$patch({
          json: { goal: 50 },
        });

        expect(response.status).toBe(500);
      });
    });

    describe("GET /me/profile-progress", () => {
      it("should return profile progress", async () => {
        const mockProgress = createMockProfileProgress();
        mockedUserService.getProfileProgress.mockResolvedValue(mockProgress);
        const testApp = createTestApp();
        const client = testClient(testApp);

        const response = await client.me["profile-progress"].$get();

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.message).toBe("Profile progress retrieved successfully");
        expect(data.data).toEqual(mockProgress);
        expect(mockedUserService.getProfileProgress).toHaveBeenCalledWith(
          VALID_USER_ID,
        );
      });

      it("should handle empty profile progress", async () => {
        const emptyProgress = createMockProfileProgress({
          totalFields: 7,
          filledFields: 0,
          progressPercentage: 0,
          emptyFieldNames: [
            "profileImage",
            "birthDate",
            "firstName",
            "lastName",
            "about",
            "bio",
            "gender",
          ],
        });
        mockedUserService.getProfileProgress.mockResolvedValue(emptyProgress);
        const testApp = createTestApp();
        const client = testClient(testApp);

        const response = await client.me["profile-progress"].$get();

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.data.progressPercentage).toBe(0);
        expect(data.data.filledFields).toBe(0);
      });

      it("should handle user not found", async () => {
        mockedUserService.getProfileProgress.mockRejectedValue(
          new NotFoundError("User with ID 1 not found"),
        );
        const testApp = createTestApp();
        const client = testClient(testApp);

        const response = await client.me["profile-progress"].$get();

        expect(response.status).toBe(500);
      });
    });

    describe("PATCH /me", () => {
      it("should update user profile successfully", async () => {
        const updateData = { firstName: "Jane", lastName: "Smith" };
        const updatedUser = createMockUser(updateData);
        mockedUserService.updateUserProfile.mockResolvedValue(updatedUser);
        const testApp = createTestApp();
        const client = testClient(testApp);

        const response = await client.me.$patch({
          json: updateData,
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.message).toBe("user profile updated successfully");
        expect(data.data.firstName).toBe(updateData.firstName);
        expect(data.data.lastName).toBe(updateData.lastName);
        expect(mockedUserService.updateUserProfile).toHaveBeenCalledWith(
          VALID_USER_ID,
          updateData,
        );
      });

      it("should update partial profile data", async () => {
        const partialData = { firstName: "NewName" };
        const updatedUser = createMockUser(partialData);
        mockedUserService.updateUserProfile.mockResolvedValue(updatedUser);
        const testApp = createTestApp();
        const client = testClient(testApp);

        const response = await client.me.$patch({
          json: partialData,
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.data.firstName).toBe("NewName");
        expect(mockedUserService.updateUserProfile).toHaveBeenCalledWith(
          VALID_USER_ID,
          partialData,
        );
      });

      it("should handle service errors", async () => {
        mockedUserService.updateUserProfile.mockRejectedValue(
          new NotFoundError("user record not found"),
        );
        const testApp = createTestApp();
        const client = testClient(testApp);

        const response = await client.me.$patch({
          json: { firstName: "Valid" },
        });

        expect(response.status).toBe(500);
      });

      it("should handle empty update object", async () => {
        const mockUser = createMockUser();
        mockedUserService.updateUserProfile.mockResolvedValue(mockUser);
        const testApp = createTestApp();
        const client = testClient(testApp);

        const response = await client.me.$patch({
          json: {},
        });

        expect(response.status).toBe(200);
        expect(mockedUserService.updateUserProfile).toHaveBeenCalledWith(
          VALID_USER_ID,
          {},
        );
      });
    });

    describe("DELETE /me", () => {
      const validPassword = "correctPassword123";

      it("should delete user account successfully", async () => {
        mockedUserService.deleteUser.mockResolvedValue(true);
        const testApp = createTestApp();
        const client = testClient(testApp);

        const response = await client.me.$delete({
          json: { password: validPassword },
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.message).toBe("user account deleted successfully");
        expect(data.data.deleted).toBe(true);
        expect(mockedUserService.deleteUser).toHaveBeenCalledWith(
          VALID_USER_ID,
          validPassword,
        );

        expect(response.headers.get("set-cookie")).toContain(
          "refreshToken=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict",
        );
      });

      it("should handle incorrect password", async () => {
        mockedUserService.deleteUser.mockRejectedValue(
          new NotFoundError("Failed to delete user account"),
        );
        const testApp = createTestApp();
        const client = testClient(testApp);

        const response = await client.me.$delete({
          json: { password: "wrongPassword" },
        });

        expect(response.status).toBe(500);
      });

      it("should handle user not found", async () => {
        mockedUserService.deleteUser.mockRejectedValue(
          new NotFoundError("Failed to delete user account"),
        );
        const testApp = createTestApp();
        const client = testClient(testApp);

        const response = await client.me.$delete({
          json: { password: validPassword },
        });

        expect(response.status).toBe(500);
      });
    });
  });
});
