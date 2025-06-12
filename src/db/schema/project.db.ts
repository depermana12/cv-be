import { relations } from "drizzle-orm";
import { mysqlTable, int, varchar, text, date } from "drizzle-orm/mysql-core";
import { cv } from "./cv.db";

export const projects = mysqlTable("projects", {
  id: int("id").primaryKey().autoincrement(),
  cvId: int("cv_id")
    .notNull()
    .references(() => cv.id),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  url: varchar("url", { length: 255 }),
});

export const projectDescription = mysqlTable("project_descriptions", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  description: text("description"),
});

export const projectTechnologies = mysqlTable("project_technologies", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  technology: varchar("technology", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
});

export const projectsRelations = relations(projects, ({ one, many }) => ({
  cv: one(cv, {
    fields: [projects.cvId],
    references: [cv.id],
  }),
  descriptions: many(projectDescription),
  technologies: many(projectTechnologies),
}));

export const projectDescriptionRelations = relations(
  projectDescription,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectDescription.projectId],
      references: [projects.id],
    }),
  }),
);

export const projectTechnologiesRelations = relations(
  projectTechnologies,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectTechnologies.projectId],
      references: [projects.id],
    }),
  }),
);
