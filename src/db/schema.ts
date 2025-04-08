import { relations } from "drizzle-orm";
import {
  mysqlTable,
  int,
  varchar,
  text,
  date,
  decimal,
  boolean,
} from "drizzle-orm/mysql-core";

// Personal Information Table
export const personalInfo = mysqlTable("personal_info", {
  id: int("id").primaryKey().autoincrement(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  location: varchar("location", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  linkedin: varchar("linkedin", { length: 200 }),
  github: varchar("github", { length: 200 }),
  bio: text("bio"),
});

export const personalInfoRelations = relations(personalInfo, ({ many }) => ({
  education: many(education),
  workExperience: many(workExperience),
  organizationExperience: many(organizationExperience),
  projects: many(projects),
  skills: many(skills),
  softSkills: many(softSkills),
  courses: many(courses),
}));

// Education Table
export const education = mysqlTable("education", {
  id: int("id").primaryKey().autoincrement(),
  personalInfoId: int("personal_info_id").references(() => personalInfo.id),
  institution: varchar("institution", { length: 100 }).notNull(),
  degree: varchar("degree", { length: 100 }).notNull(),
  fieldOfStudy: varchar("field_of_study", { length: 100 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  gpa: decimal("gpa", { precision: 3, scale: 2 }),
  maxGpa: decimal("max_gpa", { precision: 3, scale: 2 }),
});

export const educationRelations = relations(education, ({ one }) => ({
  personalInfo: one(personalInfo, {
    fields: [education.personalInfoId],
    references: [personalInfo.id],
  }),
}));

// Work Experience Table
export const workExperience = mysqlTable("work_exp", {
  id: int("id").primaryKey().autoincrement(),
  personalInfoId: int("personal_info_id").references(() => personalInfo.id),
  company: varchar("company", { length: 100 }).notNull(),
  position: varchar("position", { length: 100 }).notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  isCurrent: boolean("is_current").default(false),
});

// Work Experience Details Table
export const workExperienceDetails = mysqlTable("work_exp_details", {
  id: int("id").primaryKey().autoincrement(),
  workExperienceId: int("work_exp_id").references(() => workExperience.id),
  description: text("description"),
});

export const workExperienceRelations = relations(workExperience, ({ one }) => ({
  personalInfo: one(personalInfo, {
    fields: [workExperience.personalInfoId],
    references: [personalInfo.id],
  }),
  details: one(workExperienceDetails, {
    fields: [workExperience.id],
    references: [workExperienceDetails.workExperienceId],
  }),
}));

// Organization Experience Table
export const organizationExperience = mysqlTable("org_exp", {
  id: int("id").primaryKey().autoincrement(),
  personalInfoId: int("personal_info_id").references(() => personalInfo.id),
  organization: varchar("organization", { length: 100 }).notNull(),
  role: varchar("role", { length: 100 }).notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
});

// Organization Experience Details Table
export const orgExpDetails = mysqlTable("org_exp_details", {
  id: int("id").primaryKey().autoincrement(),
  organizationExperienceId: int("org_exp_id").references(
    () => organizationExperience.id,
  ),
  description: text("description"),
});

export const orgExpRelations = relations(organizationExperience, ({ one }) => ({
  personalInfo: one(personalInfo, {
    fields: [organizationExperience.personalInfoId],
    references: [personalInfo.id],
  }),
  details: one(orgExpDetails, {
    fields: [organizationExperience.id],
    references: [orgExpDetails.organizationExperienceId],
  }),
}));

export const orgExpDetailsRelations = relations(orgExpDetails, ({ one }) => ({
  organizationExperience: one(organizationExperience, {
    fields: [orgExpDetails.organizationExperienceId],
    references: [organizationExperience.id],
  }),
}));

// Projects Table
export const projects = mysqlTable("projects", {
  id: int("id").primaryKey().autoincrement(),
  personalInfoId: int("personal_info_id").references(() => personalInfo.id),
  name: varchar("name", { length: 100 }).notNull(),
  githubUrl: varchar("github_url", { length: 200 }),
});

// Project Details Table
export const projectDetails = mysqlTable("project_details", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("project_id").references(() => projects.id),
  description: text("description"),
});

// Project Technologies Table
export const projectTechnologies = mysqlTable("project_technologies", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("project_id").references(() => projects.id),
  technology: varchar("technology", { length: 100 }).notNull(),
});

export const projectsRelations = relations(projects, ({ one, many }) => ({
  personalInfo: one(personalInfo, {
    fields: [projects.personalInfoId],
    references: [personalInfo.id],
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

// Skills Table
export const skills = mysqlTable("skills", {
  id: int("id").primaryKey().autoincrement(),
  personalInfoId: int("personal_info_id").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const skillsRelations = relations(skills, ({ one }) => ({
  personalInfo: one(personalInfo, {
    fields: [skills.personalInfoId],
    references: [personalInfo.id],
  }),
}));

// Soft Skills Table
export const softSkills = mysqlTable("soft_skills", {
  id: int("id").primaryKey().autoincrement(),
  personalInfoId: int("personal_info_id").references(() => personalInfo.id),
  category: varchar("category", { length: 50 }).notNull(),
  description: text("description"),
});

export const softSkillsRelations = relations(softSkills, ({ one }) => ({
  personalInfo: one(personalInfo, {
    fields: [softSkills.personalInfoId],
    references: [personalInfo.id],
  }),
}));

// Courses Table
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  personalInfoId: int("personal_info_id").references(() => personalInfo.id),
  provider: varchar("provider", { length: 100 }).notNull(),
  courseName: varchar("course_name", { length: 200 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
});

// Course Details Table
export const courseDetails = mysqlTable("course_details", {
  id: int("id").primaryKey().autoincrement(),
  courseId: int("course_id").references(() => courses.id),
  description: text("description"),
});

export const coursesRelations = relations(courses, ({ one }) => ({
  personalInfo: one(personalInfo, {
    fields: [courses.personalInfoId],
    references: [personalInfo.id],
  }),
  details: one(courseDetails, {
    fields: [courses.id],
    references: [courseDetails.courseId],
  }),
}));

export const courseDetailsRelations = relations(courseDetails, ({ one }) => ({
  course: one(courses, {
    fields: [courseDetails.courseId],
    references: [courses.id],
  }),
}));
