import { describe, it, expect, vi, beforeEach, type Mocked } from "vitest";
import { AuthService } from "../../src/services/auth.service";
import { ValidationError } from "../../src/errors/validation.error";
import { NotFoundError } from "../../src/errors/not-found.error";
import type { IUserRepository } from "../../src/repositories/user.repo";
import type { ITokenService } from "../../src/services/token.service";
import {
  createMockUserRepository,
  createMockTokenService,
  createMockUser,
  createMockUserWithPassword,
  createMockUserPayload,
  createMockAuthTokens,
  createMockRegistration,
  createMockLogin,
  setupAuthServiceMocks,
  setupBunPasswordMock,
  mockBunPassword,
  VALID_USER_ID,
  INVALID_USER_ID,
  VALID_EMAIL,
  INVALID_EMAIL,
  EXISTING_USERNAME,
  AVAILABLE_USERNAME,
  VALID_PASSWORD,
  INVALID_PASSWORD,
  HASHED_PASSWORD,
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  RESET_TOKEN,
  VERIFICATION_TOKEN,
} from "../utils/auth.test-helpers";

setupBunPasswordMock();

describe("AuthService", () => {
  let authService: AuthService;
  let mockUserRepository: Mocked<IUserRepository>;
  let mockTokenService: Mocked<ITokenService>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserRepository = createMockUserRepository();
    mockTokenService = createMockTokenService();
    authService = new AuthService(mockUserRepository, mockTokenService);
  });

  describe("registerUser", () => {
    it("should register a new user successfully", async () => {
      const mockUser = createMockUser();
      const mockTokens = createMockAuthTokens();
      const mockRegistration = createMockRegistration();

      mockUserRepository.getByEmailSafe.mockResolvedValue(null);
      mockBunPassword.hash.mockResolvedValue(HASHED_PASSWORD);
      mockUserRepository.createUser.mockResolvedValue(mockUser);
      mockTokenService.generateAuthTokens.mockResolvedValue(mockTokens);

      const result = await authService.registerUser(mockRegistration);

      expect(result).toEqual({
        ...mockUser,
        accessToken: ACCESS_TOKEN,
        refreshToken: REFRESH_TOKEN,
      });
      expect(mockUserRepository.getByEmailSafe).toHaveBeenCalledWith(
        VALID_EMAIL,
      );
      expect(mockBunPassword.hash).toHaveBeenCalledWith(VALID_PASSWORD);
      expect(mockUserRepository.createUser).toHaveBeenCalledWith({
        ...mockRegistration,
        password: HASHED_PASSWORD,
      });
      expect(mockTokenService.generateAuthTokens).toHaveBeenCalledWith({
        id: VALID_USER_ID.toString(),
        email: VALID_EMAIL,
        isEmailVerified: false,
      });
    });

    it("should throw ValidationError when email already exists", async () => {
      const existingUser = createMockUser();
      const mockRegistration = createMockRegistration();

      mockUserRepository.getByEmailSafe.mockResolvedValue(existingUser);

      await expect(authService.registerUser(mockRegistration)).rejects.toThrow(
        new ValidationError("email already registered"),
      );

      expect(mockUserRepository.getByEmailSafe).toHaveBeenCalledWith(
        VALID_EMAIL,
      );
      expect(mockBunPassword.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.createUser).not.toHaveBeenCalled();
    });

    it("should handle password hashing failure", async () => {
      const mockRegistration = createMockRegistration();

      mockUserRepository.getByEmailSafe.mockResolvedValue(null);
      mockBunPassword.hash.mockRejectedValue(new Error("Hashing failed"));

      await expect(authService.registerUser(mockRegistration)).rejects.toThrow(
        new ValidationError("Failed to process password"),
      );

      expect(mockUserRepository.createUser).not.toHaveBeenCalled();
    });

    it("should throw ValidationError when user creation fails", async () => {
      const mockRegistration = createMockRegistration();

      mockUserRepository.getByEmailSafe.mockResolvedValue(null);
      mockBunPassword.hash.mockResolvedValue(HASHED_PASSWORD);
      mockUserRepository.createUser.mockResolvedValue(null as any);

      await expect(authService.registerUser(mockRegistration)).rejects.toThrow(
        new ValidationError("failed to create user"),
      );
    });
  });

  describe("userLogin", () => {
    it("should login user successfully", async () => {
      const mockUserWithPassword = createMockUserWithPassword();
      const mockLogin = createMockLogin();
      const mockTokens = createMockAuthTokens();

      mockUserRepository.getByEmail.mockResolvedValue(mockUserWithPassword);
      mockBunPassword.verify.mockResolvedValue(true);
      mockTokenService.generateAuthTokens.mockResolvedValue(mockTokens);

      const result = await authService.userLogin(mockLogin);

      const { password, ...expectedUser } = mockUserWithPassword;
      expect(result).toEqual({
        ...expectedUser,
        accessToken: ACCESS_TOKEN,
        refreshToken: REFRESH_TOKEN,
      });
      expect(mockUserRepository.getByEmail).toHaveBeenCalledWith(VALID_EMAIL);
      expect(mockBunPassword.verify).toHaveBeenCalledWith(
        VALID_PASSWORD,
        HASHED_PASSWORD,
      );
    });

    it("should throw ValidationError when user not found", async () => {
      const mockLogin = createMockLogin();

      mockUserRepository.getByEmail.mockResolvedValue(null);

      await expect(authService.userLogin(mockLogin)).rejects.toThrow(
        new ValidationError("invalid email or password"),
      );

      expect(mockBunPassword.verify).not.toHaveBeenCalled();
    });

    it("should throw ValidationError when password is incorrect", async () => {
      const mockUserWithPassword = createMockUserWithPassword();
      const mockLogin = createMockLogin();

      mockUserRepository.getByEmail.mockResolvedValue(mockUserWithPassword);
      mockBunPassword.verify.mockResolvedValue(false);

      await expect(authService.userLogin(mockLogin)).rejects.toThrow(
        new ValidationError("invalid email or password"),
      );

      expect(mockBunPassword.verify).toHaveBeenCalledWith(
        VALID_PASSWORD,
        HASHED_PASSWORD,
      );
    });

    it("should exclude password from returned user data", async () => {
      const mockUserWithPassword = createMockUserWithPassword();
      const mockLogin = createMockLogin();

      mockUserRepository.getByEmail.mockResolvedValue(mockUserWithPassword);
      mockBunPassword.verify.mockResolvedValue(true);
      mockTokenService.generateAuthTokens.mockResolvedValue(
        createMockAuthTokens(),
      );

      const result = await authService.userLogin(mockLogin);

      expect(result).not.toHaveProperty("password");
    });
  });

  describe("isEmailVerified", () => {
    it("should return true for verified user", async () => {
      const verifiedUser = createMockUser({ isEmailVerified: true });

      mockUserRepository.getByIdSafe.mockResolvedValue(verifiedUser);

      const result = await authService.isEmailVerified(VALID_USER_ID);

      expect(result).toEqual({ verified: true });
      expect(mockUserRepository.getByIdSafe).toHaveBeenCalledWith(
        VALID_USER_ID,
      );
    });

    it("should return false for unverified user", async () => {
      const unverifiedUser = createMockUser({ isEmailVerified: false });

      mockUserRepository.getByIdSafe.mockResolvedValue(unverifiedUser);

      const result = await authService.isEmailVerified(VALID_USER_ID);

      expect(result).toEqual({ verified: false });
    });

    it("should return false when isEmailVerified is null", async () => {
      const userWithNullVerification = createMockUser({
        isEmailVerified: null,
      });

      mockUserRepository.getByIdSafe.mockResolvedValue(
        userWithNullVerification,
      );

      const result = await authService.isEmailVerified(VALID_USER_ID);

      expect(result).toEqual({ verified: false });
    });

    it("should throw NotFoundError when user does not exist", async () => {
      mockUserRepository.getByIdSafe.mockResolvedValue(null);

      await expect(
        authService.isEmailVerified(INVALID_USER_ID),
      ).rejects.toThrow(new NotFoundError("User not found"));

      expect(mockUserRepository.getByIdSafe).toHaveBeenCalledWith(
        INVALID_USER_ID,
      );
    });
  });

  describe("verifyUserEmail", () => {
    it("should verify user email successfully", async () => {
      const mockUser = createMockUser();

      mockUserRepository.verifyUserEmail.mockResolvedValue(mockUser);

      const result = await authService.verifyUserEmail(VALID_USER_ID);

      expect(result).toBe(true);
      expect(mockUserRepository.verifyUserEmail).toHaveBeenCalledWith(
        VALID_USER_ID,
      );
    });

    it("should return false when verification fails", async () => {
      mockUserRepository.verifyUserEmail.mockResolvedValue(null);

      const result = await authService.verifyUserEmail(VALID_USER_ID);

      expect(result).toBe(false);
    });
  });

  describe("createResetPasswordToken", () => {
    it("should create reset password token", async () => {
      const mockUserPayload = createMockUserPayload();

      mockTokenService.createResetPasswordToken.mockResolvedValue(RESET_TOKEN);

      const result = await authService.createResetPasswordToken(
        mockUserPayload,
      );

      expect(result).toBe(RESET_TOKEN);
      expect(mockTokenService.createResetPasswordToken).toHaveBeenCalledWith(
        mockUserPayload,
      );
    });
  });

  describe("validateDecodeResetPasswordToken", () => {
    it("should validate and decode reset password token", async () => {
      const mockUserPayload = createMockUserPayload();

      mockTokenService.validateResetPasswordToken.mockResolvedValue(
        mockUserPayload,
      );

      const result = await authService.validateDecodeResetPasswordToken(
        RESET_TOKEN,
      );

      expect(result).toEqual(mockUserPayload);
      expect(mockTokenService.validateResetPasswordToken).toHaveBeenCalledWith(
        RESET_TOKEN,
      );
    });
  });

  describe("createEmailVerificationToken", () => {
    it("should create email verification token", async () => {
      const mockUserPayload = createMockUserPayload();

      mockTokenService.createEmailVerificationToken.mockResolvedValue(
        VERIFICATION_TOKEN,
      );

      const result = await authService.createEmailVerificationToken(
        mockUserPayload,
      );

      expect(result).toBe(VERIFICATION_TOKEN);
      expect(
        mockTokenService.createEmailVerificationToken,
      ).toHaveBeenCalledWith(mockUserPayload);
    });
  });

  describe("validateEmailVerificationToken", () => {
    it("should validate email verification token", async () => {
      const mockUserPayload = createMockUserPayload();

      mockTokenService.validateEmailVerificationToken.mockResolvedValue(
        mockUserPayload,
      );

      const result = await authService.validateEmailVerificationToken(
        VERIFICATION_TOKEN,
      );

      expect(result).toEqual({
        ...mockUserPayload,
        isEmailVerified: true,
      });
      expect(
        mockTokenService.validateEmailVerificationToken,
      ).toHaveBeenCalledWith(VERIFICATION_TOKEN);
    });
  });

  describe("validateRefreshToken", () => {
    it("should validate refresh token", async () => {
      const mockUserPayload = createMockUserPayload();

      mockTokenService.validateRefreshToken.mockResolvedValue(mockUserPayload);

      const result = await authService.validateRefreshToken(REFRESH_TOKEN);

      expect(result).toEqual(mockUserPayload);
      expect(mockTokenService.validateRefreshToken).toHaveBeenCalledWith(
        REFRESH_TOKEN,
      );
    });
  });

  describe("generateAuthTokens", () => {
    it("should generate auth tokens", async () => {
      const mockUserPayload = createMockUserPayload();
      const mockTokens = createMockAuthTokens();

      mockTokenService.generateAuthTokens.mockResolvedValue(mockTokens);

      const result = await authService.generateAuthTokens(mockUserPayload);

      expect(result).toEqual(mockTokens);
      expect(mockTokenService.generateAuthTokens).toHaveBeenCalledWith(
        mockUserPayload,
      );
    });
  });

  describe("changeUserPassword", () => {
    it("should change user password successfully", async () => {
      const newPassword = "NewPassword123!";
      const mockUser = createMockUser();

      mockUserRepository.userExistsById.mockResolvedValue(true);
      mockBunPassword.hash.mockResolvedValue(HASHED_PASSWORD);
      mockUserRepository.updateUserPassword.mockResolvedValue(mockUser);

      await authService.changeUserPassword(VALID_USER_ID, newPassword);

      expect(mockUserRepository.userExistsById).toHaveBeenCalledWith(
        VALID_USER_ID,
      );
      expect(mockBunPassword.hash).toHaveBeenCalledWith(newPassword);
      expect(mockUserRepository.updateUserPassword).toHaveBeenCalledWith(
        VALID_USER_ID,
        HASHED_PASSWORD,
      );
    });

    it("should throw NotFoundError when user does not exist", async () => {
      const newPassword = "NewPassword123!";

      mockUserRepository.userExistsById.mockResolvedValue(false);

      await expect(
        authService.changeUserPassword(INVALID_USER_ID, newPassword),
      ).rejects.toThrow(new NotFoundError("User not found"));

      expect(mockBunPassword.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.updateUserPassword).not.toHaveBeenCalled();
    });

    it("should throw ValidationError when password update fails", async () => {
      const newPassword = "NewPassword123!";

      mockUserRepository.userExistsById.mockResolvedValue(true);
      mockBunPassword.hash.mockResolvedValue(HASHED_PASSWORD);
      mockUserRepository.updateUserPassword.mockResolvedValue(null);

      await expect(
        authService.changeUserPassword(VALID_USER_ID, newPassword),
      ).rejects.toThrow(new ValidationError("Failed to update user password"));
    });

    it("should handle password hashing failure", async () => {
      const newPassword = "NewPassword123!";

      mockUserRepository.userExistsById.mockResolvedValue(true);
      mockBunPassword.hash.mockRejectedValue(new Error("Hashing failed"));

      await expect(
        authService.changeUserPassword(VALID_USER_ID, newPassword),
      ).rejects.toThrow(new ValidationError("Failed to process password"));

      expect(mockUserRepository.updateUserPassword).not.toHaveBeenCalled();
    });
  });

  describe("isUsernameAvailable", () => {
    it("should return true when username is available", async () => {
      mockUserRepository.isUsernameExists.mockResolvedValue(false);

      const result = await authService.isUsernameAvailable(AVAILABLE_USERNAME);

      expect(result).toEqual({ available: true });
      expect(mockUserRepository.isUsernameExists).toHaveBeenCalledWith(
        AVAILABLE_USERNAME.toLowerCase(),
      );
    });

    it("should return false when username exists", async () => {
      mockUserRepository.isUsernameExists.mockResolvedValue(true);

      const result = await authService.isUsernameAvailable(EXISTING_USERNAME);

      expect(result).toEqual({ available: false });
      expect(mockUserRepository.isUsernameExists).toHaveBeenCalledWith(
        EXISTING_USERNAME.toLowerCase(),
      );
    });

    it("should include artificial delay for timing attack prevention", async () => {
      mockUserRepository.isUsernameExists.mockResolvedValue(false);

      const startTime = Date.now();
      await authService.isUsernameAvailable(AVAILABLE_USERNAME);
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    });
  });

  describe("concurent attempts", () => {
    it("should handle concurrent login attempts", async () => {
      const mockUserWithPassword = createMockUserWithPassword();
      const mockLogin = createMockLogin();

      mockUserRepository.getByEmail.mockResolvedValue(mockUserWithPassword);
      mockBunPassword.verify.mockResolvedValue(true);
      mockTokenService.generateAuthTokens.mockResolvedValue(
        createMockAuthTokens(),
      );

      const [result1, result2] = await Promise.all([
        authService.userLogin(mockLogin),
        authService.userLogin(mockLogin),
      ]);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(mockUserRepository.getByEmail).toHaveBeenCalledTimes(2);
    });
  });
});
