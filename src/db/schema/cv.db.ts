import {
  boolean,
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
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

export const cv = mysqlTable("cvs", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  theme: varchar("theme", { length: 100 }).default("default").notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  slug: varchar("slug", { length: 255 }).unique(),
  views: int("views").default(0),
  downloads: int("downloads").default(0),
  language: varchar("language", { length: 3 }).default("id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
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
