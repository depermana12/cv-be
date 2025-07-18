import {
  pgTable,
  integer,
  varchar,
  text,
  date,
  boolean,
} from "drizzle-orm/pg-core";
import { users } from "./user.db";
import { profile } from "./profile.db";
import { relations } from "drizzle-orm";
import { location } from "./location.db";
import { socials } from "./social.db";
import { educations } from "./education.db";
import { works } from "./work.db";
import { organizations } from "./organization.db";
import { projects } from "./project.db";
import { skills } from "./skill.db";
import { softSkills } from "./soft-skill.db";
import { courses } from "./course.db";

export const cv = pgTable("cvs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary"),
  createdAt: date("created_at"),
  updatedAt: date("updated_at"),
});

export const cvRelations = relations(cv, ({ one, many }) => ({
  user: one(users, {
    fields: [cv.userId],
    references: [users.id],
  }),
  profile: one(profile),
  location: one(location),
  socials: many(socials),
  educations: many(educations),
  works: many(works),
  organizations: many(organizations),
  projects: many(projects),
  skills: many(skills),
  softSkills: many(softSkills),
  courses: many(courses),
}));
