import { describe, it, expect, vi, beforeEach, type Mocked } from "vitest";
import { UserService } from "../../src/services/user.service";
import { NotFoundError } from "../../src/errors/not-found.error";
import type { AuthUserSafe } from "../../src/db/types/auth.type";
import type { UpdateUserProfileSafe } from "../../src/db/types/user.type";
import type { IUserRepository } from "../../src/repositories/user.repo";

export function createMockUserRepository(): Mocked<IUserRepository> {
  return {
    userExistsById: vi.fn(),
    isUsernameExists: vi.fn(),
    createUser: vi.fn(),
    getById: vi.fn(),
    getByEmail: vi.fn(),
    getByEmailSafe: vi.fn(),
    updateUser: vi.fn(),
    verifyUserEmail: vi.fn(),
    updateUserPassword: vi.fn(),
    deleteUser: vi.fn(),
  };
}

const mockUser: AuthUserSafe = {
  id: 1,
  email: "test@example.com",
  username: "johndoe",
  firstName: "John",
  lastName: "Doe",
  isEmailVerified: true,
  profileImage: null,
  birthDate: null,
  gender: null,
  createdAt: new Date("2023-01-01"),
  updatedAt: new Date("2023-01-01"),
};

describe("UserService", () => {
  let userService: UserService;
  let mockUserRepository: Mocked<IUserRepository>;
  let mockCvService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserRepository = createMockUserRepository();

    mockCvService = {
      getUserCvCount: vi.fn(),
    };

    userService = new UserService(mockUserRepository, mockCvService);
  });

  describe("getUserByIdSafe", () => {
    it("should return user without password", async () => {
      mockUserRepository.getById.mockResolvedValue(mockUser);

      const result = await userService.getUserByIdSafe(1);
      expect(result).toEqual(mockUser);
      expect(result).not.toHaveProperty("password");
    });

    it("should throw NotFoundError if not found", async () => {
      mockUserRepository.getById.mockResolvedValue(null);

      await expect(userService.getUserByIdSafe(999)).rejects.toThrow(
        new NotFoundError("user record not found"),
      );

      expect(mockUserRepository.getById).toHaveBeenCalledWith(999);
    });
  });

  describe("getUserByEmail", () => {
    it("should return user without password", async () => {
      const userWithPassword = { ...mockUser, password: "hashedPassword" };
      mockUserRepository.getByEmail.mockResolvedValue(userWithPassword);

      const result = await userService.getUserByEmail("test@example.com");

      const { password, ...expectedUser } = userWithPassword;
      expect(result).toEqual(expectedUser);
      expect(result).not.toHaveProperty("password");
      expect(mockUserRepository.getByEmail).toHaveBeenCalledWith(
        "test@example.com",
      );
    });

    it("should normalize email case", async () => {
      const userWithPassword = { ...mockUser, password: "hashedPassword" };
      mockUserRepository.getByEmail.mockResolvedValue(userWithPassword);

      await userService.getUserByEmail("TEST@EXAMPLE.COM");

      expect(mockUserRepository.getByEmail).toHaveBeenCalledWith(
        "test@example.com",
      );
    });

    it("should throw NotFoundError if email not found", async () => {
      mockUserRepository.getByEmail.mockResolvedValue(null);

      await expect(
        userService.getUserByEmail("nonexistent@example.com"),
      ).rejects.toThrow(new NotFoundError("user record not found"));
    });
  });

  describe("getUserByEmailSafe", () => {
    it("should return user without password", async () => {
      mockUserRepository.getByEmailSafe.mockResolvedValue(mockUser);

      const result = await userService.getUserByEmailSafe("test@example.com");

      expect(result).toEqual(mockUser);
      expect(result).not.toHaveProperty("password");
      expect(mockUserRepository.getByEmailSafe).toHaveBeenCalledWith(
        "test@example.com",
      );
    });

    it("should throw NotFoundError if not found", async () => {
      mockUserRepository.getByEmailSafe.mockResolvedValue(null);

      await expect(
        userService.getUserByEmailSafe("nonexistent@example.com"),
      ).rejects.toThrow(new NotFoundError("user record not found"));
    });
  });

  describe("updateUserProfile", () => {
    it("should update user profile successfully", async () => {
      const userId = 1;
      const updateData: UpdateUserProfileSafe = {
        firstName: "Bob",
      };
      mockUserRepository.updateUser.mockResolvedValue(true);
      mockUserRepository.getById.mockResolvedValue({
        ...mockUser,
        ...updateData,
      });

      const result = await userService.updateUserProfile(userId, updateData);

      expect(result.firstName).toBe("Bob");
      expect(mockUserRepository.getById).toHaveBeenCalledWith(userId);
    });

    it("should throw NotFoundError if update fails", async () => {
      const userId = 1;
      mockUserRepository.updateUser.mockResolvedValue(false);

      await expect(
        userService.updateUserProfile(userId, { firstName: "Depe" }),
      ).rejects.toThrow(new NotFoundError("user record not found"));

      expect(mockUserRepository.updateUser).toHaveBeenCalledWith(userId, {
        firstName: "Depe",
      });
    });
  });

  describe("isUserEmailVerified", () => {
    it.each([
      [true, { verified: true }],
      [false, { verified: false }],
      [null, { verified: false }],
    ])(
      "should return %s when email verification status is %j",
      async (isEmailVerified, expected) => {
        mockUserRepository.getById.mockResolvedValueOnce({
          ...mockUser,
          isEmailVerified,
        });
        const result = await userService.isUserEmailVerified(1);
        expect(result).toEqual(expected);
      },
    );
  });

  describe("isUsernameExists", () => {
    it("should return true if username exists", async () => {
      mockUserRepository.isUsernameExists.mockResolvedValue(true);

      const result = await userService.isUsernameExists("existinguser");

      expect(result).toBe(true);
      expect(mockUserRepository.isUsernameExists).toHaveBeenCalledWith(
        "existinguser",
      );
    });

    it("should return false if username does not exist", async () => {
      mockUserRepository.isUsernameExists.mockResolvedValue(false);

      const result = await userService.isUsernameExists("newuser");

      expect(result).toBe(false);
      expect(mockUserRepository.isUsernameExists).toHaveBeenCalledWith(
        "newuser",
      );
    });
  });

  describe("getUserStats", () => {
    it("should return complete user statistics", async () => {
      mockUserRepository.getById.mockResolvedValue(mockUser);
      mockCvService.getUserCvCount.mockResolvedValue(3);

      const result = await userService.getUserStats(1);

      expect(result).toEqual({
        user: mockUser,
        accountAge: expect.any(Number),
        isEmailVerified: true,
        cvCreated: 3,
      });

      expect(mockUserRepository.getById).toHaveBeenCalledWith(1);
      expect(mockCvService.getUserCvCount).toHaveBeenCalledWith(1);
    });

    it("should calculate account age correctly", async () => {
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - 30); // 30 days ago
      mockUserRepository.getById.mockResolvedValue({
        ...mockUser,
        createdAt: createdDate,
      });
      mockCvService.getUserCvCount.mockResolvedValue(0);

      const result = await userService.getUserStats(1);

      expect(result.accountAge).toBeGreaterThanOrEqual(29);
      expect(result.accountAge).toBeLessThanOrEqual(31);
    });

    it("should handle new user with no CVs", async () => {
      const newUser: AuthUserSafe = {
        id: 2,
        email: "newuser@example.com",
        username: "newuser",
        firstName: "New",
        lastName: "User",
        isEmailVerified: false,
        profileImage: null,
        birthDate: null,
        gender: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.getById.mockResolvedValue(newUser);
      mockCvService.getUserCvCount.mockResolvedValue(0);

      const result = await userService.getUserStats(2);

      expect(result).toEqual({
        user: newUser,
        accountAge: 0,
        isEmailVerified: false,
        cvCreated: 0,
      });
    });
  });

  describe("private methods integration", () => {
    it("should correctly integrate getUserCvCount", async () => {
      const expectedCvCount = 5;

      mockUserRepository.getById.mockResolvedValue(mockUser);
      mockCvService.getUserCvCount.mockResolvedValue(expectedCvCount);

      const result = await userService.getUserStats(1);

      expect(result.cvCreated).toBe(expectedCvCount);
      expect(mockCvService.getUserCvCount).toHaveBeenCalledWith(1);
    });
  });
});
