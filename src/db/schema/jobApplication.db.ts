import {
  datetime,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { users } from "./user.db";
import { cv } from "./cv.db";
import { relations } from "drizzle-orm";

export const jobApplications = mysqlTable(
  "job_applications",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    cvId: int("cv_id").references(() => cv.id, { onDelete: "set null" }),
    jobPortal: varchar("job_portal", { length: 100 }).notNull(),
    jobUrl: varchar("job_url", { length: 255 }),
    companyName: varchar("company_name", { length: 255 }).notNull(),
    jobTitle: varchar("job_title", { length: 255 }).notNull(),
    jobType: mysqlEnum("job_type", [
      "Full-time",
      "Part-time",
      "Contract",
      "Internship",
      "Freelance",
      "Volunteer",
    ]).notNull(),
    position: mysqlEnum("position", [
      "Manager",
      "Lead",
      "Senior",
      "Mid-level",
      "Junior",
      "Intern",
      "Entry-level",
      "Staff",
      "Other",
    ]).notNull(),
    location: varchar("location", { length: 255 }),
    locationType: mysqlEnum("location_type", [
      "Remote",
      "On-site",
      "Hybrid",
    ]).notNull(),
    status: mysqlEnum("status", [
      "applied",
      "interview",
      "offer",
      "rejected",
      "accepted",
      "ghosted",
    ])
      .default("applied")
      .notNull(),
    notes: text("notes"),
    appliedAt: datetime("applied_at").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").onUpdateNow(),
  },
  (t) => [index("idx_user_id").on(t.userId), index("idx_cv_id").on(t.cvId)],
);

export const jobApplicationStatuses = mysqlTable("job_application_statuses", {
  id: int("id").primaryKey().autoincrement(),
  applicationId: int("application_id")
    .notNull()
    .references(() => jobApplications.id, { onDelete: "cascade" }),
  status: mysqlEnum("status", [
    "applied",
    "interview",
    "offer",
    "rejected",
    "accepted",
    "ghosted",
  ]).notNull(),
  changedAt: datetime("changed_at").notNull(),
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
