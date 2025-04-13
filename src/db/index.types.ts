// this is not wildcard import from each db schema
// so make sure to add/remore name export here
// if you add/delete type from db schema

export type {
  PersonalBasicInsert,
  PersonalLocationInsert,
  PersonalSocialInsert,
  PersonalInsert,
} from "./schema/personal";

export type { LanguageInsert } from "./schema/language";

export type { EducationInsert } from "./schema/education";

export type { WorkInsert, WorkDetailInsert } from "./schema/work";

export type {
  OrganizationInsert,
  OrganizationDetailInsert,
} from "./schema/organization";

export type {
  ProjectInsert,
  ProjectDetailsInsert,
  ProjectTechStackInsert,
} from "./schema/project";

export type { SkillInsert } from "./schema/skill";

export type { SoftSkillInsert } from "./schema/soft-skill";

export type { CourseInsert, CourseDetailsInsert } from "./schema/course";
