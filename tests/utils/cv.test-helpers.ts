import { vi, type Mocked } from "vitest";
import type {
  CvSelect,
  CvInsert,
  CvUpdate,
  CvQueryOptions,
  PaginatedCvResponse,
  CvMinimalSelect,
  CompleteCvResponse,
  CvStats,
} from "../../src/db/types/cv.type";
import type { ICvRepository } from "../../src/repositories/cv.repo";
import type { ContactRepository } from "../../src/repositories/cvChildren/contact.repo";
import type { EducationRepository } from "../../src/repositories/cvChildren/education.repo";
import type { WorkRepository } from "../../src/repositories/cvChildren/work.repo";
import type { ProjectRepository } from "../../src/repositories/cvChildren/project.repo";
import type { OrganizationRepository } from "../../src/repositories/cvChildren/organization.repo";
import type { CourseRepository } from "../../src/repositories/cvChildren/course.repo";
import type { SkillRepository } from "../../src/repositories/cvChildren/skill.repo";
import type { LanguageRepository } from "../../src/repositories/cvChildren/language.repo";

export const VALID_USER_ID = 1;
export const INVALID_USER_ID = 999;
export const VALID_CV_ID = 1;
export const INVALID_CV_ID = 999;
export const VALID_USERNAME = "johndoe";
export const INVALID_USERNAME = "nonexistent";
export const VALID_SLUG = "software-engineer-cv";
export const INVALID_SLUG = "nonexistent-cv";
export const AVAILABLE_SLUG = "new-cv-slug";
export const TAKEN_SLUG = "existing-cv-slug";

export const createMockCv = (overrides: Partial<CvSelect> = {}): CvSelect => ({
  id: VALID_CV_ID,
  userId: VALID_USER_ID,
  title: "Software Engineer CV",
  description: "Comprehensive CV for software engineering position",
  isPublic: false,
  language: "en",
  theme: "default",
  slug: VALID_SLUG,
  views: 100,
  downloads: 50,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-02"),
  ...overrides,
});

export const createMockPublicCv = (
  overrides: Partial<CvSelect> = {},
): CvSelect =>
  createMockCv({
    isPublic: true,
    views: 250,
    downloads: 125,
    ...overrides,
  });

export const createMockPrivateCv = (
  overrides: Partial<CvSelect> = {},
): CvSelect =>
  createMockCv({
    isPublic: false,
    views: 0,
    downloads: 0,
    slug: null,
    ...overrides,
  });

export const createMockCvInsert = (
  overrides: Partial<Omit<CvInsert, "userId">> = {},
): Omit<CvInsert, "userId"> => ({
  title: "Software Engineer CV",
  description: "Comprehensive CV for software engineering position",
  isPublic: false,
  language: "en",
  theme: "default",
  slug: undefined,
  ...overrides,
});

export const createMockCvUpdate = (
  overrides: Partial<CvUpdate> = {},
): CvUpdate => ({
  title: "Updated CV Title",
  description: "Updated CV description",
  isPublic: true,
  slug: undefined,
  ...overrides,
});

export const createMockCvQueryOptions = (
  overrides: Partial<CvQueryOptions> = {},
): CvQueryOptions => ({
  search: "engineer",
  sortBy: "title",
  sortOrder: "asc",
  limit: 10,
  offset: 0,
  isPublic: true,
  ...overrides,
});

export const createMockPaginatedCvResponse = (
  data: CvSelect[] = [createMockCv()],
  overrides: Partial<PaginatedCvResponse> = {},
): PaginatedCvResponse => ({
  data,
  total: data.length,
  limit: 10,
  offset: 0,
  ...overrides,
});

export const createMockCvMinimal = (
  overrides: Partial<CvMinimalSelect> = {},
): CvMinimalSelect => ({
  id: VALID_CV_ID,
  title: "Software Engineer CV",
  description: "Comprehensive CV for software engineering position",
  isPublic: true,
  views: 100,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-02"),
  ...overrides,
});

export const createMockCompleteCvResponse = (
  overrides: Partial<CompleteCvResponse> = {},
): CompleteCvResponse => ({
  id: VALID_CV_ID,
  title: "Software Engineer CV",
  description: "Comprehensive CV for software engineering position",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-02"),
  views: 101,
  contacts: [],
  educations: [],
  works: [],
  projects: [],
  organizations: [],
  courses: [],
  skills: [],
  languages: [],
  ...overrides,
});

export const createMockCvStats = (
  overrides: Partial<CvStats> = {},
): CvStats => ({
  totalViews: 500,
  totalDownloads: 250,
  totalCvs: 5,
  ...overrides,
});

export const createCvArray = (count: number): CvSelect[] =>
  Array.from({ length: count }, (_, index) =>
    createMockCv({
      id: index + 1,
      title: `CV ${index + 1}`,
      description: `Description for CV ${index + 1}`,
    }),
  );

export const createMockCvRepository = (): Mocked<ICvRepository> => ({
  createCv: vi.fn(),
  getCvForUser: vi.fn(),
  getCvById: vi.fn(),
  getAllCvForUser: vi.fn(),
  updateCvForUser: vi.fn(),
  deleteCvForUser: vi.fn(),
  getCvByUsernameAndSlug: vi.fn(),
  incrementViews: vi.fn(),
  incrementDownloads: vi.fn(),
  checkSlugAvailability: vi.fn(),
  getPopularCvs: vi.fn(),
  getUserCvStats: vi.fn(),
});

export const createMockContactRepository = (): Mocked<ContactRepository> =>
  ({
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updateDisplayOrder: vi.fn(),
    bulkUpdateDisplayOrder: vi.fn(),
  } as any);

export const createMockEducationRepository = (): Mocked<EducationRepository> =>
  ({
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updateDisplayOrder: vi.fn(),
    bulkUpdateDisplayOrder: vi.fn(),
  } as any);

export const createMockWorkRepository = (): Mocked<WorkRepository> =>
  ({
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updateDisplayOrder: vi.fn(),
    bulkUpdateDisplayOrder: vi.fn(),
  } as any);

export const createMockProjectRepository = (): Mocked<ProjectRepository> =>
  ({
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updateDisplayOrder: vi.fn(),
    bulkUpdateDisplayOrder: vi.fn(),
  } as any);

export const createMockOrganizationRepository =
  (): Mocked<OrganizationRepository> =>
    ({
      getAll: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      updateDisplayOrder: vi.fn(),
      bulkUpdateDisplayOrder: vi.fn(),
    } as any);

export const createMockCourseRepository = (): Mocked<CourseRepository> =>
  ({
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updateDisplayOrder: vi.fn(),
    bulkUpdateDisplayOrder: vi.fn(),
  } as any);

export const createMockSkillRepository = (): Mocked<SkillRepository> =>
  ({
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updateDisplayOrder: vi.fn(),
    bulkUpdateDisplayOrder: vi.fn(),
  } as any);

export const createMockLanguageRepository = (): Mocked<LanguageRepository> =>
  ({
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updateDisplayOrder: vi.fn(),
    bulkUpdateDisplayOrder: vi.fn(),
  } as any);

export const setupCvRepositoryMocks = (mockRepo: Mocked<ICvRepository>) => {
  const mockCv = createMockCv();
  const mockPaginated = createMockPaginatedCvResponse();
  const mockStats = createMockCvStats();

  mockRepo.createCv.mockResolvedValue(mockCv);
  mockRepo.getCvForUser.mockResolvedValue(mockCv);
  mockRepo.getCvById.mockResolvedValue(mockCv);
  mockRepo.getAllCvForUser.mockResolvedValue(mockPaginated);
  mockRepo.updateCvForUser.mockResolvedValue(mockCv);
  mockRepo.deleteCvForUser.mockResolvedValue(true);
  mockRepo.getCvByUsernameAndSlug.mockResolvedValue(createMockCvMinimal());
  mockRepo.incrementViews.mockResolvedValue();
  mockRepo.incrementDownloads.mockResolvedValue();
  mockRepo.checkSlugAvailability.mockResolvedValue(true);
  mockRepo.getPopularCvs.mockResolvedValue([mockCv]);
  mockRepo.getUserCvStats.mockResolvedValue(mockStats);

  return {
    mockCv,
    mockPaginated,
    mockStats,
  };
};

export const setupChildRepositoryMocks = (
  contactRepo: Mocked<ContactRepository>,
  educationRepo: Mocked<EducationRepository>,
  workRepo: Mocked<WorkRepository>,
  projectRepo: Mocked<ProjectRepository>,
  organizationRepo: Mocked<OrganizationRepository>,
  courseRepo: Mocked<CourseRepository>,
  skillRepo: Mocked<SkillRepository>,
  languageRepo: Mocked<LanguageRepository>,
) => {
  contactRepo.getAll.mockResolvedValue([]);
  educationRepo.getAll.mockResolvedValue([]);
  workRepo.getAll.mockResolvedValue([]);
  projectRepo.getAll.mockResolvedValue([]);
  organizationRepo.getAll.mockResolvedValue([]);
  courseRepo.getAll.mockResolvedValue([]);
  skillRepo.getAll.mockResolvedValue([]);
  languageRepo.getAll.mockResolvedValue([]);
};

export const createFutureDate = (daysFromNow: number = 30): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

export const createPastDate = (daysAgo: number = 30): Date => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};
