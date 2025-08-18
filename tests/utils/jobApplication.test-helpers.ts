import { vi, type Mocked } from "vitest";
import type {
  JobApplicationSelect,
  JobApplicationCreate,
  JobApplicationUpdate,
  JobApplicationStatusSelect,
  JobApplicationQueryOptions,
  PaginatedJobApplicationResponse,
} from "../../src/db/types/jobApplication.type";
import type { IJobApplication } from "../../src/repositories/jobApplication.repo";
import type { IJobApplicationStatus } from "../../src/repositories/jobApplicationStatus.repo";

export const VALID_USER_ID = 1;
export const INVALID_USER_ID = 999;
export const VALID_JOB_ID = 1;
export const INVALID_JOB_ID = 999;
export const VALID_CV_ID = 1;

export const createMockJobApplicationData = (
  overrides: Partial<Omit<JobApplicationCreate, "userId">> = {},
): Omit<JobApplicationCreate, "userId"> => ({
  companyName: "TechCorp Ltd",
  jobTitle: "Software Engineer",
  jobType: "Full-time",
  position: "Mid-level",
  location: "San Francisco, CA",
  locationType: "Remote",
  status: "applied",
  jobPortal: "LinkedIn",
  jobUrl: "https://linkedin.com/jobs/12345",
  cvId: VALID_CV_ID,
  notes: "Great opportunity in tech",
  appliedAt: new Date("2025-01-15"),
  ...overrides,
});

export const createMockJobApplication = (
  overrides: Partial<JobApplicationSelect> = {},
): JobApplicationSelect => ({
  id: VALID_JOB_ID,
  userId: VALID_USER_ID,
  companyName: "TechCorp Ltd",
  jobTitle: "Software Engineer",
  jobType: "Full-time",
  position: "Mid-level",
  location: "San Francisco, CA",
  locationType: "Remote",
  status: "applied",
  jobPortal: "LinkedIn",
  jobUrl: "https://linkedin.com/jobs/12345",
  cvId: VALID_CV_ID,
  notes: "Great opportunity in tech",
  appliedAt: new Date("2025-01-15"),
  createdAt: new Date("2025-01-15"),
  updatedAt: new Date("2025-01-15"),
  ...overrides,
});

export const createMockJobApplicationUpdate = (
  overrides: Partial<JobApplicationUpdate> = {},
): JobApplicationUpdate => ({
  companyName: "Updated Company",
  jobTitle: "Senior Software Engineer",
  status: "interview",
  notes: "Updated notes",
  ...overrides,
});

export const createMockJobApplicationStatus = (
  overrides: Partial<JobApplicationStatusSelect> = {},
): JobApplicationStatusSelect => ({
  id: 1,
  applicationId: VALID_JOB_ID,
  status: "applied",
  changedAt: new Date("2025-01-15"),
  ...overrides,
});

export const createMockQueryOptions = (
  overrides: Partial<JobApplicationQueryOptions> = {},
): JobApplicationQueryOptions => ({
  search: "engineer",
  sortBy: "appliedAt",
  sortOrder: "desc",
  limit: 10,
  offset: 0,
  ...overrides,
});

export const createMockPaginatedResponse = (
  data: JobApplicationSelect[] = [createMockJobApplication()],
  overrides: Partial<PaginatedJobApplicationResponse> = {},
): PaginatedJobApplicationResponse => ({
  data,
  total: data.length,
  limit: 10,
  offset: 0,
  ...overrides,
});

export const createMockJobApplicationRepository =
  (): Mocked<IJobApplication> => ({
    create: vi.fn(),
    getByIdAndUser: vi.fn(),
    getAllByUser: vi.fn(),
    updateByIdAndUser: vi.fn(),
    deleteByIdAndUser: vi.fn(),
  });

export const createMockJobApplicationStatusRepository =
  (): Mocked<IJobApplicationStatus> => ({
    getStatuses: vi.fn(),
    addStatus: vi.fn(),
    updateStatus: vi.fn(),
    deleteStatuses: vi.fn(),
  });

export const setupJobApplicationMocks = (
  mockJobRepo: Mocked<IJobApplication>,
  mockStatusRepo: Mocked<IJobApplicationStatus>,
) => {
  const mockJobApp = createMockJobApplication();
  const mockStatus = createMockJobApplicationStatus();
  const mockPaginated = createMockPaginatedResponse();

  mockJobRepo.create.mockResolvedValue(mockJobApp);
  mockJobRepo.getByIdAndUser.mockResolvedValue(mockJobApp);
  mockJobRepo.getAllByUser.mockResolvedValue(mockPaginated);
  mockJobRepo.updateByIdAndUser.mockResolvedValue(mockJobApp);
  mockJobRepo.deleteByIdAndUser.mockResolvedValue(true);

  mockStatusRepo.getStatuses.mockResolvedValue([mockStatus]);
  mockStatusRepo.addStatus.mockResolvedValue(mockStatus);
  mockStatusRepo.updateStatus.mockResolvedValue(mockStatus);
  mockStatusRepo.deleteStatuses.mockResolvedValue(true);

  return {
    mockJobApp,
    mockStatus,
    mockPaginated,
  };
};

export const createMinimalJobApplicationData = (): Omit<
  JobApplicationCreate,
  "userId"
> => ({
  companyName: "Minimal Corp",
  jobTitle: "Developer",
  jobPortal: "LinkedIn",
  jobType: "Full-time",
  position: "Mid-level",
  locationType: "Remote",
  appliedAt: new Date(),
});

export const createFullJobApplicationData = (): Omit<
  JobApplicationCreate,
  "userId"
> => ({
  companyName: "Full Corp Ltd",
  jobTitle: "Senior Full Stack Developer",
  jobType: "Contract",
  position: "Senior",
  location: "New York, NY",
  locationType: "Hybrid",
  status: "interview",
  jobPortal: "Indeed",
  jobUrl: "https://indeed.com/jobs/67890",
  cvId: VALID_CV_ID,
  notes: "Comprehensive opportunity with excellent benefits",
  appliedAt: new Date("2025-02-01"),
});

export const createJobApplicationsArray = (
  count: number = 3,
): JobApplicationSelect[] =>
  Array.from({ length: count }, (_, i) =>
    createMockJobApplication({
      id: i + 1,
      companyName: `Company ${i + 1}`,
      jobTitle: `Position ${i + 1}`,
    }),
  );

export const createFutureDate = (days: number = 7): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export const createPastDate = (days: number = 7): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export const createInvalidJobApplicationData = (): Partial<
  Omit<JobApplicationCreate, "userId">
> => ({
  companyName: "",
  jobTitle: "",
  jobType: "invalid-type" as any,
  status: "invalid-status" as any,
});
