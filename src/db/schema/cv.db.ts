import {
  pgTable,
  integer,
  varchar,
  text,
  timestamp,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { users } from "./user.db";
import { relations } from "drizzle-orm";
import { contacts } from "./contact.db";
import { educations } from "./education.db";
import { works } from "./work.db";
import { organizations } from "./organization.db";
import { projects } from "./project.db";
import { skills } from "./skill.db";
import { courses } from "./course.db";
// import { coverLetters } from "./coverLetter.db";
import { languages } from "./language.db";

export const cv = pgTable("cvs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  theme: varchar("theme", { length: 100 }).notNull().default("default"),
  isPublic: boolean("is_public").notNull().default(false),
  slug: varchar("slug", { length: 255 }),
  views: integer("views").notNull().default(0),
  downloads: integer("downloads").notNull().default(0),
  language: varchar("language", { length: 2 }).notNull().default("id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const cvRelations = relations(cv, ({ one, many }) => ({
  user: one(users, {
    fields: [cv.userId],
    references: [users.id],
  }),
  contact: one(contacts),
  educations: many(educations),
  works: many(works),
  projects: many(projects),
  organizations: many(organizations),
  courses: many(courses),
  skills: many(skills),
  languages: many(languages),
  // coverLetters: many(coverLetters),
}));
