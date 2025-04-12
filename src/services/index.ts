import {
  Personal,
  Language,
  Education,
  Work,
  Organization,
  Project,
  Course,
  Skill,
  SoftSkill,
  ProjectTech,
  CurriculumVitae,
} from "./cvs";

export const personalService = new Personal();
export const languageService = new Language();
export const educationService = new Education();
export const workExpService = new Work();
export const orgExpService = new Organization();
export const projectService = new Project();
export const courseService = new Course();
export const projectTechService = new ProjectTech();
export const skillService = new Skill();
export const softSkillService = new SoftSkill();
export const cvService = new CurriculumVitae();
