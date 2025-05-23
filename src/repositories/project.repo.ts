import { eq, like, sql } from "drizzle-orm";

import { CvChildRepository } from "./cvChild.repo";
import {
  projects,
  projectDescription,
  projectTechnologies,
} from "../db/schema/project.db";
import type {
  ProjectInsert,
  ProjectDescInsert,
  ProjectTechStackInsert,
  ProjectSelect,
  ProjectUpdate,
} from "../db/types/project.type";
import { getDb } from "../db";

const db = await getDb();
export class ProjectRepository extends CvChildRepository<
  typeof projects,
  ProjectInsert,
  ProjectSelect,
  ProjectUpdate
> {
  constructor() {
    super(projects, db);
  }

  /**
   * Search for projects by name.
   * @param term The search term.
   * @description It uses the `like` but mimics `ilike` by converting both the column and the term to lower case.
   */
  async searchProject(term: string) {
    return this.db.query.projects.findMany({
      where: like(sql`lower(${projects.name})`, `%${term.toLowerCase()}%`),
      with: {
        descriptions: true,
      },
    });
  }

  async getByIdWithDescriptions(id: number) {
    return this.db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: {
        descriptions: true,
      },
    });
  }

  async getAllByIdWithDescriptions(cvId: number) {
    return this.db.query.projects.findMany({
      where: eq(projects.cvId, cvId),
      with: {
        descriptions: true,
      },
    });
  }

  async createProjectWithDescriptions(
    projectData: ProjectInsert,
    descriptions: ProjectDescInsert[],
  ) {
    return this.db.transaction(async (tx) => {
      const [project] = await tx
        .insert(projects)
        .values(projectData)
        .$returningId();

      if (descriptions.length > 0) {
        await tx
          .insert(projectDescription)
          .values(
            descriptions.map((desc) => ({ ...desc, projectId: project.id })),
          );
      }
      return project.id;
    });
  }

  async deleteProjectWithDescriptions(id: number): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      await tx
        .delete(projectDescription)
        .where(eq(projectDescription.projectId, id));
      await tx
        .delete(projectTechnologies)
        .where(eq(projectTechnologies.projectId, id));
      const [result] = await tx.delete(projects).where(eq(projects.id, id));
      return result.affectedRows > 0;
    });
  }

  async createDescription(projectId: number, description: ProjectDescInsert) {
    const [desc] = await this.db
      .insert(projectDescription)
      .values({ ...description, projectId })
      .$returningId();

    return desc.id;
  }

  async getDescriptionById(descId: number) {
    const [result] = await this.db
      .select()
      .from(projectDescription)
      .where(eq(projectDescription.id, descId));
    return result ?? null;
  }

  async getAllDescriptions(projectId: number) {
    return this.db
      .select()
      .from(projectDescription)
      .where(eq(projectDescription.projectId, projectId));
  }

  async updateDescription(descId: number, newDescription: ProjectDescInsert) {
    const [result] = await this.db
      .update(projectDescription)
      .set(newDescription)
      .where(eq(projectDescription.id, descId));

    return result.affectedRows > 0;
  }

  async deleteDescription(descId: number) {
    const [result] = await this.db
      .delete(projectDescription)
      .where(eq(projectDescription.id, descId));

    return result.affectedRows > 0;
  }

  async addTechnologies(
    projectId: number,
    technologies: ProjectTechStackInsert[],
  ) {
    const [result] = await this.db
      .insert(projectTechnologies)
      .values(technologies.map((tech) => ({ ...tech, projectId })))
      .$returningId();

    return result;
  }

  async getTechnologies(projectId: number) {
    return this.db
      .select()
      .from(projectTechnologies)
      .where(eq(projectTechnologies.projectId, projectId));
  }

  async updateTechnologies(
    projectId: number,
    technologies: ProjectTechStackInsert[],
  ) {
    await this.deleteTechnologies(projectId);
    return this.addTechnologies(projectId, technologies);
  }

  async deleteTechnologies(projectId: number) {
    const [result] = await this.db
      .delete(projectTechnologies)
      .where(eq(projectTechnologies.projectId, projectId));

    return result.affectedRows > 0;
  }
}
