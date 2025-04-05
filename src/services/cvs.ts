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

type PersonalType = typeof personalInfo.$inferInsert;
export class Personal {
  async getById(id: number) {
    try {
      const rows = await db
        .select()
        .from(personalInfo)
        .where(eq(personalInfo.id, id));
      return rows[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async create(biodata: PersonalType) {
    try {
      const personalData = await db
        .insert(personalInfo)
        .values(biodata)
        .$returningId();
      return personalData[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async update(id: number, newPersonalData: PersonalType) {
    try {
      const rows = await db
        .update(personalInfo)
        .set(newPersonalData)
        .where(eq(personalInfo.id, id));
      return rows[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async delete(id: number) {
    try {
      const rows = await db.delete(personalInfo).where(eq(personalInfo.id, id));
      return rows[0];
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
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
