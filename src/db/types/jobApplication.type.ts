import {
  jobApplications,
  jobApplicationStatuses,
} from "../schema/jobApplication.db";

export type JobApplicationSelect = typeof jobApplications.$inferSelect;
export type JobApplicationCreate = Omit<
  typeof jobApplications.$inferInsert,
  "userId"
>;
export type JobApplicationUpdate = Partial<
  Omit<JobApplicationCreate, "id" | "cvId" | "userId">
>;

export type JobApplicationStatusSelect =
  typeof jobApplicationStatuses.$inferSelect;
export type JobApplicationStatusInsert =
  typeof jobApplicationStatuses.$inferInsert;
export type JobApplicationStatusUpdate = Partial<
  Omit<JobApplicationCreate, "id" | "applicationId">
>;

export type JobApplicationQueryOptions = {
  search?: string;
  sortBy?: keyof JobApplicationSelect;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
  appliedAtFrom?: Date;
  appliedAtTo?: Date;
};

export type PaginatedJobApplicationResponse = {
  data: JobApplicationSelect[];
  total: number;
  limit: number;
  offset: number;
};
