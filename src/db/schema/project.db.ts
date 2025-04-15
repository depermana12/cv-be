import { relations } from "drizzle-orm";
import { mysqlTable, int, varchar, text, date } from "drizzle-orm/mysql-core";

import { personalBasic } from "./personal.db";

export const projects = mysqlTable("projects", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id")
    .notNull()
    .references(() => personalBasic.id),
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
  personalInfo: one(personalBasic, {
    fields: [projects.personalId],
    references: [personalBasic.id],
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

export type ProjectInsert = typeof projects.$inferInsert;
export type ProjectSelect = typeof projects.$inferSelect;
export type ProjectDetailsInsert = typeof projectDetails.$inferInsert;
export type ProjectDetailsSelect = typeof projectDetails.$inferSelect;
export type ProjectTechStackInsert = typeof projectTechnologies.$inferInsert;
