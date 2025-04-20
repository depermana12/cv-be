import { PersonalService } from "./personal.service";
import { LanguageService } from "./language.service";
import { EducationService } from "./education.service";
import { WorkService } from "./work.service";
import { OrganizationService } from "./organization.service";
import { ProjectService } from "./project.service";
import { SkillService } from "./skill.service";
import { SoftSkillService } from "./soft-skill.service";
import { CourseService } from "./course.service";
import { ProjectTechStackService } from "./project-tech.service";

// use in cv aggregator
export const personalService = new PersonalService();
export const languageService = new LanguageService();
export const educationService = new EducationService();
export const workExpService = new WorkService();
export const orgExpService = new OrganizationService();
export const projectService = new ProjectService();
export const projectTechService = new ProjectTechStackService();
export const skillService = new SkillService();
export const softSkillService = new SoftSkillService();
export const courseService = new CourseService();
