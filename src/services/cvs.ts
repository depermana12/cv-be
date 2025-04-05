import { eq } from "drizzle-orm";
import { db } from "../db/index";

import {
  personalInfo,
  education,
  workExperience,
  workExperienceDetails,
  organizationExperience,
  orgExpDetails,
  projects,
  projectDetails,
  projectTechnologies,
  skills,
  softSkills,
  courses,
  courseDetails,
} from "../db/schema";

export class Personal {
  async getById(id) {}
  async create(biodata) {}
  async update(id, newPersonalData) {}
  async delete(id) {}
}

export class Education {
  async getAll() {}
  async getById(id) {}
  async create(eduData) {}
  async update(id, newEduData) {}
  async delete(id) {}
}

export class WorkExp {
  async getAll() {}
  async getById(id) {}
  async create(experience) {}
  async update(id, newExperience) {}
  async addDetails(workExpId, newWorkExp) {}
  async updateDetails(detailId, newDetailExp) {}
  async delete(id) {}
}

export class OrgExp {
  async getAll() {}
  async getById(id) {}
  async create(orgExp) {}
  async update(id, newOrgExp) {}
  async addDetails(orgExpId, newOrgExp) {}
  async updateDetails(detailId, newDetailExp) {}
  async delete(id) {}
}

export class Project {
  async getAll() {}
  async getById(id) {}
  async create(project) {}
  async update(id, newProjectData) {}
  async addDetails(projectId, newProjectDetail) {}
  async updateDetails(detailId, newDetail) {}
  async delete(id) {}
}

export class Course {
  async getAll() {}
  async getById(id) {}
  async create(course) {}
  async update(id, newCourseData) {}
  async addDetails(courseId, newCourseDetail) {}
  async updateDetails(detailId, newDetail) {}
  async delete(id) {}
}
