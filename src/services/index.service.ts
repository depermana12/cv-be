// import {
//   Personal,
//   Language,
//   Education,
//   Work,
//   Organization,
//   Project,
//   Course,
//   Skill,
//   SoftSkill,
//   ProjectTech,
//   CurriculumVitae,
// } from "./cvs";

import { Personal } from "./personal.service";
import { Language } from "./language.service";
import { Education } from "./education.service";
import { Work } from "./work.service";
import { Organization } from "./organization.service";
import { Project } from "./project.service";
import { Skill } from "./skill.service";
import { SoftSkill } from "./soft-skill.service";
import { Course } from "./course.service";
import { ProjectTech } from "./project-tech.service";
import { CurriculumVitae } from "./cv.service";

export const personalService = new Personal();
export const languageService = new Language();
export const educationService = new Education();
export const workExpService = new Work();
export const orgExpService = new Organization();
export const projectService = new Project();
export const projectTechService = new ProjectTech();
export const skillService = new Skill();
export const softSkillService = new SoftSkill();
export const courseService = new Course();
export const cvService = new CurriculumVitae();
