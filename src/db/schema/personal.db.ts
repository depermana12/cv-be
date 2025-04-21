import { relations } from "drizzle-orm";
import { mysqlTable, int, varchar, text } from "drizzle-orm/mysql-core";

import { language } from "./language.db";
import { education } from "./education.db";
import { work } from "./work.db";
import { organization } from "./organization.db";
import { projects } from "./project.db";
import { skills } from "./skill.db";
import { softSkills } from "./soft-skill.db";
import { courses } from "./course.db";

export const intro = mysqlTable("personal_basic", {
  id: int("id").primaryKey().autoincrement(),
  fullName: varchar("full_name", { length: 100 }),
  bio: varchar("bio", { length: 255 }),
  image: varchar("image", { length: 255 }),
  summary: text("summary"),
  phone: varchar("phone", { length: 15 }),
  email: varchar("email", { length: 255 }),
  url: varchar("url", { length: 255 }),
});

export const location = mysqlTable("personal_location", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id")
    .notNull()
    .references(() => intro.id),
  address: varchar("address", { length: 255 }),
  postalCode: varchar("postal_code", { length: 5 }),
  city: varchar("city", { length: 100 }),
  countryCode: varchar("country_code", { length: 3 }),
  state: varchar("state", { length: 100 }),
});

export const social = mysqlTable("personal_social", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id")
    .notNull()
    .references(() => intro.id),
  social: varchar("social", { length: 50 }),
  username: varchar("username", { length: 100 }),
  url: varchar("url", { length: 255 }),
});

export const personalRelations = relations(intro, ({ many, one }) => ({
  location: one(location),
  socials: many(social),
  language: many(language),
  education: many(education),
  workExperience: many(work),
  organizationExperience: many(organization),
  projects: many(projects),
  skills: many(skills),
  softSkills: many(softSkills),
  courses: many(courses),
}));

export type BasicBase = typeof intro.$inferSelect;
export type BasicInsert = typeof intro.$inferInsert;
export type BasicUpdate = Partial<BasicInsert> & { id: number };

export type LocationBase = typeof location.$inferSelect;
export type LocationInsert = typeof location.$inferInsert;
export type LocationUpdate = Partial<LocationInsert> & { id: number };

export type SocialBase = typeof social.$inferSelect;
export type SocialInsert = typeof social.$inferInsert;
export type SocialUpdate = Partial<SocialInsert> & { id: number };

export type PersonalSelect = {
  basic: BasicBase;
  location: LocationBase;
  socials: SocialBase[];
};

export type PersonalInsert = {
  basic: BasicInsert;
  location: Omit<LocationInsert, "personalId">;
  socials: Omit<SocialInsert, "personalId">[];
};

export type PersonalUpdate = {
  basic?: BasicUpdate;
  location?: LocationUpdate;
  socials?: SocialUpdate[];
};
