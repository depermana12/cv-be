import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {
  mysqlTable,
  text,
  varchar,
  int,
  timestamp,
} from "drizzle-orm/mysql-core";
import { z } from "zod";

import { users } from "./user.db";
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

export const personal = mysqlTable("personal", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id),
  fullName: varchar("full_name", { length: 100 }),
  bio: varchar("bio", { length: 255 }),
  image: varchar("image", { length: 255 }),
  summary: text("summary"),
  phone: varchar("phone", { length: 15 }),
  email: varchar("email", { length: 255 }),
  url: varchar("url", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const personalRelations = relations(personal, ({ one, many }) => ({
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

export const personalSelectSchema = createSelectSchema(personal);
export const personalInsertSchema = createInsertSchema(personal).omit({
  userId: true,
});
export const personalUpdateSchema = personalInsertSchema.omit({ id: true });

export type PersonalSelect = z.infer<typeof personalSelectSchema>;
export type PersonalInsert = z.infer<typeof personalInsertSchema>;
export type PersonalUpdate = z.infer<typeof personalUpdateSchema>;
