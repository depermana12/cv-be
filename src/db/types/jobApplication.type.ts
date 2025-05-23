import { jobApplications } from "../schema/jobApplication.db";

export type JobApplicationSelect = typeof jobApplications.$inferSelect;
export type JobApplicationInsert = typeof jobApplications.$inferInsert;
export type JobApplicationUpdate = Partial<
  Omit<JobApplicationInsert, "id" | "cvId" | "userId">
>;
