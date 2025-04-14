// this is not wildcard import from each db schema
// so make sure to add/remore name export here
// if you add/delete type from db schema

export type {
  PersonalBasicInsert,
  PersonalLocationInsert,
  PersonalSocialInsert,
  PersonalInsert,
  PersonalUpdate,
} from "./schema/personal.db";

export type { LanguageInsert } from "./schema/language.db";

export type { EducationInsert, EducationUpdate } from "./schema/education.db";

export type { WorkInsert, WorkDetailInsert } from "./schema/work.db";

export type {
  OrganizationInsert,
  OrganizationDetailInsert,
} from "./schema/organization.db";

export type {
  ProjectInsert,
  ProjectDetailsInsert,
  ProjectTechStackInsert,
} from "./schema/project.db";

export type { SkillInsert } from "./schema/skill.db";

export type { SoftSkillInsert } from "./schema/soft-skill.db";

export type { CourseInsert, CourseDetailsInsert } from "./schema/course.db";
