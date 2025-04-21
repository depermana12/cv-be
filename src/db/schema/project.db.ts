import { relations } from "drizzle-orm";
import { mysqlTable, int, varchar, text, date } from "drizzle-orm/mysql-core";

import { intro } from "./personal.db";

export const projects = mysqlTable("projects", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id")
    .notNull()
    .references(() => intro.id),
  name: varchar("name", { length: 100 }).notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  url: varchar("url", { length: 255 }),
});

export const projectDetails = mysqlTable("project_details", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("project_id")
    .notNull()
    .references(() => projects.id),
  description: text("description"),
});

export const projectTechnologies = mysqlTable("project_technologies", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("project_id")
    .notNull()
    .references(() => projects.id),
  technology: varchar("technology", { length: 100 }).notNull(),
  category: varchar("type", { length: 100 }).notNull(),
});

export const projectsRelations = relations(projects, ({ one, many }) => ({
  personal: one(intro, {
    fields: [projects.personalId],
    references: [intro.id],
  }),
  details: one(projectDetails, {
    fields: [projects.id],
    references: [projectDetails.projectId],
  }),
  technologies: many(projectTechnologies),
}));

export const projectDetailsRelations = relations(projectDetails, ({ one }) => ({
  project: one(projects, {
    fields: [projectDetails.projectId],
    references: [projects.id],
  }),
}));

export const projectTechnologiesRelations = relations(
  projectTechnologies,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectTechnologies.projectId],
      references: [projects.id],
    }),
  }),
);

export type ProjectSelect = typeof projects.$inferSelect;
export type ProjectInsert = Omit<typeof projects.$inferInsert, "personalId">;
export type ProjectDetailsInsert = Omit<
  typeof projectDetails.$inferInsert,
  "projectId"
>;
export type ProjectDetailsSelect = typeof projectDetails.$inferSelect;
export type ProjectTechStackSelect = typeof projectTechnologies.$inferSelect;
export type ProjectTechStackInsert = Omit<
  typeof projectTechnologies.$inferInsert,
  "projectId"
>;
