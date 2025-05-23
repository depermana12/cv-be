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
    position: varchar("position", { length: 255 }).notNull(),
    location: varchar("location", { length: 255 }),
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
    updatedAt: timestamp("updated_at").onUpdateNow().onUpdateNow(),
  },
  (t) => [index("idx_user_id").on(t.userId), index("idx_cv_id").on(t.cvId)],
);
