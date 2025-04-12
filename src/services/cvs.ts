import { eq } from "drizzle-orm";
import { db } from "../db/index";

import {
  personalBasic,
  language,
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
  personalLocation,
  personalSocial,
} from "../db/schema";
import { HTTPException } from "hono/http-exception";

type PersonalBasicType = typeof personalBasic.$inferInsert;
type PersonalLocationType = typeof personalLocation.$inferInsert;
type PersonalSocialType = typeof personalSocial.$inferInsert;
type PersonalType = {
  basic: PersonalBasicType;
  location: PersonalLocationType;
  socials: PersonalSocialType[];
};
type LanguageType = typeof language.$inferInsert;
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
  async getAll() {
    try {
      return await db.select().from(personalBasic);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async getById(id: number) {
    try {
      const [basic] = await db
        .select()
        .from(personalBasic)
        .where(eq(personalBasic.id, id));

      if (!basic) {
        throw new HTTPException(404, {
          message: "invalid education id not found",
        });
      }

      const [location] = await db
        .select()
        .from(personalLocation)
        .where(eq(personalLocation.personalId, id));

      const [socials] = await db
        .select()
        .from(personalSocial)
        .where(eq(personalSocial.personalId, id));
      return {
        ...basic,
        location,
        socials,
      };
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async create(data: PersonalType) {
    try {
      const insertedBasicData = await db
        .insert(personalBasic)
        .values(data.basic)
        .$returningId();
      const personalId = insertedBasicData[0].id;

      await db
        .insert(personalLocation)
        .values({ ...data.location, personalId });

      if (data.socials.length > 0) {
        await db.insert(personalSocial).values(
          data.socials.map((social) => ({
            ...social,
            personalId,
          })),
        );
      }

      return this.getById(personalId);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async update(personalId: number, data: PersonalType) {
    try {
      await db
        .update(personalBasic)
        .set(data.basic)
        .where(eq(personalBasic.id, personalId));

      await db
        .update(personalLocation)
        .set(data.location)
        .where(eq(personalLocation.personalId, personalId));

      await db
        .delete(personalSocial)
        .where(eq(personalSocial.personalId, personalId));

      if (data.socials.length > 0) {
        await db
          .insert(personalSocial)
          .values(data.socials.map((social) => ({ ...social, personalId })));
      }

      return this.getById(personalId);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async delete(personalId: number) {
    try {
      await db
        .delete(personalSocial)
        .where(eq(personalSocial.personalId, personalId));
      await db
        .delete(personalLocation)
        .where(eq(personalLocation.personalId, personalId));
      await db.delete(personalBasic).where(eq(personalBasic.id, personalId));
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
}

export class Language {
  async getById(id: number) {
    try {
      const rows = await db.select().from(language).where(eq(language.id, id));
      return rows[0] ?? null;
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async create(personalId: number, data: LanguageType) {
    try {
      const [insertedLang] = await db
        .insert(language)
        .values({ ...data, personalId })
        .$returningId();
      return this.getById(insertedLang.id);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async getAllByPersonalId(personalId: number) {
    try {
      const rows = db
        .select()
        .from(language)
        .where(eq(language.personalId, personalId));
      return rows;
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async update(id: number, data: Partial<LanguageType>) {
    try {
      await db.update(language).set(data).where(eq(language.id, id));
      return this.getById(id);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async delete(id: number) {
    try {
      await db.delete(language).where(eq(language.id, id));
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
}

export class Education {
  async getAll() {
    try {
      return await db.select().from(education);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async getById(educationId: number) {
    try {
      const rows = await db
        .select()
        .from(education)
        .where(eq(education.id, educationId));
      return rows[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async create(eduData: EducationType) {
    try {
      const insertedEducation = await db
        .insert(education)
        .values(eduData)
        .$returningId();
      return this.getById(insertedEducation[0].id);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async update(educationId: number, newEduData: EducationType) {
    try {
      await db
        .update(education)
        .set(newEduData)
        .where(eq(education.id, educationId));
      return this.getById(educationId);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async delete(educationId: number) {
    try {
      await db.delete(education).where(eq(education.id, educationId));
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
}

export class Work {
  async getAll() {
    try {
      return await db.select().from(workExperience);
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async getById(workId: number) {
    try {
      const rows = await db
        .select()
        .from(workExperience)
        .where(eq(workExperience.id, workId));
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
      return this.getById(insertedWorkExp[0].id);
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async update(workId: number, newExperience: WorkExpType) {
    try {
      await db
        .update(workExperience)
        .set(newExperience)
        .where(eq(workExperience.id, workId));
      return this.getById(workId);
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
      return this.getDetailById(insertedDetail[0].id);
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
      return this.getDetailById(detailId);
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

export class Organization {
  async getAll() {
    try {
      return await db.select().from(organizationExperience);
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async getById(organizationId: number) {
    try {
      const rows = await db
        .select()
        .from(organizationExperience)
        .where(eq(organizationExperience.id, organizationId));
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
      return this.getById(insertedOrgExp[0].id);
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async update(organizationId: number, newOrgExp: OrgExpType) {
    try {
      await db
        .update(organizationExperience)
        .set(newOrgExp)
        .where(eq(organizationExperience.id, organizationId));
      return this.getById(organizationId);
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
      return this.getDetailById(insertedDetail[0].id);
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
      return this.getDetailById(detailId);
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
  async getById(projectId: number) {
    try {
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId));
      return project[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async create(project: ProjectType) {
    try {
      const insertedProject = await db
        .insert(projects)
        .values(project)
        .$returningId();
      return this.getById(insertedProject[0].id);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async update(projectId: number, newProjectData: Partial<ProjectType>) {
    try {
      await db
        .update(projects)
        .set(newProjectData)
        .where(eq(projects.id, projectId));
      return this.getById(projectId);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async getDetailById(detailId: number) {
    try {
      const rows = await db
        .select()
        .from(projectDetails)
        .where(eq(projectDetails.id, detailId));
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
      return this.getDetailById(insertedDetail[0].id);
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
      return this.getDetailById(detailId);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async delete(id: number) {
    try {
      await db.delete(projectDetails).where(eq(projectDetails.id, id));
      await db.delete(projects).where(eq(projects.id, id));
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
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
  async getById(courseId: number) {
    try {
      const rows = await db
        .select()
        .from(courses)
        .where(eq(courses.id, courseId));
      return rows[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async create(course: CourseType) {
    try {
      const insertedCourse = await db
        .insert(courses)
        .values(course)
        .$returningId();
      return this.getById(insertedCourse[0].id);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async update(courseId: number, newCourseData: Partial<CourseType>) {
    try {
      await db
        .update(courses)
        .set(newCourseData)
        .where(eq(courses.id, courseId));
      return this.getById(courseId);
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
      const insertedDetail = await db
        .insert(courseDetails)
        .values({
          ...newCourseDetail,
          courseId,
        })
        .$returningId();
      return this.getById(insertedDetail[0].id);
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
      return this.getDetailById(detailId);
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
    try {
      return await db.select().from(skills);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async getById(skillId: number) {
    try {
      const rows = await db.select().from(skills).where(eq(skills.id, skillId));
      return rows[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async getCategories() {
    try {
      // const rows = await db.select().from(skills);
      // const unique = new Set(rows.map((row) => row.category));
      // const categories = Array.from(unique);
      // return categories;

      const rows = await db
        .selectDistinct({ category: skills.category })
        .from(skills);
      const categories = rows.map((row) => row.category);
      return categories;
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async create(skill: SkillType) {
    try {
      const insertedSkill = await db
        .insert(skills)
        .values(skill)
        .$returningId();
      return await this.getById(insertedSkill[0].id);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async update(skillId: number, newSkillData: Partial<SkillType>) {
    try {
      await db.update(skills).set(newSkillData).where(eq(skills.id, skillId));
      return this.getById(skillId);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async delete(skillId: number) {
    try {
      await db.delete(skills).where(eq(skills.id, skillId));
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
}

export class SoftSkill {
  async getAll() {
    try {
      return await db.select().from(softSkills);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async getById(softSkillId: number) {
    try {
      const rows = await db
        .select()
        .from(softSkills)
        .where(eq(softSkills.id, softSkillId));
      return rows[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async create(softSkill: SoftSkillType) {
    try {
      const insertedSoftSkill = await db
        .insert(softSkills)
        .values(softSkill)
        .$returningId();
      return await this.getById(insertedSoftSkill[0].id);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async update(softSkillId: number, newData: Partial<SoftSkillType>) {
    try {
      await db
        .update(softSkills)
        .set(newData)
        .where(eq(softSkills.id, softSkillId));
      return await this.getById(softSkillId);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async delete(softSkillId: number) {
    try {
      await db.delete(softSkills).where(eq(softSkills.id, softSkillId));
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
}

export class ProjectTech {
  async getAll() {
    try {
      return await db.select().from(projectTechnologies);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async getById(projectId: number) {
    try {
      const rows = await db
        .select()
        .from(projectTechnologies)
        .where(eq(projectTechnologies.projectId, projectId));
      return rows[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async getByProjectIdGrouped() {
    const techs = await this.getAll();

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
      return this.getById(insertedTech[0].id);
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
      return this.getById(projectId);
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
