import { vi, type Mocked } from "vitest";
import type {
  AuthUserSafe,
  AuthUserRegister,
  AuthUserLogin,
  AuthTokens,
} from "../../src/db/types/auth.type";
import type { UserPayload } from "../../src/lib/types";
import type { ITokenService } from "../../src/services/token.service";
import type { IUserRepository } from "../../src/repositories/user.repo";

export const VALID_USER_ID = 1;
export const INVALID_USER_ID = 999;
export const VALID_EMAIL = "test@example.com";
export const INVALID_EMAIL = "nonexistent@example.com";
export const EXISTING_USERNAME = "existinguser";
export const AVAILABLE_USERNAME = "newuser";
export const VALID_PASSWORD = "ValidPassword123!";
export const INVALID_PASSWORD = "wrong";
export const HASHED_PASSWORD = "hashedPassword123";
export const ACCESS_TOKEN = "mockAccessToken";
export const REFRESH_TOKEN = "mockRefreshToken";
export const RESET_TOKEN = "mockResetToken";
export const VERIFICATION_TOKEN = "mockVerificationToken";

export const createMockUser = (
  overrides: Partial<AuthUserSafe> = {},
): AuthUserSafe => ({
  id: VALID_USER_ID,
  email: VALID_EMAIL,
  username: "testuser",
  firstName: "Test",
  lastName: "User",
  isEmailVerified: false,
  profileImage: null,
  birthDate: null,
  gender: null,
  about: null,
  bio: null,
  subscriptionType: "free",
  subscriptionStatus: "active",
  subscriptionExpiresAt: null,
  emailNotifications: true,
  monthlyReports: true,
  monthlyApplicationGoal: 30,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  ...overrides,
});

export const createMockUserWithPassword = (overrides: Partial<any> = {}) => ({
  ...createMockUser(),
  password: HASHED_PASSWORD,
  ...overrides,
});

export const createMockUserPayload = (
  overrides: Partial<UserPayload> = {},
): UserPayload => ({
  id: VALID_USER_ID.toString(),
  email: VALID_EMAIL,
  isEmailVerified: true,
  ...overrides,
});

export const createMockAuthTokens = (
  overrides: Partial<AuthTokens> = {},
): AuthTokens => ({
  accessToken: ACCESS_TOKEN,
  refreshToken: REFRESH_TOKEN,
  ...overrides,
});

export const createMockRegistration = (
  overrides: Partial<AuthUserRegister> = {},
): AuthUserRegister => ({
  email: VALID_EMAIL,
  password: VALID_PASSWORD,
  username: "testuser",
  ...overrides,
});

export const createMockLogin = (
  overrides: Partial<AuthUserLogin> = {},
): AuthUserLogin => ({
  email: VALID_EMAIL,
  password: VALID_PASSWORD,
  ...overrides,
});

export const createMockUserRepository = (): Mocked<IUserRepository> => ({
  userExistsById: vi.fn(),
  isUsernameExists: vi.fn(),
  createUser: vi.fn(),
  getByIdSafe: vi.fn(),
  getByIdWithPassword: vi.fn(),
  getByEmail: vi.fn(),
  getByEmailSafe: vi.fn(),
  updateUser: vi.fn(),
  updateEmail: vi.fn(),
  updateUsername: vi.fn(),
  updateUserPreferences: vi.fn(),
  updateUserSubscription: vi.fn(),
  verifyUserEmail: vi.fn(),
  updateUserPassword: vi.fn(),
  deleteUser: vi.fn(),
  getProfileProgressData: vi.fn(),
});

export const createMockTokenService = (): Mocked<ITokenService> => ({
  decodeToken: vi.fn(),
  createAccessToken: vi.fn(),
  createRefreshToken: vi.fn(),
  generateAuthTokens: vi.fn(),
  createResetPasswordToken: vi.fn(),
  createEmailVerificationToken: vi.fn(),
  verifyToken: vi.fn().mockResolvedValue({} as any),
  validateRefreshToken: vi.fn(),
  validateResetPasswordToken: vi.fn(),
  validateEmailVerificationToken: vi.fn(),
});

export const setupAuthServiceMocks = (
  mockUserRepository: Mocked<IUserRepository>,
  mockTokenService: Mocked<ITokenService>,
) => {
  const mockUser = createMockUser();
  const mockUserWithPassword = createMockUserWithPassword();
  const mockTokens = createMockAuthTokens();
  const mockUserPayload = createMockUserPayload();

  mockUserRepository.getByEmailSafe.mockResolvedValue(null);
  mockUserRepository.getByEmail.mockResolvedValue(mockUserWithPassword);
  mockUserRepository.getByIdSafe.mockResolvedValue(mockUser);
  mockUserRepository.createUser.mockResolvedValue(mockUser);
  mockUserRepository.userExistsById.mockResolvedValue(true);
  mockUserRepository.isUsernameExists.mockResolvedValue(false);
  mockUserRepository.verifyUserEmail.mockResolvedValue(mockUser);
  mockUserRepository.updateUserPassword.mockResolvedValue(mockUser);

  mockTokenService.generateAuthTokens.mockResolvedValue(mockTokens);
  mockTokenService.createResetPasswordToken.mockResolvedValue(RESET_TOKEN);
  mockTokenService.createEmailVerificationToken.mockResolvedValue(
    VERIFICATION_TOKEN,
  );
  mockTokenService.validateRefreshToken.mockResolvedValue(mockUserPayload);
  mockTokenService.validateResetPasswordToken.mockResolvedValue(
    mockUserPayload,
  );
  mockTokenService.validateEmailVerificationToken.mockResolvedValue(
    mockUserPayload,
  );

  return {
    mockUser,
    mockUserWithPassword,
    mockTokens,
    mockUserPayload,
  };
};

export const mockBunPassword = {
  hash: vi.fn().mockResolvedValue(HASHED_PASSWORD),
  verify: vi.fn().mockResolvedValue(true),
};

export const setupBunPasswordMock = () => {
  global.Bun = {
    password: mockBunPassword,
  } as any;
};
