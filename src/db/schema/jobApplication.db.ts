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
    jobPortal: varchar("job_portal", { length: 100 }),
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
    ]),
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
    ]),
    location: varchar("location", { length: 255 }),
    locationType: mysqlEnum("location_type", ["Remote", "On-site", "Hybrid"]),
    status: mysqlEnum("status", [
      "applied",
      "interview",
      "offer",
      "rejected",
      "accepted",
      "ghosted",
    ]).default("applied"),
    notes: text("notes"),
    appliedAt: datetime("applied_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").onUpdateNow(),
  },
  (t) => [index("idx_user_id").on(t.userId), index("idx_cv_id").on(t.cvId)],
);

export const jobApplicationRelations = relations(
  jobApplications,
  ({ one }) => ({
    user: one(users, {
      fields: [jobApplications.userId],
      references: [users.id],
    }),
    cv: one(cv, {
      fields: [jobApplications.cvId],
      references: [cv.id],
    }),
  }),
);
