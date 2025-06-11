import { relations } from "drizzle-orm";
import {
  mysqlTable,
  mysqlEnum,
  int,
  varchar,
  timestamp,
  boolean,
  date,
  index,
  text,
} from "drizzle-orm/mysql-core";
import { cv } from "./cv.db";
import { jobApplications } from "./jobApplication.db";

export const users = mysqlTable(
  "users",
  {
    id: int("id").primaryKey().autoincrement(),
    username: varchar("username", { length: 50 }).notNull().unique(),
    email: varchar("email", { length: 100 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    isEmailVerified: boolean("is_email_verified").default(false),
    profileImage: text("profile_image"),
    birthDate: date("birth_date"),
    firstName: varchar("first_name", { length: 50 }),
    lastName: varchar("last_name", { length: 50 }),
    gender: mysqlEnum("gender", ["male", "female"]),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => [
    index("idx_users_username").on(table.username),
    index("idx_users_email").on(table.email),
    index("idx_users_created_at").on(table.createdAt),
  ],
);

export const userRelations = relations(users, ({ many }) => ({
  cvs: many(cv),
  jobApplications: many(jobApplications),
}));
