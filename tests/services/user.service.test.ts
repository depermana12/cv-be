import { describe, it, expect, vi, beforeEach, type Mocked } from "vitest";
import { UserService } from "../../src/services/user.service";
import { NotFoundError } from "../../src/errors/not-found.error";
import { ValidationError } from "../../src/errors/validation.error";
import type { IUserRepository } from "../../src/repositories/user.repo";
import {
  createMockUserRepository,
  createMockCvService,
  createMockJobApplicationService,
  createMockUser,
  createMockUserWithPassword,
  createUpdateProfileData,
  createUpdatePreferencesData,
  createUpdateSubscriptionData,
  setupUserRepositoryMocks,
  setupCvServiceMocks,
  setupJobApplicationServiceMocks,
  VALID_USER_ID,
  INVALID_USER_ID,
  VALID_EMAIL,
  NEW_EMAIL,
  INVALID_EMAIL,
  EXISTING_USERNAME,
  AVAILABLE_USERNAME,
} from "../utils/user.test-helpers";

describe("UserService", () => {
  let userService: UserService;
  let mockUserRepository: Mocked<IUserRepository>;
  let mockCvService: any;
  let mockJobApplicationService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserRepository = createMockUserRepository();
    mockCvService = createMockCvService();
    mockJobApplicationService = createMockJobApplicationService();
    userService = new UserService(
      mockUserRepository,
      mockCvService,
      mockJobApplicationService,
    );
  });

  describe("getUserByIdSafe", () => {
    it("should return user without password when user exists", async () => {
      const mockUser = createMockUser();
      mockUserRepository.getByIdSafe.mockResolvedValue(mockUser);

      const result = await userService.getUserByIdSafe(VALID_USER_ID);

      expect(result).toEqual(mockUser);
      expect(result).not.toHaveProperty("password");
      expect(mockUserRepository.getByIdSafe).toHaveBeenCalledWith(
        VALID_USER_ID,
      );
    });

    it("should throw NotFoundError when user does not exist", async () => {
      mockUserRepository.getByIdSafe.mockResolvedValue(null);

      await expect(
        userService.getUserByIdSafe(INVALID_USER_ID),
      ).rejects.toThrow(new NotFoundError("user record not found"));

      expect(mockUserRepository.getByIdSafe).toHaveBeenCalledWith(
        INVALID_USER_ID,
      );
    });
  });

  describe("getUserByEmail", () => {
    it("should return user without password when email exists", async () => {
      const userWithPassword = createMockUserWithPassword();
      mockUserRepository.getByEmail.mockResolvedValue(userWithPassword);

      const result = await userService.getUserByEmail(VALID_EMAIL);

      const { password, ...expectedUser } = userWithPassword;
      expect(result).toEqual(expectedUser);
      expect(result).not.toHaveProperty("password");
      expect(mockUserRepository.getByEmail).toHaveBeenCalledWith(
        VALID_EMAIL.toLowerCase(),
      );
    });

    it("should throw NotFoundError when email does not exist", async () => {
      mockUserRepository.getByEmail.mockResolvedValue(null);

      await expect(userService.getUserByEmail(INVALID_EMAIL)).rejects.toThrow(
        new NotFoundError("user record not found"),
      );

      expect(mockUserRepository.getByEmail).toHaveBeenCalledWith(
        INVALID_EMAIL.toLowerCase(),
      );
    });
  });

  describe("getUserByEmailSafe", () => {
    it("should return user without password when email exists", async () => {
      const mockUser = createMockUser();
      mockUserRepository.getByEmailSafe.mockResolvedValue(mockUser);

      const result = await userService.getUserByEmailSafe(VALID_EMAIL);

      expect(result).toEqual(mockUser);
      expect(result).not.toHaveProperty("password");
      expect(mockUserRepository.getByEmailSafe).toHaveBeenCalledWith(
        VALID_EMAIL.toLowerCase(),
      );
    });

    it("should throw NotFoundError when email does not exist", async () => {
      mockUserRepository.getByEmailSafe.mockResolvedValue(null);

      await expect(
        userService.getUserByEmailSafe(INVALID_EMAIL),
      ).rejects.toThrow(new NotFoundError("user record not found"));

      expect(mockUserRepository.getByEmailSafe).toHaveBeenCalledWith(
        INVALID_EMAIL.toLowerCase(),
      );
    });
  });

  describe("updateUserProfile", () => {
    it("should update user profile successfully", async () => {
      const updateData = createUpdateProfileData();
      const updatedUser = createMockUser(updateData);
      mockUserRepository.updateUser.mockResolvedValue(updatedUser);
      mockUserRepository.getByIdSafe.mockResolvedValue(updatedUser);

      const result = await userService.updateUserProfile(
        VALID_USER_ID,
        updateData,
      );

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.updateUser).toHaveBeenCalledWith(
        VALID_USER_ID,
        updateData,
      );
      expect(mockUserRepository.getByIdSafe).toHaveBeenCalledWith(
        VALID_USER_ID,
      );
    });

    it("should update partial user profile data", async () => {
      const partialData = { firstName: "NewName" };
      const updatedUser = createMockUser(partialData);
      mockUserRepository.updateUser.mockResolvedValue(updatedUser);
      mockUserRepository.getByIdSafe.mockResolvedValue(updatedUser);

      const result = await userService.updateUserProfile(
        VALID_USER_ID,
        partialData,
      );

      expect(result.firstName).toBe("NewName");
      expect(mockUserRepository.updateUser).toHaveBeenCalledWith(
        VALID_USER_ID,
        partialData,
      );
    });

    it("should throw NotFoundError when update fails", async () => {
      const updateData = createUpdateProfileData();
      mockUserRepository.updateUser.mockResolvedValue(null);

      await expect(
        userService.updateUserProfile(INVALID_USER_ID, updateData),
      ).rejects.toThrow(new NotFoundError("user record not found"));

      expect(mockUserRepository.updateUser).toHaveBeenCalledWith(
        INVALID_USER_ID,
        updateData,
      );
    });

    it("should handle empty update data", async () => {
      const emptyData = {};
      const mockUser = createMockUser();
      mockUserRepository.updateUser.mockResolvedValue(mockUser);
      mockUserRepository.getByIdSafe.mockResolvedValue(mockUser);

      const result = await userService.updateUserProfile(
        VALID_USER_ID,
        emptyData,
      );

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.updateUser).toHaveBeenCalledWith(
        VALID_USER_ID,
        emptyData,
      );
    });
  });

  describe("updateUserEmail", () => {
    it("should update user email successfully", async () => {
      const updatedUser = createMockUser({ email: NEW_EMAIL });
      mockUserRepository.updateEmail.mockResolvedValue(updatedUser);

      const result = await userService.updateUserEmail(
        VALID_USER_ID,
        NEW_EMAIL,
      );

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.updateEmail).toHaveBeenCalledWith(
        VALID_USER_ID,
        NEW_EMAIL.toLowerCase(),
      );
    });

    it("should throw NotFoundError when update fails", async () => {
      mockUserRepository.updateEmail.mockResolvedValue(null);

      await expect(
        userService.updateUserEmail(INVALID_USER_ID, NEW_EMAIL),
      ).rejects.toThrow(new NotFoundError("user record not found"));

      expect(mockUserRepository.updateEmail).toHaveBeenCalledWith(
        INVALID_USER_ID,
        NEW_EMAIL.toLowerCase(),
      );
    });
  });

  describe("updateUserUsername", () => {
    it("should update username when available", async () => {
      const newUsername = AVAILABLE_USERNAME;
      const updatedUser = createMockUser({ username: newUsername });
      mockUserRepository.isUsernameExists.mockResolvedValue(false);
      mockUserRepository.updateUsername.mockResolvedValue(updatedUser);

      const result = await userService.updateUserUsername(
        VALID_USER_ID,
        newUsername,
      );

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.isUsernameExists).toHaveBeenCalledWith(
        newUsername.toLowerCase(),
      );
      expect(mockUserRepository.updateUsername).toHaveBeenCalledWith(
        VALID_USER_ID,
        newUsername.toLowerCase(),
      );
    });

    it("should throw ValidationError when username already exists", async () => {
      mockUserRepository.isUsernameExists.mockResolvedValue(true);

      await expect(
        userService.updateUserUsername(VALID_USER_ID, EXISTING_USERNAME),
      ).rejects.toThrow(new ValidationError("username already taken"));

      expect(mockUserRepository.isUsernameExists).toHaveBeenCalledWith(
        EXISTING_USERNAME.toLowerCase(),
      );
      expect(mockUserRepository.updateUsername).not.toHaveBeenCalled();
    });

    it("should throw NotFoundError when user not found during update", async () => {
      mockUserRepository.isUsernameExists.mockResolvedValue(false);
      mockUserRepository.updateUsername.mockResolvedValue(null);

      await expect(
        userService.updateUserUsername(INVALID_USER_ID, AVAILABLE_USERNAME),
      ).rejects.toThrow(new NotFoundError("user record not found"));

      expect(mockUserRepository.updateUsername).toHaveBeenCalledWith(
        INVALID_USER_ID,
        AVAILABLE_USERNAME.toLowerCase(),
      );
    });
  });

  describe("updateUserPreferences", () => {
    it("should update user preferences successfully", async () => {
      const preferences = createUpdatePreferencesData();
      const updatedUser = createMockUser(preferences);
      mockUserRepository.updateUserPreferences.mockResolvedValue(updatedUser);

      const result = await userService.updateUserPreferences(
        VALID_USER_ID,
        preferences,
      );

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.updateUserPreferences).toHaveBeenCalledWith(
        VALID_USER_ID,
        preferences,
      );
    });

    it("should throw NotFoundError when update fails", async () => {
      const preferences = createUpdatePreferencesData();
      mockUserRepository.updateUserPreferences.mockResolvedValue(null);

      await expect(
        userService.updateUserPreferences(INVALID_USER_ID, preferences),
      ).rejects.toThrow(new NotFoundError("user record not found"));

      expect(mockUserRepository.updateUserPreferences).toHaveBeenCalledWith(
        INVALID_USER_ID,
        preferences,
      );
    });
  });

  describe("updateUserSubscription", () => {
    it("should update user subscription successfully", async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const subscription = createUpdateSubscriptionData({
        subscriptionExpiresAt: futureDate,
      });
      const updatedUser = createMockUser(subscription);
      mockUserRepository.updateUserSubscription.mockResolvedValue(updatedUser);

      const result = await userService.updateUserSubscription(
        VALID_USER_ID,
        subscription,
      );

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.updateUserSubscription).toHaveBeenCalledWith(
        VALID_USER_ID,
        subscription,
      );
    });

    it("should update subscription without expiry date", async () => {
      const subscription = {
        subscriptionType: "pro" as const,
        subscriptionStatus: "active" as const,
      };
      const updatedUser = createMockUser(subscription);
      mockUserRepository.updateUserSubscription.mockResolvedValue(updatedUser);

      const result = await userService.updateUserSubscription(
        VALID_USER_ID,
        subscription,
      );

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.updateUserSubscription).toHaveBeenCalledWith(
        VALID_USER_ID,
        subscription,
      );
    });

    it("should throw ValidationError when expiry date is in the past", async () => {
      const pastDate = new Date("2020-01-01");
      const subscription = createUpdateSubscriptionData({
        subscriptionExpiresAt: pastDate,
      });

      await expect(
        userService.updateUserSubscription(VALID_USER_ID, subscription),
      ).rejects.toThrow(
        new ValidationError("Subscription expiry date must be in the future"),
      );

      expect(mockUserRepository.updateUserSubscription).not.toHaveBeenCalled();
    });

    it("should throw NotFoundError when user not found", async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const subscription = createUpdateSubscriptionData({
        subscriptionExpiresAt: futureDate,
      });
      mockUserRepository.updateUserSubscription.mockResolvedValue(null);

      await expect(
        userService.updateUserSubscription(INVALID_USER_ID, subscription),
      ).rejects.toThrow(new NotFoundError("user record not found"));

      expect(mockUserRepository.updateUserSubscription).toHaveBeenCalledWith(
        INVALID_USER_ID,
        subscription,
      );
    });

    it("should handle expiry date exactly at current time", async () => {
      const now = new Date();
      const subscription = createUpdateSubscriptionData({
        subscriptionExpiresAt: now,
      });

      await expect(
        userService.updateUserSubscription(VALID_USER_ID, subscription),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("isUserEmailVerified", () => {
    it("should return verified true when user email is verified", async () => {
      const verifiedUser = createMockUser({ isEmailVerified: true });
      mockUserRepository.getByIdSafe.mockResolvedValue(verifiedUser);

      const result = await userService.isUserEmailVerified(VALID_USER_ID);

      expect(result).toEqual({ verified: true });
      expect(mockUserRepository.getByIdSafe).toHaveBeenCalledWith(
        VALID_USER_ID,
      );
    });

    it("should return verified false when user email is not verified", async () => {
      const unverifiedUser = createMockUser({ isEmailVerified: false });
      mockUserRepository.getByIdSafe.mockResolvedValue(unverifiedUser);

      const result = await userService.isUserEmailVerified(VALID_USER_ID);

      expect(result).toEqual({ verified: false });
    });

    it("should return verified false when isEmailVerified is null", async () => {
      const userWithNullVerification = createMockUser({
        isEmailVerified: null as any,
      });
      mockUserRepository.getByIdSafe.mockResolvedValue(
        userWithNullVerification,
      );

      const result = await userService.isUserEmailVerified(VALID_USER_ID);

      expect(result).toEqual({ verified: false });
    });
  });

  describe("isUsernameExists", () => {
    it("should return true when username exists", async () => {
      mockUserRepository.isUsernameExists.mockResolvedValue(true);

      const result = await userService.isUsernameExists(EXISTING_USERNAME);

      expect(result).toBe(true);
      expect(mockUserRepository.isUsernameExists).toHaveBeenCalledWith(
        EXISTING_USERNAME.toLowerCase(),
      );
    });

    it("should return false when username does not exist", async () => {
      mockUserRepository.isUsernameExists.mockResolvedValue(false);

      const result = await userService.isUsernameExists(AVAILABLE_USERNAME);

      expect(result).toBe(false);
      expect(mockUserRepository.isUsernameExists).toHaveBeenCalledWith(
        AVAILABLE_USERNAME.toLowerCase(),
      );
    });
  });

  describe("getUserStats", () => {
    it("should return complete user statistics", async () => {
      const mockUser = createMockUser();
      setupUserRepositoryMocks(mockUserRepository);
      setupCvServiceMocks(mockCvService);
      setupJobApplicationServiceMocks(mockJobApplicationService);

      const result = await userService.getUserStats(VALID_USER_ID);

      expect(result).toEqual({
        user: mockUser,
        accountAge: expect.any(Number),
        isEmailVerified: true,
        cvCreated: 3,
        totalJobApplications: 15,
      });
      expect(mockUserRepository.getByIdSafe).toHaveBeenCalledWith(
        VALID_USER_ID,
      );
      expect(mockCvService.getAllCvs).toHaveBeenCalledWith(VALID_USER_ID, {
        limit: 1,
        offset: 0,
      });
      expect(
        mockJobApplicationService.getAllJobApplications,
      ).toHaveBeenCalledWith(VALID_USER_ID, { limit: 1, offset: 0 });
    });

    it("should calculate account age correctly", async () => {
      const daysAgo = 30;
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - daysAgo);
      const userWithAge = createMockUser({ createdAt: createdDate });

      mockUserRepository.getByIdSafe.mockResolvedValue(userWithAge);
      setupCvServiceMocks(mockCvService);
      setupJobApplicationServiceMocks(mockJobApplicationService);

      const result = await userService.getUserStats(VALID_USER_ID);

      expect(result.accountAge).toBeGreaterThanOrEqual(daysAgo - 1);
      expect(result.accountAge).toBeLessThanOrEqual(daysAgo + 1);
    });

    it("should handle new user with no CVs or job applications", async () => {
      const newUser = createMockUser({
        id: 2,
        firstName: "New",
        lastName: "User",
        email: "newuser@example.com",
        isEmailVerified: false,
        createdAt: new Date(),
      });

      mockUserRepository.getByIdSafe.mockResolvedValue(newUser);
      mockCvService.getAllCvs.mockResolvedValue({
        data: [],
        total: 0,
        limit: 1,
        offset: 0,
      });
      mockJobApplicationService.getAllJobApplications.mockResolvedValue({
        data: [],
        total: 0,
        limit: 1,
        offset: 0,
      });

      const result = await userService.getUserStats(2);

      expect(result).toEqual({
        user: newUser,
        accountAge: 0,
        isEmailVerified: false,
        cvCreated: 0,
        totalJobApplications: 0,
      });
    });

    it("should handle user with null createdAt date", async () => {
      const userWithNullDate = createMockUser({ createdAt: null as any });
      mockUserRepository.getByIdSafe.mockResolvedValue(userWithNullDate);
      setupCvServiceMocks(mockCvService);
      setupJobApplicationServiceMocks(mockJobApplicationService);

      const result = await userService.getUserStats(VALID_USER_ID);

      expect(result.accountAge).toBe(0);
    });
  });

  describe("getMonthlyGoal", () => {
    it("should return user monthly goal when set", async () => {
      const userWithGoal = createMockUser({ monthlyApplicationGoal: 50 });
      mockUserRepository.getByIdSafe.mockResolvedValue(userWithGoal);

      const result = await userService.getMonthlyGoal(VALID_USER_ID);

      expect(result).toEqual({ goal: 50 });
      expect(mockUserRepository.getByIdSafe).toHaveBeenCalledWith(
        VALID_USER_ID,
      );
    });

    it("should return default goal when not set", async () => {
      const userWithoutGoal = createMockUser({
        monthlyApplicationGoal: null,
      });
      mockUserRepository.getByIdSafe.mockResolvedValue(userWithoutGoal);

      const result = await userService.getMonthlyGoal(VALID_USER_ID);

      expect(result).toEqual({ goal: 30 });
    });

    it("should throw NotFoundError when user not found", async () => {
      mockUserRepository.getByIdSafe.mockResolvedValue(null);

      await expect(userService.getMonthlyGoal(INVALID_USER_ID)).rejects.toThrow(
        new NotFoundError(`User with ID ${INVALID_USER_ID} not found`),
      );
    });
  });

  describe("updateMonthlyGoal", () => {
    it("should update monthly goal successfully", async () => {
      const newGoal = 100;
      const updatedUser = createMockUser({ monthlyApplicationGoal: newGoal });
      mockUserRepository.updateUser.mockResolvedValue(updatedUser);

      const result = await userService.updateMonthlyGoal(
        VALID_USER_ID,
        newGoal,
      );

      expect(result).toEqual({ goal: newGoal });
      expect(mockUserRepository.updateUser).toHaveBeenCalledWith(
        VALID_USER_ID,
        {
          monthlyApplicationGoal: newGoal,
        },
      );
    });

    it("should return default goal when updated user goal is null", async () => {
      const updatedUser = createMockUser({ monthlyApplicationGoal: null });
      mockUserRepository.updateUser.mockResolvedValue(updatedUser);

      const result = await userService.updateMonthlyGoal(VALID_USER_ID, 50);

      expect(result).toEqual({ goal: 30 });
    });

    it("should throw NotFoundError when user not found", async () => {
      mockUserRepository.updateUser.mockResolvedValue(null);

      await expect(
        userService.updateMonthlyGoal(INVALID_USER_ID, 50),
      ).rejects.toThrow(
        new NotFoundError(`User with ID ${INVALID_USER_ID} not found`),
      );
    });

    it("should handle zero goal", async () => {
      const updatedUser = createMockUser({ monthlyApplicationGoal: 0 });
      mockUserRepository.updateUser.mockResolvedValue(updatedUser);

      const result = await userService.updateMonthlyGoal(VALID_USER_ID, 0);

      expect(result).toEqual({ goal: 0 });
    });
  });

  describe("getProfileProgress", () => {
    it("should return profile progress with correct calculations", async () => {
      const progressData = {
        profileImage: "image.jpg",
        birthDate: new Date(),
        firstName: "John",
        lastName: "Doe",
        about: null,
        bio: "Bio text",
        gender: "male" as const,
      };
      mockUserRepository.getProfileProgressData.mockResolvedValue(progressData);

      const result = await userService.getProfileProgress(VALID_USER_ID);

      expect(result).toEqual({
        totalFields: 7,
        filledFields: 6,
        progressPercentage: 86,
        emptyFieldNames: ["about"],
      });
      expect(mockUserRepository.getProfileProgressData).toHaveBeenCalledWith(
        VALID_USER_ID,
      );
    });

    it("should handle completely empty profile", async () => {
      const emptyProgressData = {
        profileImage: null,
        birthDate: null,
        firstName: null,
        lastName: null,
        about: null,
        bio: null,
        gender: null,
      };
      mockUserRepository.getProfileProgressData.mockResolvedValue(
        emptyProgressData,
      );

      const result = await userService.getProfileProgress(VALID_USER_ID);

      expect(result).toEqual({
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
    });

    it("should handle completely filled profile", async () => {
      const fullProgressData = {
        profileImage: "image.jpg",
        birthDate: new Date(),
        firstName: "John",
        lastName: "Doe",
        about: "About me",
        bio: "Bio text",
        gender: "male" as const,
      };
      mockUserRepository.getProfileProgressData.mockResolvedValue(
        fullProgressData,
      );

      const result = await userService.getProfileProgress(VALID_USER_ID);

      expect(result).toEqual({
        totalFields: 7,
        filledFields: 7,
        progressPercentage: 100,
        emptyFieldNames: [],
      });
    });

    it("should throw NotFoundError when user not found", async () => {
      mockUserRepository.getProfileProgressData.mockResolvedValue(null);

      await expect(
        userService.getProfileProgress(INVALID_USER_ID),
      ).rejects.toThrow(
        new NotFoundError(`User with ID ${INVALID_USER_ID} not found`),
      );
    });

    it("should handle empty string values as empty fields", async () => {
      const progressDataWithEmptyStrings = {
        profileImage: "",
        birthDate: null,
        firstName: "",
        lastName: "Doe",
        about: "",
        bio: null,
        gender: null,
      };
      mockUserRepository.getProfileProgressData.mockResolvedValue(
        progressDataWithEmptyStrings,
      );

      const result = await userService.getProfileProgress(VALID_USER_ID);

      expect(result.filledFields).toBe(1);
      expect(result.emptyFieldNames).toContain("profileImage");
      expect(result.emptyFieldNames).toContain("firstName");
      expect(result.emptyFieldNames).toContain("about");
    });
  });

  describe("deleteUser", () => {
    const validPassword = "correctPassword";

    it("should delete user successfully with correct password", async () => {
      const userWithPassword = createMockUserWithPassword();
      mockUserRepository.getByIdWithPassword.mockResolvedValue(
        userWithPassword,
      );

      const mockPasswordVerify = vi.fn().mockResolvedValue(true);
      vi.stubGlobal("Bun", { password: { verify: mockPasswordVerify } });

      mockUserRepository.deleteUser.mockResolvedValue(true);

      const result = await userService.deleteUser(VALID_USER_ID, validPassword);

      expect(result).toBe(true);
      expect(mockUserRepository.getByIdWithPassword).toHaveBeenCalledWith(
        VALID_USER_ID,
      );
      expect(mockPasswordVerify).toHaveBeenCalledWith(
        validPassword,
        userWithPassword.password,
      );
      expect(mockUserRepository.deleteUser).toHaveBeenCalledWith(VALID_USER_ID);
    });

    it("should throw NotFoundError when user not found", async () => {
      mockUserRepository.getByIdWithPassword.mockResolvedValue(null);

      await expect(
        userService.deleteUser(INVALID_USER_ID, validPassword),
      ).rejects.toThrow(new NotFoundError("Failed to delete user account"));

      expect(mockUserRepository.getByIdWithPassword).toHaveBeenCalledWith(
        INVALID_USER_ID,
      );
      expect(mockUserRepository.deleteUser).not.toHaveBeenCalled();
    });

    it("should throw NotFoundError when password is incorrect", async () => {
      const userWithPassword = createMockUserWithPassword();
      mockUserRepository.getByIdWithPassword.mockResolvedValue(
        userWithPassword,
      );

      const mockPasswordVerify = vi.fn().mockResolvedValue(false);
      vi.stubGlobal("Bun", { password: { verify: mockPasswordVerify } });

      await expect(
        userService.deleteUser(VALID_USER_ID, "wrongPassword"),
      ).rejects.toThrow(new NotFoundError("Failed to delete user account"));

      expect(mockPasswordVerify).toHaveBeenCalledWith(
        "wrongPassword",
        userWithPassword.password,
      );
      expect(mockUserRepository.deleteUser).not.toHaveBeenCalled();
    });

    it("should throw NotFoundError when delete operation fails", async () => {
      const userWithPassword = createMockUserWithPassword();
      mockUserRepository.getByIdWithPassword.mockResolvedValue(
        userWithPassword,
      );

      const mockPasswordVerify = vi.fn().mockResolvedValue(true);
      vi.stubGlobal("Bun", { password: { verify: mockPasswordVerify } });

      mockUserRepository.deleteUser.mockResolvedValue(false);

      await expect(
        userService.deleteUser(VALID_USER_ID, validPassword),
      ).rejects.toThrow(new NotFoundError("Failed to delete user account"));

      expect(mockUserRepository.deleteUser).toHaveBeenCalledWith(VALID_USER_ID);
    });
  });
});
