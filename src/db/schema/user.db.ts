import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  integer,
  varchar,
  timestamp,
  boolean,
  date,
  index,
  text,
} from "drizzle-orm/pg-core";
import { cv } from "./cv.db";
import { jobApplications } from "./jobApplication.db";

export const genderEnum = pgEnum("gender", ["male", "female"]);
export const subscriptionTypeEnum = pgEnum("subscription_type", ["free", "pro"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "expired", "cancelled", "pending"]);

export const users = pgTable(
  "users",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    username: varchar("username", { length: 50 }).notNull().unique(),
    email: varchar("email", { length: 100 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    isEmailVerified: boolean("is_email_verified").default(false),
    profileImage: text("profile_image"),
    birthDate: date("birth_date", { mode: "date" }),
    firstName: varchar("first_name", { length: 50 }),
    lastName: varchar("last_name", { length: 50 }),
    about: text("about"),
    bio: varchar("bio", {length: 255}),
    gender: genderEnum("gender"),
    subscriptionType: subscriptionTypeEnum("subscription_type").default("free"),
    subscriptionStatus: subscriptionStatusEnum("subscription_status").default("active"),
    subscriptionExpiresAt: timestamp("subscription_expires_at"),
    emailNotifications: boolean("email_notifications").default(true),
    monthlyReports: boolean("monthly_reports").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdateFn(() => new Date()),
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
