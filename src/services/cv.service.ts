import {
  personalService,
  educationService,
  workExpService,
  orgExpService,
  projectService,
  skillService,
  softSkillService,
  courseService,
} from "./index.service";

export class CurriculumVitae {
  async getCV() {
    const personal = await personalService.getAll();
    const education = await educationService.getAll();
    const works = await workExpService.getAll();
    const projects = await projectService.getAll();
    const organization = await orgExpService.getAll();
    const skills = await skillService.getAll();
    const softSkills = await softSkillService.getAll();
    const courses = await courseService.getAll();

    return {
      personal,
      education,
      works,
      projects,
      organization,
      skills,
      softSkills,
      courses,
    };
  }
  async getSummary() {
    const [education, works, organization, projects, skills, courses] =
      await Promise.all([
        (await educationService.getAll()).length,
        (await workExpService.getAll()).length,
        (await orgExpService.getAll()).length,
        (await projectService.getAll()).length,
        (await skillService.getAll()).length,
        (await courseService.getAll()).length,
      ]);
    return {
      educationCount: education,
      workCount: works,
      organizationCount: organization,
      projectCount: projects,
      skillCount: skills,
      courseCount: courses,
    };
  }
  async exportCV() {}
  async importCV() {}
}
