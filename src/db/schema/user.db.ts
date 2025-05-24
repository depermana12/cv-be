import { relations } from "drizzle-orm";
import {
  mysqlTable,
  int,
  varchar,
  timestamp,
  boolean,
} from "drizzle-orm/mysql-core";
import { cv } from "./cv.db";
import { jobApplications } from "./jobApplication.db";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  isEmailVerified: boolean("is_email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userRelations = relations(users, ({ many }) => ({
  cvs: many(cv),
  jobApplications: many(jobApplications),
}));
