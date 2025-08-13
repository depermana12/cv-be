import { vi, type Mocked } from "vitest";
import type { AuthUserSafe, UserStats } from "../../src/db/types/auth.type";
import type {
  UpdateUserProfileSafe,
  UpdateUserPreferencesSafe,
  UpdateUserSubscriptionSafe,
  UserProfileProgressRes,
} from "../../src/db/types/user.type";
import type { IUserRepository } from "../../src/repositories/user.repo";
import type { IUserService } from "../../src/services/user.service";
import type { CvService } from "../../src/services/cv.service";
import type { IJobApplicationService } from "../../src/services/jobApplication.service";

export const VALID_USER_ID = 1;
export const INVALID_USER_ID = 999;
export const EXISTING_USERNAME = "existinguser";
export const AVAILABLE_USERNAME = "newuser";
export const VALID_EMAIL = "test@example.com";
export const NEW_EMAIL = "newemail@example.com";
export const INVALID_EMAIL = "nonexistent@example.com";

export const createMockUser = (
  overrides: Partial<AuthUserSafe> = {},
): AuthUserSafe => ({
  id: VALID_USER_ID,
  email: VALID_EMAIL,
  username: "deepsea",
  firstName: "Deep",
  lastName: "Sea",
  isEmailVerified: true,
  profileImage: null,
  birthDate: null,
  gender: null,
  about: null,
  bio: null,
  monthlyApplicationGoal: 30,
  emailNotifications: true,
  monthlyReports: true,
  subscriptionType: "free",
  subscriptionStatus: "active",
  subscriptionExpiresAt: null,
  createdAt: new Date("2025-07-12"),
  updatedAt: new Date("2025-07-12"),
  ...overrides,
});

export const createMockUserWithPassword = (overrides: Partial<any> = {}) => ({
  ...createMockUser(),
  password: "hashedPassword123",
  ...overrides,
});

export const createMockUserStats = (
  overrides: Partial<UserStats> = {},
): UserStats => ({
  user: createMockUser(),
  accountAge: 365,
  isEmailVerified: true,
  cvCreated: 3,
  totalJobApplications: 15,
  ...overrides,
});

export const createMockProfileProgress = (
  overrides: Partial<UserProfileProgressRes> = {},
): UserProfileProgressRes => ({
  totalFields: 7,
  filledFields: 4,
  progressPercentage: 57,
  emptyFieldNames: ["profileImage", "birthDate", "about"],
  ...overrides,
});

export const createUpdateProfileData = (
  overrides: Partial<UpdateUserProfileSafe> = {},
): UpdateUserProfileSafe => ({
  firstName: "Jane",
  lastName: "Smith",
  ...overrides,
});

export const createUpdatePreferencesData = (
  overrides: Partial<UpdateUserPreferencesSafe> = {},
): UpdateUserPreferencesSafe => ({
  emailNotifications: false,
  monthlyReports: true,
  ...overrides,
});

export const createUpdateSubscriptionData = (
  overrides: Partial<UpdateUserSubscriptionSafe> = {},
): UpdateUserSubscriptionSafe => {
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 1);

  return {
    subscriptionType: "pro",
    subscriptionStatus: "active",
    subscriptionExpiresAt: futureDate,
    ...overrides,
  };
};

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

export const createMockCvService = () =>
  ({
    getAllCvs: vi.fn(),
    getUserCvCount: vi.fn(),
  } as any);

export const createMockJobApplicationService = () =>
  ({
    getAllJobApplications: vi.fn(),
  } as any);

export const createMockUserService = (): Mocked<IUserService> => ({
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
});

export const createMockJwtPayload = (overrides: Partial<any> = {}) => ({
  id: "1",
  email: VALID_EMAIL,
  isEmailVerified: true,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
  ...overrides,
});

export const setupUserRepositoryMocks = (mockRepo: Mocked<IUserRepository>) => {
  mockRepo.getByIdSafe.mockResolvedValue(createMockUser());
  mockRepo.getByEmail.mockResolvedValue(createMockUserWithPassword());
  mockRepo.getByEmailSafe.mockResolvedValue(createMockUser());
  mockRepo.updateUser.mockResolvedValue(createMockUser());
  mockRepo.updateEmail.mockResolvedValue(createMockUser());
  mockRepo.updateUsername.mockResolvedValue(createMockUser());
  mockRepo.updateUserPreferences.mockResolvedValue(createMockUser());
  mockRepo.updateUserSubscription.mockResolvedValue(createMockUser());
  mockRepo.isUsernameExists.mockResolvedValue(false);
  mockRepo.deleteUser.mockResolvedValue(true);
  mockRepo.getByIdWithPassword.mockResolvedValue(createMockUserWithPassword());
  mockRepo.getProfileProgressData.mockResolvedValue({
    profileImage: null,
    birthDate: null,
    firstName: "John",
    lastName: "Doe",
    about: null,
    bio: "Software developer",
    gender: "male",
  });
};

export const setupCvServiceMocks = (mockService: any) => {
  mockService.getAllCvs.mockResolvedValue({
    data: [],
    total: 3,
    limit: 1,
    offset: 0,
  });
};

export const setupJobApplicationServiceMocks = (mockService: any) => {
  mockService.getAllJobApplications.mockResolvedValue({
    data: [],
    total: 15,
    limit: 1,
    offset: 0,
  });
};
