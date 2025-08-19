import { vi, type Mocked } from "vitest";
import type { CvChildCrudRepository } from "../../src/repositories/cvChild.repo";

// Test Constants
export const VALID_CV_ID = 1;
export const INVALID_CV_ID = 999;
export const VALID_CHILD_ID = 1;
export const INVALID_CHILD_ID = 999;
export const NONEXISTENT_CHILD_ID = 404;

// Generic Mock Data Types
export interface MockChildSelect {
  id: number;
  cvId: number;
  name: string;
  description?: string;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockChildInsert {
  cvId: number;
  name: string;
  description?: string;
  displayOrder?: number;
}

// Mock Data Creators
export const createMockChildSelect = (
  overrides: Partial<MockChildSelect> = {},
): MockChildSelect => ({
  id: VALID_CHILD_ID,
  cvId: VALID_CV_ID,
  name: "Mock Child Item",
  description: "Mock description",
  displayOrder: 1,
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-02T00:00:00Z"),
  ...overrides,
});

export const createMockChildInsert = (
  overrides: Partial<Omit<MockChildInsert, "cvId">> = {},
): Omit<MockChildInsert, "cvId"> => ({
  name: "New Mock Child",
  description: "New mock description",
  displayOrder: 1,
  ...overrides,
});

export const createMockChildUpdate = (
  overrides: Partial<Omit<MockChildInsert, "id" | "cvId">> = {},
): Partial<Omit<MockChildInsert, "id" | "cvId">> => ({
  name: "Updated Mock Child",
  description: "Updated mock description",
  ...overrides,
});

export const createChildArray = (count: number): MockChildSelect[] =>
  Array.from({ length: count }, (_, index) =>
    createMockChildSelect({
      id: index + 1,
      name: `Mock Child ${index + 1}`,
      displayOrder: index + 1,
    }),
  );

// Repository Mock Creator
export const createMockCvChildRepository = (): Mocked<
  CvChildCrudRepository<MockChildSelect, MockChildInsert>
> => ({
  create: vi.fn(),
  getOne: vi.fn(),
  getAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  exists: vi.fn(),
});

// Mock Setup Helpers
export const setupRepositoryMocks = (
  mockRepository: Mocked<
    CvChildCrudRepository<MockChildSelect, MockChildInsert>
  >,
) => {
  const mockChild = createMockChildSelect();
  const mockChildren = createChildArray(3);

  // Default successful responses
  mockRepository.create.mockResolvedValue(mockChild);
  mockRepository.getOne.mockResolvedValue(mockChild);
  mockRepository.getAll.mockResolvedValue(mockChildren);
  mockRepository.update.mockResolvedValue(mockChild);
  mockRepository.delete.mockResolvedValue(true);
  mockRepository.exists.mockResolvedValue(true);
};

export const setupRepositoryFailures = (
  mockRepository: Mocked<
    CvChildCrudRepository<MockChildSelect, MockChildInsert>
  >,
) => {
  mockRepository.create.mockResolvedValue(null as any);
  mockRepository.getOne.mockResolvedValue(null);
  mockRepository.getAll.mockResolvedValue([]);
  mockRepository.update.mockResolvedValue(null as any);
  mockRepository.delete.mockResolvedValue(false);
  mockRepository.exists.mockResolvedValue(false);
};

export const setupRepositoryErrors = (
  mockRepository: Mocked<
    CvChildCrudRepository<MockChildSelect, MockChildInsert>
  >,
) => {
  const dbError = new Error("Database connection failed");

  mockRepository.create.mockRejectedValue(dbError);
  mockRepository.getOne.mockRejectedValue(dbError);
  mockRepository.getAll.mockRejectedValue(dbError);
  mockRepository.update.mockRejectedValue(dbError);
  mockRepository.delete.mockRejectedValue(dbError);
  mockRepository.exists.mockRejectedValue(dbError);
};

// Test Scenarios
export const TEST_SCENARIOS = {
  VALID_CREATE_DATA: createMockChildInsert(),
  VALID_UPDATE_DATA: createMockChildUpdate(),
  EMPTY_UPDATE_DATA: {},
  MINIMAL_CREATE_DATA: createMockChildInsert({
    name: "Minimal",
    description: undefined,
    displayOrder: undefined,
  }),
  LARGE_DATASET: createChildArray(100),
} as const;

// Edge Case Data
export const EDGE_CASES = {
  EMPTY_STRING_NAME: createMockChildInsert({ name: "" }),
  VERY_LONG_NAME: createMockChildInsert({ name: "A".repeat(1000) }),
  SPECIAL_CHARACTERS: createMockChildInsert({ name: "Test@#$%^&*()" }),
  UNICODE_NAME: createMockChildInsert({ name: "测试数据" }),
  NULL_DISPLAY_ORDER: createMockChildInsert({ displayOrder: undefined }),
  NEGATIVE_DISPLAY_ORDER: createMockChildInsert({ displayOrder: -1 }),
  LARGE_DISPLAY_ORDER: createMockChildInsert({ displayOrder: 999999 }),
} as const;

// Boundary Values
export const BOUNDARY_VALUES = {
  MIN_CV_ID: 1,
  MAX_CV_ID: 2147483647,
  MIN_CHILD_ID: 1,
  MAX_CHILD_ID: 2147483647,
  ZERO_CV_ID: 0,
  ZERO_CHILD_ID: 0,
  NEGATIVE_CV_ID: -1,
  NEGATIVE_CHILD_ID: -1,
} as const;
