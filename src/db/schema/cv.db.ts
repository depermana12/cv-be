import {
  pgTable,
  integer,
  varchar,
  text,
  timestamp,
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
import { coverLetters } from "./coverLetter.db";

export const cv = pgTable("cvs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
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
  organizations: many(organizations),
  projects: many(projects),
  skills: many(skills),
  courses: many(courses),
  coverLetters: many(coverLetters),
}));
