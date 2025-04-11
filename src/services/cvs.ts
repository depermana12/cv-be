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
import { HTTPException } from "hono/http-exception";

type PersonalType = typeof personalInfo.$inferInsert;
type EducationType = typeof education.$inferInsert;
type WorkExpType = typeof workExperience.$inferInsert;
type WorkExpDetailType = typeof workExperienceDetails.$inferInsert;
type OrgExpType = typeof organizationExperience.$inferInsert;
type OrgExpDetailType = typeof orgExpDetails.$inferInsert;
type ProjectType = typeof projects.$inferInsert;
type ProjectDetailsType = typeof projectDetails.$inferInsert;
type CourseType = typeof courses.$inferInsert;
type CourseDetailsType = typeof courseDetails.$inferInsert;
type SkillType = typeof skills.$inferInsert;
type SoftSkillType = typeof softSkills.$inferInsert;
type ProjectTechStack = typeof projectTechnologies.$inferInsert;
export class Personal {
  async get() {
    try {
      const rows = await db.select().from(personalInfo);
      return rows[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

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
  async getAll() {
    try {
      const rows = await db.select().from(education);
      return rows[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async getById(id: number) {
    try {
      const educationRows = await db
        .select()
        .from(education)
        .where(eq(education.id, Number(id)));
      if (!education) {
        throw new HTTPException(404, {
          message: "invalid education id not found",
        });
      }
      return educationRows[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async create(eduData: EducationType) {
    try {
      const newEducation = await db
        .insert(education)
        .values(eduData)
        .$returningId();
      return newEducation[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async update(id: number, newEduData: EducationType) {
    try {
      const rows = await db
        .update(education)
        .set(newEduData)
        .where(eq(education.id, Number(id)));
      return rows[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async delete(id: number) {
    try {
      await db.delete(education).where(eq(education.id, Number(id)));
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
}

export class WorkExp {
  async getAll() {
    try {
      return await db.select().from(workExperience);
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async getById(id: number) {
    try {
      const rows = await db
        .select()
        .from(workExperience)
        .where(eq(workExperience.id, id));
      return rows[0];
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async create(experience: WorkExpType) {
    try {
      const insertedWorkExp = await db
        .insert(workExperience)
        .values(experience)
        .$returningId();
      const returningWorkExp = await db
        .select()
        .from(workExperience)
        .where(eq(workExperience.id, insertedWorkExp[0].id));
      return returningWorkExp[0];
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async update(id: number, newExperience: WorkExpType) {
    try {
      await db
        .update(workExperience)
        .set(newExperience)
        .where(eq(workExperience.id, id));
      const rows = await db
        .select()
        .from(workExperience)
        .where(eq(workExperience.id, id));
      return rows[0];
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async getDetailById(detailId: number) {
    const rows = await db
      .select()
      .from(workExperienceDetails)
      .where(eq(workExperienceDetails.id, detailId));
    return rows[0];
  }

  async addDetail(workExpId: number, newWorkExp: WorkExpDetailType) {
    try {
      const insertedDetail = await db
        .insert(workExperienceDetails)
        .values({ ...newWorkExp, workExperienceId: workExpId })
        .$returningId();
      const returningDetail = await db
        .select()
        .from(workExperienceDetails)
        .where(eq(workExperienceDetails.id, insertedDetail[0].id));
      return returningDetail[0];
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async updateDetails(detailId: number, newDetailExp: WorkExpDetailType) {
    try {
      await db
        .update(workExperienceDetails)
        .set(newDetailExp)
        .where(eq(workExperienceDetails.id, detailId));

      const result = await db
        .select()
        .from(workExperienceDetails)
        .where(eq(workExperienceDetails.id, detailId));
      return result[0];
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async delete(id: number) {
    try {
      await db
        .delete(workExperienceDetails)
        .where(eq(workExperienceDetails.id, id));
      await db.delete(workExperience).where(eq(workExperience.id, id));
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
}

export class OrgExp {
  async getAll() {
    try {
      return await db.select().from(organizationExperience);
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async getById(id: number) {
    try {
      const rows = await db
        .select()
        .from(organizationExperience)
        .where(eq(organizationExperience.id, id));
      return rows[0];
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async create(orgExp: OrgExpType) {
    try {
      const insertedOrgExp = await db
        .insert(organizationExperience)
        .values(orgExp)
        .$returningId();
      const returningOrgExp = await db
        .select()
        .from(organizationExperience)
        .where(eq(organizationExperience.id, insertedOrgExp[0].id));
      return returningOrgExp[0];
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async update(id: number, newOrgExp: OrgExpType) {
    try {
      await db
        .update(organizationExperience)
        .set(newOrgExp)
        .where(eq(organizationExperience.id, id));
      const rows = await db
        .select()
        .from(organizationExperience)
        .where(eq(organizationExperience.id, id));
      return rows[0];
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async getDetailById(detailId: number) {
    try {
      const rows = await db
        .select()
        .from(orgExpDetails)
        .where(eq(orgExpDetails.id, detailId));
      return rows[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async addDetail(orgExpId: number, newOrgExp: OrgExpDetailType) {
    try {
      const insertedDetail = await db
        .insert(orgExpDetails)
        .values({ ...newOrgExp, organizationExperienceId: orgExpId })
        .$returningId();
      const returningDetail = await db
        .select()
        .from(orgExpDetails)
        .where(eq(orgExpDetails.id, insertedDetail[0].id));
      return returningDetail[0];
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async updateDetails(detailId: number, newDetailExp: OrgExpDetailType) {
    try {
      await db
        .update(orgExpDetails)
        .set(newDetailExp)
        .where(eq(orgExpDetails.id, detailId));
      const result = await db
        .select()
        .from(orgExpDetails)
        .where(eq(orgExpDetails.id, detailId));
      return result[0];
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async delete(id: number) {
    try {
      await db.delete(orgExpDetails).where(eq(orgExpDetails.id, id));
      await db
        .delete(organizationExperience)
        .where(eq(organizationExperience.id, id));
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
}

export class Project {
  async getAll() {
    try {
      return await db.select().from(projects);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async getById(id: number) {
    try {
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, id));
      return project[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async create(project: ProjectType) {
    try {
      const created = await db.insert(projects).values(project).$returningId();
      return created[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async update(id: number, newProjectData: Partial<ProjectType>) {
    try {
      return await db
        .update(projects)
        .set(newProjectData)
        .where(eq(projects.id, id));
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async getDetailById(projectId: number) {
    try {
      const rows = await db
        .select()
        .from(projectDetails)
        .where(eq(projectDetails.id, projectId));
      return rows[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async addDetails(projectId: number, newProjectDetail: ProjectDetailsType) {
    try {
      const insertedDetail = await db
        .insert(projectDetails)
        .values({ ...newProjectDetail, projectId })
        .$returningId();
      const returningDetail = await db
        .select()
        .from(projectDetails)
        .where(eq(projectDetails.id, insertedDetail[0].id));
      return returningDetail[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async updateDetails(
    detailId: number,
    newDetail: Partial<ProjectDetailsType>,
  ) {
    try {
      await db
        .update(projectDetails)
        .set(newDetail)
        .where(eq(projectDetails.id, detailId));
      const result = await db
        .select()
        .from(projectDetails)
        .where(eq(projectDetails.id, detailId));
      return result[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async delete(id: number) {
    await db.delete(projectDetails).where(eq(projectDetails.id, id));
    await db.delete(projects).where(eq(projects.id, id));
  }
}

export class Course {
  async getAll() {
    try {
      return await db.select().from(courses);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async getById(id: number) {
    try {
      const course = await db.select().from(courses).where(eq(courses.id, id));
      return course[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async create(course: CourseType) {
    try {
      const created = await db.insert(courses).values(course).$returningId();
      return created[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async update(id: number, newCourseData: Partial<CourseType>) {
    try {
      return await db
        .update(courses)
        .set(newCourseData)
        .where(eq(courses.id, id));
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async getDetailById(detailId: number) {
    try {
      const rows = await db
        .select()
        .from(courseDetails)
        .where(eq(courseDetails.id, detailId));
      return rows[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async addDetails(courseId: number, newCourseDetail: CourseDetailsType) {
    try {
      return await db.insert(courseDetails).values({
        ...newCourseDetail,
        courseId,
      });
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async updateDetails(detailId: number, newDetail: Partial<CourseDetailsType>) {
    try {
      await db
        .update(courseDetails)
        .set(newDetail)
        .where(eq(courseDetails.id, detailId));
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async delete(id: number) {
    await db.delete(courseDetails).where(eq(courseDetails, id));
    await db.delete(courses).where(eq(courses.id, id));
  }
}

export class Skill {
  async getAll() {
    return await db.select().from(skills);
  }

  async getById(id: number) {
    try {
      const skill = await db.select().from(skills).where(eq(skills.id, id));
      return skill[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async create(skill: SkillType) {
    try {
      const rows = await db.insert(skills).values(skill).$returningId();
      return rows[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async update(id: number, newSkillData: Partial<SkillType>) {
    try {
      await db.update(skills).set(newSkillData).where(eq(skills.id, id));
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async delete(id: number) {
    await db.delete(skills).where(eq(skills.id, id));
  }
}

export class SoftSkill {
  async getAll() {
    return await db.select().from(softSkills);
  }

  async getById(id: number) {
    try {
      const rows = await db
        .select()
        .from(softSkills)
        .where(eq(softSkills.id, id));
      return rows[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async create(softSkill: SoftSkillType) {
    try {
      const rows = await db.insert(softSkills).values(softSkill).$returningId();
      return rows[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async update(id: number, newData: Partial<SoftSkillType>) {
    try {
      await db.update(softSkills).set(newData).where(eq(softSkills.id, id));
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async delete(id: number) {
    await db.delete(softSkills).where(eq(softSkills.id, id));
  }
}

export class ProjectTech {
  async getAll() {
    return await db.select().from(projectTechnologies);
  }

  async getByProjectId(projectId: number) {
    try {
      const rows = await db
        .select()
        .from(projectTechnologies)
        .where(eq(projectTechnologies.projectId, projectId));
      return rows;
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async getByProjectIdGrouped(projectId: number) {
    const techs = await this.getByProjectId(projectId);

    const grouped = techs.reduce((acc: Record<string, string[]>, tech) => {
      const key = tech.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(tech.technology);
      return acc;
    }, {});

    return grouped;
  }

  async addTech(projectId: number, tech: Omit<ProjectTechStack, "projectId">) {
    try {
      const insertedTech = await db
        .insert(projectTechnologies)
        .values({ ...tech, projectId })
        .$returningId();
      const returningTech = await db
        .select()
        .from(projectTechnologies)
        .where(eq(projectTechnologies.id, insertedTech[0].id));
      return returningTech[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async update(projectId: number, newProjectTech: Partial<ProjectTechStack>) {
    try {
      await db
        .update(projectTechnologies)
        .set(newProjectTech)
        .where(eq(projectTechnologies.id, projectId));
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async delete(id: number) {
    try {
      await db
        .delete(projectTechnologies)
        .where(eq(projectTechnologies.id, id));
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
}
