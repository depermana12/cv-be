import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./user.db";
import { cv } from "./cv.db";
import { relations } from "drizzle-orm";

export const jobTypeEnum = pgEnum("job_type", [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
  "Volunteer",
]);
export const positionEnum = pgEnum("position", [
  "Manager",
  "Lead",
  "Senior",
  "Mid-level",
  "Junior",
  "Intern",
  "Entry-level",
  "Staff",
  "Other",
]);
export const locationTypeEnum = pgEnum("location_type", [
  "Remote",
  "On-site",
  "Hybrid",
]);
export const statusEnum = pgEnum("status", [
  "applied",
  "interview",
  "offer",
  "rejected",
  "accepted",
  "ghosted",
]);

export const jobApplications = pgTable(
  "job_applications",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    cvId: integer("cv_id").references(() => cv.id, { onDelete: "set null" }),
    jobPortal: varchar("job_portal", { length: 100 }).notNull(),
    jobUrl: varchar("job_url", { length: 255 }),
    companyName: varchar("company_name", { length: 255 }).notNull(),
    jobTitle: varchar("job_title", { length: 255 }).notNull(),
    jobType: jobTypeEnum("job_type").notNull(),
    position: positionEnum("position").notNull(),
    location: varchar("location", { length: 255 }),
    locationType: locationTypeEnum("location_type").notNull(),
    status: statusEnum("status").default("applied").notNull(),
    notes: text("notes"),
    appliedAt: timestamp("applied_at").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (t) => [index("idx_user_id").on(t.userId), index("idx_cv_id").on(t.cvId)],
);

export const jobApplicationStatuses = pgTable("job_application_statuses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  applicationId: integer("application_id")
    .notNull()
    .references(() => jobApplications.id, { onDelete: "cascade" }),
  status: statusEnum("status").notNull(),
  changedAt: timestamp("changed_at").notNull(),
});

export const jobApplicationRelations = relations(
  jobApplications,
  ({ one, many }) => ({
    user: one(users, {
      fields: [jobApplications.userId],
      references: [users.id],
    }),
    cv: one(cv, {
      fields: [jobApplications.cvId],
      references: [cv.id],
    }),
    status: many(jobApplicationStatuses),
  }),
);

export const jobApplicationStatusesRelations = relations(
  jobApplicationStatuses,
  ({ one }) => ({
    jobApplication: one(jobApplications, {
      fields: [jobApplicationStatuses.applicationId],
      references: [jobApplications.id],
    }),
  }),
);
