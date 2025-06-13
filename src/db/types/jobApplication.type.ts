import { jobApplications } from "../schema/jobApplication.db";

export type JobApplicationSelect = typeof jobApplications.$inferSelect;
export type JobApplicationInsert = typeof jobApplications.$inferInsert;
export type JobApplicationUpdate = Partial<
  Omit<JobApplicationInsert, "id" | "cvId" | "userId">
>;

export type JobApplicationQueryOptions = {
  search?: string;
  sortBy?: keyof JobApplicationSelect;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
};

export type PaginatedJobApplicationResponse = {
  data: JobApplicationSelect[];
  total: number;
  limit: number;
  offset: number;
};
