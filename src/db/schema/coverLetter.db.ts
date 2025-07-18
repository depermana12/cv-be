import { relations } from "drizzle-orm";
import {
  pgTable,
  integer,
  varchar,
  text,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./user.db";
import { cv } from "./cv.db";
import { jobApplications } from "./jobApplication.db";

/**
 * Cover Letter Templates - Reusable templates
 */
export const coverLetterTemplates = pgTable("cover_letter_templates", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  content: text("content").notNull(), // Template with placeholders like {{company}}, {{position}}
  tone: pgEnum("tone", [
    "professional",
    "friendly",
    "confident",
    "enthusiastic",
    "formal",
  ])("tone").default("professional"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

/**
 * Cover Letters - Individual cover letters tied to CVs and applications
 */
export const coverLetters = pgTable("cover_letters", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  cvId: integer("cv_id")
    .notNull()
    .references(() => cv.id, { onDelete: "cascade" }),
  templateId: integer("template_id").references(() => coverLetterTemplates.id, {
    onDelete: "set null",
  }),
  applicationId: integer("application_id").references(
    () => jobApplications.id,
    { onDelete: "cascade" },
  ),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  companyName: varchar("company_name", { length: 100 }),
  position: varchar("position", { length: 100 }),
  hiringManager: varchar("hiring_manager", { length: 100 }),
  tone: pgEnum("tone", [
    "professional",
    "friendly",
    "confident",
    "enthusiastic",
    "formal",
  ])("tone").default("professional"),
  status: pgEnum("cover_letter_status", ["draft", "active", "archived"])(
    "status",
  ).default("draft"),
  wordCount: integer("word_count"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

/**
 * Cover Letter Sections - For modular content management
 */
export const coverLetterSections = pgTable("cover_letter_sections", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  coverLetterId: integer("cover_letter_id")
    .notNull()
    .references(() => coverLetters.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // 'opening', 'body', 'closing', 'signature'
  content: text("content").notNull(),
  displayOrder: integer("display_order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const coverLetterTemplateRelations = relations(
  coverLetterTemplates,
  ({ one, many }) => ({
    user: one(users, {
      fields: [coverLetterTemplates.userId],
      references: [users.id],
    }),
    coverLetters: many(coverLetters),
  }),
);

export const coverLetterRelations = relations(
  coverLetters,
  ({ one, many }) => ({
    user: one(users, {
      fields: [coverLetters.userId],
      references: [users.id],
    }),
    cv: one(cv, {
      fields: [coverLetters.cvId],
      references: [cv.id],
    }),
    template: one(coverLetterTemplates, {
      fields: [coverLetters.templateId],
      references: [coverLetterTemplates.id],
    }),
    application: one(jobApplications, {
      fields: [coverLetters.applicationId],
      references: [jobApplications.id],
    }),
    sections: many(coverLetterSections),
  }),
);

export const coverLetterSectionRelations = relations(
  coverLetterSections,
  ({ one }) => ({
    coverLetter: one(coverLetters, {
      fields: [coverLetterSections.coverLetterId],
      references: [coverLetters.id],
    }),
  }),
);
