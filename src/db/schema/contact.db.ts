import { pgTable, integer, varchar, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { cv } from "./cv.db";

export const contacts = pgTable("contacts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  cvId: integer("cv_id")
    .notNull()
    .references(() => cv.id, { onDelete: "cascade" }),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  bio: varchar("bio", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }),
  website: varchar("website", { length: 255 }),
  linkedin: varchar("linkedin", { length: 255 }),
  github: varchar("github", { length: 255 }),
  portfolio: varchar("portfolio", { length: 255 }),
  summary: text("summary"),
  profileImage: varchar("profile_image", { length: 255 }),
  socialLinks: text("social_links").array(), // ["twitter.com/user", "instagram.com/user"]
  displayOrder: integer("display_order"),
});

export const contactsRelations = relations(contacts, ({ one }) => ({
  cv: one(cv, {
    fields: [contacts.cvId],
    references: [cv.id],
  }),
}));
