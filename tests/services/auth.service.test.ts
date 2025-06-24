import { describe, it, expect, vi, beforeEach, type Mocked } from "vitest";
import { AuthService } from "../../src/services/auth.service";
import { ValidationError } from "../../src/errors/validation.error";
import { NotFoundError } from "../../src/errors/not-found.error";
import type {
  AuthUserRegister,
  AuthUserLogin,
  AuthUserSafe,
} from "../../src/db/types/auth.type";
import type { UserPayload } from "../../src/lib/types";
import type { IUserRepository } from "../../src/repositories/user.repo";
import { createMockUserRepository } from "./user.service.test";
import type { ITokenService } from "../../src/services/token.service";

// mock bun utils
const mockBunPassword = {
  hash: vi.fn(),
  verify: vi.fn(),
};
global.Bun = {
  password: mockBunPassword,
} as any;

export function createMockTokenService(): Mocked<ITokenService> {
  return {
    decodeToken: vi.fn(),
    createAccessToken: vi.fn(),
    createRefreshToken: vi.fn(),
    generateAuthTokens: vi.fn(),
    createResetPasswordToken: vi.fn(),
    createEmailVerificationToken: vi.fn(),
    verifyToken: vi
      .fn()
      .mockImplementation(
        async <T extends object>(token: string): Promise<T> => ({} as T),
      ),
    validateRefreshToken: vi.fn(),
    validateResetPasswordToken: vi.fn(),
    validateEmailVerificationToken: vi.fn(),
  };
}

describe("AuthService", () => {
  let authService: AuthService;
  let mockUserRepository: Mocked<IUserRepository>;
  let mockTokenService: Mocked<ITokenService>;

  const userId = 1;
  const mockUser: AuthUserSafe = {
    id: userId,
    email: "tungtungsahur@example.com",
    firstName: "tungtung",
    lastName: "tung",
    username: "sahur",
    isEmailVerified: true,
    profileImage: null,
    birthDate: null,
    gender: null,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
  };

  const userWithPassword = {
    ...mockUser,
    password: "moCkHashedPassworD",
  };

  const mockAuthTokens = {
    accessToken: "mOckAcCeSsTokEn",
    refreshToken: "mOckReFrEsHTokEn",
  };

  const mockRegistration: AuthUserRegister = {
    email: mockUser.email,
    password: "ballerinaCapuccina",
    username: mockUser.username,
  };

  const mockLogin: AuthUserLogin = {
    email: mockUser.email,
    password: "ballerinaCapuccina",
  };

  const userPayload: UserPayload = { id: "1", email: mockUser.email };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserRepository = createMockUserRepository();
    mockTokenService = createMockTokenService();
    authService = new AuthService(mockUserRepository, mockTokenService);
  });

  describe("registerUser", () => {
    it("should register a new user", async () => {
      mockUserRepository.getByEmailSafe.mockResolvedValueOnce(null);
      mockBunPassword.hash.mockResolvedValueOnce("hashed_password_123");
      mockUserRepository.createUser.mockResolvedValueOnce({ id: userId });
      mockUserRepository.getById.mockResolvedValueOnce(mockUser);
      mockTokenService.generateAuthTokens.mockResolvedValueOnce(mockAuthTokens);

      const result = await authService.registerUser(mockRegistration);

      expect(result).toEqual({
        ...mockUser,
        accessToken: "mOckAcCeSsTokEn",
        refreshToken: "mOckReFrEsHTokEn",
      });
      expect(mockUserRepository.getByEmailSafe).toHaveBeenCalledWith(
        "tungtungsahur@example.com",
      );
      expect(mockBunPassword.hash).toHaveBeenCalledWith("ballerinaCapuccina");
      expect(mockUserRepository.createUser).toHaveBeenCalledWith({
        ...mockRegistration,
        password: "hashed_password_123",
      });
      expect(mockUserRepository.getById).toHaveBeenCalledWith(1);
      expect(mockTokenService.generateAuthTokens).toHaveBeenCalledWith({
        id: "1",
        email: "tungtungsahur@example.com",
      });
    });

    it("should throw ValidationError if email exists", async () => {
      mockUserRepository.getByEmailSafe.mockResolvedValue(mockUser);

      await expect(authService.registerUser(mockRegistration)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should handle password hashing errors", async () => {
      mockUserRepository.getByEmailSafe.mockResolvedValue(null);
      mockBunPassword.hash.mockRejectedValue(new Error("failed hashing"));

      await expect(authService.registerUser(mockRegistration)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("userLogin", () => {
    it("should log in successfully", async () => {
      mockUserRepository.getByEmail.mockResolvedValue(userWithPassword);
      mockBunPassword.verify.mockResolvedValue(true);
      mockTokenService.generateAuthTokens.mockResolvedValue(mockAuthTokens);

      const result = await authService.userLogin(mockLogin);

      const { password, ...expectedUser } = userWithPassword;
      expect(result).toEqual({
        ...expectedUser,
        accessToken: "mOckAcCeSsTokEn",
        refreshToken: "mOckReFrEsHTokEn",
      });
      expect(mockUserRepository.getByEmail).toHaveBeenCalledWith(
        "tungtungsahur@example.com",
      );
    });

    it("should throw if password wrong", async () => {
      mockUserRepository.getByEmail.mockResolvedValue(userWithPassword);
      mockBunPassword.verify.mockResolvedValue(false);

      await expect(authService.userLogin(mockLogin)).rejects.toThrow(
        new ValidationError("invalid email or password"),
      );
      expect(mockBunPassword.verify).toHaveBeenCalledWith(
        "ballerinaCapuccina",
        "moCkHashedPassworD",
      );
    });

    it("should throw ValidationError if user not found", async () => {
      mockUserRepository.getByEmail.mockResolvedValue(null);

      await expect(authService.userLogin(mockLogin)).rejects.toThrow(
        new ValidationError("invalid email or password"),
      );
      expect(mockBunPassword.verify).not.toHaveBeenCalled();
    });

    it("should handle case-insensitive email", async () => {
      const loginDataWithUpperCase = {
        email: "TUNGTUNGSAHUR@EXAMPLE.COM",
        password: "password123",
      };
      mockUserRepository.getByEmail.mockResolvedValue(userWithPassword);
      mockBunPassword.verify.mockResolvedValue(true);
      mockTokenService.generateAuthTokens.mockResolvedValue({
        accessToken: "token",
        refreshToken: "refresh",
      });

      await authService.userLogin(loginDataWithUpperCase);

      expect(mockUserRepository.getByEmail).toHaveBeenCalledWith(
        "tungtungsahur@example.com",
      );
    });
  });

  describe("getByEmail", () => {
    it("should return user without password", async () => {
      mockUserRepository.getByEmail.mockResolvedValue(userWithPassword);

      const result = await authService.getByEmail("tungtungsahur@example.com");

      const { password, ...expectedUser } = userWithPassword;
      expect(result).toEqual(expectedUser);
      expect(mockUserRepository.getByEmail).toHaveBeenCalledWith(
        "tungtungsahur@example.com",
      );
    });

    it("should throw NotFoundError if user not found", async () => {
      mockUserRepository.getByEmail.mockResolvedValue(null);

      await expect(
        authService.getByEmail("nonexistent@example.com"),
      ).rejects.toThrow(new NotFoundError("user record not found"));
    });
  });

  describe("isEmailVerified", () => {
    it("should return verification status for verified user", async () => {
      const userId = 1;
      mockUserRepository.getById.mockResolvedValue(mockUser);

      const result = await authService.isEmailVerified(userId);

      expect(result).toEqual({ verified: true });
      expect(mockUserRepository.getById).toHaveBeenCalledWith(userId);
    });

    it("should return false for unverified user", async () => {
      const userId = 1;
      const unverifiedUser = { ...mockUser, isEmailVerified: false };
      mockUserRepository.getById.mockResolvedValue(unverifiedUser);

      const result = await authService.isEmailVerified(userId);

      expect(result).toEqual({ verified: false });
    });

    it("should throw ValidationError if user not found", async () => {
      mockUserRepository.getById.mockResolvedValue(null);

      await expect(authService.isEmailVerified(1)).rejects.toThrow(
        new ValidationError("User not found"),
      );
    });
  });

  describe("verifyUserEmail", () => {
    it("should call repository to verify user email", async () => {
      await authService.verifyUserEmail(1);

      expect(mockUserRepository.verifyUserEmail).toHaveBeenCalledWith(1);
    });
  });

  describe("token methods", () => {
    it("should create reset password token", async () => {
      mockTokenService.createResetPasswordToken.mockResolvedValue(
        "reset_token_123",
      );

      const result = await authService.createResetPasswordToken(userPayload);

      expect(result).toBe("reset_token_123");
      expect(mockTokenService.createResetPasswordToken).toHaveBeenCalledWith(
        userPayload,
      );
    });

    it("should validate and decode reset password token", async () => {
      const token = "reset_token_123";
      mockTokenService.validateResetPasswordToken.mockResolvedValue(
        userPayload,
      );

      const result = await authService.validateDecodeResetPasswordToken(token);

      expect(result).toEqual(userPayload);
      expect(mockTokenService.validateResetPasswordToken).toHaveBeenCalledWith(
        token,
      );
    });

    it("should create email verification token", async () => {
      mockTokenService.createEmailVerificationToken.mockResolvedValue(
        "verify_token_123",
      );

      const result = await authService.createEmailVerificationToken(
        userPayload,
      );

      expect(result).toBe("verify_token_123");
      expect(
        mockTokenService.createEmailVerificationToken,
      ).toHaveBeenCalledWith(userPayload);
    });

    it("should validate email verification token and verify user", async () => {
      const token = "verify_token_123";
      mockTokenService.validateEmailVerificationToken.mockResolvedValue(
        userPayload,
      );
      mockUserRepository.verifyUserEmail.mockResolvedValue(true);

      const result = await authService.validateEmailVerificationToken(token);

      expect(result).toEqual(userPayload);
      expect(
        mockTokenService.validateEmailVerificationToken,
      ).toHaveBeenCalledWith(token);
      expect(mockUserRepository.verifyUserEmail).toHaveBeenCalledWith(1);
    });

    it("should validate refresh token", async () => {
      const refreshToken = "refresh_token_123";
      mockTokenService.validateRefreshToken.mockResolvedValue(userPayload);

      const result = await authService.validateRefreshToken(refreshToken);

      expect(result).toEqual(userPayload);
      expect(mockTokenService.validateRefreshToken).toHaveBeenCalledWith(
        refreshToken,
      );
    });

    it("should generate auth tokens", async () => {
      const expectedTokens = {
        accessToken: "access_token_123",
        refreshToken: "refresh_token_123",
      };
      mockTokenService.generateAuthTokens.mockResolvedValue(expectedTokens);

      const result = await authService.generateAuthTokens(userPayload);

      expect(result).toEqual(expectedTokens);
      expect(mockTokenService.generateAuthTokens).toHaveBeenCalledWith(
        userPayload,
      );
    });
  });

  describe("changeUserPassword", () => {
    it("should successfully change user password", async () => {
      const userId = 1;
      const newPassword = "newPassword123";
      const hashedPassword = "hashed_new_password";

      mockBunPassword.hash.mockResolvedValue(hashedPassword);
      mockUserRepository.userExistsById.mockResolvedValue(true);
      mockUserRepository.updateUserPassword.mockResolvedValue(true);

      await authService.changeUserPassword(userId, newPassword);

      expect(mockBunPassword.hash).toHaveBeenCalledWith(newPassword);
      expect(mockUserRepository.userExistsById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.updateUserPassword).toHaveBeenCalledWith(
        userId,
        hashedPassword,
      );
    });

    it("should throw ValidationError if user does not exist", async () => {
      const userId = 999;
      const newPassword = "newPassword123";

      mockBunPassword.hash.mockResolvedValue("hashed_password");
      mockUserRepository.userExistsById.mockResolvedValue(false);

      await expect(
        authService.changeUserPassword(userId, newPassword),
      ).rejects.toThrow(new ValidationError("User not found"));

      expect(mockUserRepository.updateUserPassword).not.toHaveBeenCalled();
    });

    it("should throw ValidationError if password update fails", async () => {
      const userId = 1;
      const newPassword = "newPassword123";

      mockBunPassword.hash.mockResolvedValue("hashed_password");
      mockUserRepository.userExistsById.mockResolvedValue(true);
      mockUserRepository.updateUserPassword.mockResolvedValue(false);

      await expect(
        authService.changeUserPassword(userId, newPassword),
      ).rejects.toThrow(new ValidationError("Failed to update user password"));
    });
  });
});
