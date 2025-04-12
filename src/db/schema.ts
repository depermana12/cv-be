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
export const personalBasic = mysqlTable("personal_basic", {
  id: int("id").primaryKey().autoincrement(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  bio: varchar("bio", { length: 255 }),
  image: varchar("image", { length: 255 }),
  summary: text("summary"),
  phone: varchar("phone", { length: 15 }),
  email: varchar("email", { length: 255 }),
  url: varchar("url", { length: 255 }),
});

export const personalLocation = mysqlTable("personal_location", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id")
    .notNull()
    .references(() => personalBasic.id),
  address: varchar("address", { length: 255 }),
  postalCode: varchar("postal_code", { length: 5 }),
  city: varchar("city", { length: 100 }),
  countryCode: varchar("country_code", { length: 3 }),
  state: varchar("state", { length: 100 }),
});

export const personalSocial = mysqlTable("personal_social", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id")
    .notNull()
    .references(() => personalBasic.id),
  social: varchar("social", { length: 50 }),
  username: varchar("username", { length: 100 }),
  url: varchar("url", { length: 255 }),
});

export const personalRelations = relations(personalBasic, ({ many, one }) => ({
  education: many(education),
  workExperience: many(workExperience),
  organizationExperience: many(organizationExperience),
  projects: many(projects),
  skills: many(skills),
  softSkills: many(softSkills),
  courses: many(courses),
  socials: many(personalSocial),
  location: one(personalLocation),
}));

// Languange Table
export const language = mysqlTable("language", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id")
    .notNull()
    .references(() => personalBasic.id),
  language: varchar("language", { length: 100 }).notNull(),
  fluency: varchar("fluency", { length: 25 }).notNull(),
});

// Education Table
export const education = mysqlTable("education", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id")
    .notNull()
    .references(() => personalBasic.id),
  institution: varchar("institution", { length: 100 }).notNull(),
  degree: varchar("degree", { length: 100 }).notNull(),
  fieldOfStudy: varchar("field_of_study", { length: 100 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  gpa: decimal("gpa", { precision: 3, scale: 2 }),
  url: varchar("url", { length: 255 }),
});

export const educationRelations = relations(education, ({ one }) => ({
  personalInfo: one(personalBasic, {
    fields: [education.personalId],
    references: [personalBasic.id],
  }),
}));

// Work Experience Table
export const workExperience = mysqlTable("work_exp", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id")
    .notNull()
    .references(() => personalBasic.id),
  company: varchar("company", { length: 100 }).notNull(),
  position: varchar("position", { length: 100 }).notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  url: varchar("url", { length: 255 }),
  isCurrent: boolean("is_current").default(false),
});

// Work Experience Details Table
export const workExperienceDetails = mysqlTable("work_exp_details", {
  id: int("id").primaryKey().autoincrement(),
  workExperienceId: int("work_exp_id")
    .notNull()
    .references(() => workExperience.id),
  description: text("description"),
});

export const workExperienceRelations = relations(workExperience, ({ one }) => ({
  personalInfo: one(personalBasic, {
    fields: [workExperience.personalId],
    references: [personalBasic.id],
  }),
  details: one(workExperienceDetails, {
    fields: [workExperience.id],
    references: [workExperienceDetails.workExperienceId],
  }),
}));

// Organization Experience Table
export const organizationExperience = mysqlTable("org_exp", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id")
    .notNull()
    .references(() => personalBasic.id),
  organization: varchar("organization", { length: 100 }).notNull(),
  role: varchar("role", { length: 100 }).notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
});

// Organization Experience Details Table
export const orgExpDetails = mysqlTable("org_exp_details", {
  id: int("id").primaryKey().autoincrement(),
  organizationExperienceId: int("org_exp_id")
    .notNull()
    .references(() => organizationExperience.id),
  description: text("description"),
});

export const orgExpRelations = relations(organizationExperience, ({ one }) => ({
  personalInfo: one(personalBasic, {
    fields: [organizationExperience.personalId],
    references: [personalBasic.id],
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
  personalId: int("personal_id")
    .notNull()
    .references(() => personalBasic.id),
  name: varchar("name", { length: 100 }).notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  url: varchar("url", { length: 255 }),
});

// Project Details Table
export const projectDetails = mysqlTable("project_details", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("project_id")
    .notNull()
    .references(() => projects.id),
  description: text("description"),
});

// Project Technologies Table
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

// Skills Table
export const skills = mysqlTable("skills", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const skillsRelations = relations(skills, ({ one }) => ({
  personalInfo: one(personalBasic, {
    fields: [skills.personalId],
    references: [personalBasic.id],
  }),
}));

// Soft Skills Table
export const softSkills = mysqlTable("soft_skills", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id")
    .notNull()
    .references(() => personalBasic.id),
  category: varchar("category", { length: 50 }).notNull(),
  description: text("description"),
});

export const softSkillsRelations = relations(softSkills, ({ one }) => ({
  personalInfo: one(personalBasic, {
    fields: [softSkills.personalId],
    references: [personalBasic.id],
  }),
}));

// Courses Table
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  personalId: int("personal_id")
    .notNull()
    .references(() => personalBasic.id),
  provider: varchar("provider", { length: 100 }).notNull(),
  courseName: varchar("course_name", { length: 200 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
});

// Course Details Table
export const courseDetails = mysqlTable("course_details", {
  id: int("id").primaryKey().autoincrement(),
  courseId: int("course_id")
    .notNull()
    .references(() => courses.id),
  description: text("description"),
});

export const coursesRelations = relations(courses, ({ one }) => ({
  personalInfo: one(personalBasic, {
    fields: [courses.personalId],
    references: [personalBasic.id],
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
