export type {
  LanguageSelect as LanguageSelect,
  LanguageInsert as LanguageInsert,
  LanguageUpdate as LanguageUpdate,
} from "./language.schema";

export type {
  EducationSelect as EducationSelect,
  EducationInsert as EducationInsert,
  EducationUpdate as EducationUpdate,
} from "./education.schema";

export type {
  WorkSelect as WorkBase,
  WorkInsert as WorkCreate,
  WorkUpdate,
  WorkDescSelect as WorkDetailsBase,
  WorkDescInsert as WorkDetailsCreate,
  WorkDescUpdate as WorkDetailsUpdate,
} from "./work.schema";

export type {
  OrganizationSelect as Organization,
  OrganizationInsert as OrganizationCreate,
  OrganizationUpdate as OrganizationUpdate,
  OrganizationDescSelect as OrganizationDetail,
  OrganizationDescInsert as OrganizationDetailCreate,
  OrganizationDescUpdate as OrganizationDetailUpdate,
} from "./organization.schema";

export type {
  ProjectSelect as Project,
  ProjectInsert as ProjectCreate,
  ProjectUpdate,
  ProjectDescSelect as ProjectDetail,
  ProjectDescInsert as ProjectDetailCreate,
  ProjectDescUpdate as ProjectDetailUpdate,
  ProjectTechSelect as ProjectTechnology,
  ProjectTechInsert as ProjectTechnologyCreate,
  ProjectTechUpdate as ProjectTechnologyUpdate,
} from "./project.schema";

export type {
  SkillSelect as Skill,
  SkillInsert as SkillCreate,
  SkillUpdate,
} from "./skill.schema";

export type {
  SoftSkillSelect as SoftSkill,
  SoftSkillInsert as SoftSkillCreate,
  SoftSkillUpdate,
} from "./soft-skill.schema";

export type {
  CourseSelect as CourseSelect,
  CourseInsert as CourseInsert,
  CourseUpdate as CourseUpdate,
  CourseDescSelect as CourseDescSelect,
  CourseDescInsert as CourseDescInsert,
  CourseDescUpdate as CourseDescUpdate,
} from "./course.schema";
