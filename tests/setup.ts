import { beforeAll, afterAll, beforeEach, vi } from "vitest";
import { config } from "../src/config/index.js";

// Check if this is an E2E test
const isE2eTest = process.env.NODE_ENV === "test" && config.isTest;
if (isE2eTest) {
  const { testDb } = await import("./utils/test-db.js");

  beforeEach(async () => {
    await testDb.cleanup();
  });

  afterAll(async () => {
    console.log("clean up e2e test environment...");
    await testDb.cleanup();
    await testDb.close();
  });
}

// Mock console to reduce noise in tests (for unit tests)
if (!isE2eTest) {
  const originalConsole = console;
  beforeAll(() => {
    global.console = {
      ...originalConsole,
      log: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      // Keep error for debugging
      error: originalConsole.error,
    };
  });

  afterAll(() => {
    global.console = originalConsole;
  });
}

export const createTestUser = () => ({
  email: `test-${Date.now()}@example.com`,
  password: "Test123!",
  firstName: "Test",
  lastName: "User",
  isEmailVerified: true,
});

export const createTestProfile = (userId: number) => ({
  userId,
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+1234567890",
  summary: "Test summary",
  title: "Software Developer",
});

export const createTestWork = (profileId: number) => ({
  profileId,
  company: "Test Company",
  position: "Developer",
  startDate: new Date("2020-01-01"),
  endDate: new Date("2023-01-01"),
  isCurrentJob: false,
});

export const createTestProject = (profileId: number) => ({
  profileId,
  name: "Test Project",
  description: "A test project",
  startDate: new Date("2022-01-01"),
  endDate: new Date("2022-12-31"),
  url: "https://example.com",
  repositoryUrl: "https://github.com/test/repo",
});

export const mockJwtPayload = {
  sub: "1",
  email: "test@example.com",
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
};

export const createAuthContext = (userId = 1) => ({
  get: vi.fn(() => ({
    user: { id: userId, email: "test@example.com" },
  })),
});

export const mockDb = {
  query: {
    users: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    profiles: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    works: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({
      $returningId: vi.fn().mockResolvedValue([{ id: 1 }]),
    }),
  }),
  update: vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([{ id: 1 }]),
    }),
  }),
  delete: vi.fn().mockReturnValue({
    where: vi.fn().mockResolvedValue([{ id: 1 }]),
  }),
};
