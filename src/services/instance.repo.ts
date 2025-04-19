import { PersonalRepository } from "../repositories/personal.repo";
import { Basic } from "../repositories/basic.repo";
import { Location } from "../repositories/location.repo.ts";
import { Social } from "../repositories/social.repo.ts";
import { LanguageRepository } from "../repositories/language.repo";
import { EducationRepository } from "../repositories/education.repo";
import { WorkRepository } from "../repositories/work.repo";
import { OrganizationRepository } from "../repositories/organization.repo";
import { ProjectRepository } from "../repositories/project.repo";
import { SkillRepository } from "../repositories/skill.repo";
import { SoftSkillRepository } from "../repositories/soft-skill.repo";
import { CourseRepository } from "../repositories/course.repo";
import { ProjectTechStack } from "../repositories/project-tech.repo";
// import { CurriculumVitae } from "./cv.repo";

export const basicRepository = new Basic();
export const locationRepository = new Location();
export const socialRepository = new Social();
export const personalRepository = new PersonalRepository(
  basicRepository,
  locationRepository,
  socialRepository,
);
export const languageRepository = new LanguageRepository();
export const educationRepository = new EducationRepository();
export const workRepository = new WorkRepository();
export const organizationRepository = new OrganizationRepository();
export const projectRepository = new ProjectRepository();
export const projectTechStackRepository = new ProjectTechStack();
export const skillRepository = new SkillRepository();
export const softSkillRepository = new SoftSkillRepository();
export const courseRepository = new CourseRepository();
// export const cvRepository = new CurriculumVitae();
