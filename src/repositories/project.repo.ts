import { and, asc, desc, eq, like, sql } from "drizzle-orm";

import { CvChildRepository } from "./cvChild.repo";
import {
  projects,
  projectDescription,
  projectTechnologies,
} from "../db/schema/project.db";
import type {
  ProjectInsert,
  ProjectDescInsert,
  ProjectTechInsert,
  ProjectSelect,
  ProjectUpdate,
  ProjectDescSelect,
  ProjectQueryOptions,
  ProjectWithDescriptionsAndTech,
  ProjectWithDescAndTechInsert,
  ProjectTechSelect,
  ProjectWithDescAndTechUpdate,
  ProjectDescUpdate,
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

  // ---------------------
  // Project Core
  // ---------------------

  async getProjectWithDescriptions(id: number) {
    return this.db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: {
        descriptions: true,
      },
    });
  }

  async getAllProjects(cvId: number, options?: ProjectQueryOptions) {
    const whereClause = [eq(projects.cvId, cvId)];

    if (options?.search) {
      const searchTerm = `%${options.search.toLowerCase()}%`;
      whereClause.push(like(sql`lower(${projects.name})`, searchTerm));
    }

    return this.db.query.projects.findMany({
      where: and(...whereClause),
      orderBy: options?.sortBy
        ? [
            options.sortOrder === "desc"
              ? desc(projects[options.sortBy])
              : asc(projects[options.sortBy]),
          ]
        : [],
    });
  }

  async getAllProjectsWithDescriptions(
    cvId: number,
    options?: ProjectQueryOptions,
  ) {
    const whereClause = [eq(projects.cvId, cvId)];

    if (options?.search) {
      const searchTerm = `%${options.search.toLowerCase()}%`;
      whereClause.push(like(sql`lower(${projects.name})`, searchTerm));
    }

    return this.db.query.projects.findMany({
      where: and(...whereClause),
      with: {
        descriptions: true,
      },
      orderBy: options?.sortBy
        ? [
            options.sortOrder === "desc"
              ? desc(projects[options.sortBy])
              : asc(projects[options.sortBy]),
          ]
        : [],
    });
  }

  async getProjectFullByCvId(
    projectId: number,
  ): Promise<ProjectWithDescriptionsAndTech | null> {
    const project = await this.db.query.projects.findFirst({
      where: eq(projects.id, projectId),
      with: {
        descriptions: true,
        technologies: true,
      },
    });
    if (!project) {
      throw new Error(`Project with id ${projectId} not found`);
    }
    return project;
  }

  async getAllProjectsFullByCvId(
    cvId: number,
    options?: ProjectQueryOptions,
  ): Promise<ProjectWithDescriptionsAndTech[]> {
    const whereClause = [eq(projects.cvId, cvId)];

    if (options?.search) {
      const searchTerm = `%${options.search.toLowerCase()}%`;
      whereClause.push(like(sql`lower(${projects.name})`, searchTerm));
    }

    return this.db.query.projects.findMany({
      where: and(...whereClause),
      with: {
        descriptions: true,
        technologies: true,
      },
      orderBy: options?.sortBy
        ? [
            options.sortOrder === "desc"
              ? desc(projects[options.sortBy])
              : asc(projects[options.sortBy]),
          ]
        : [],
    });
  }

  // ---------------------
  // Descriptions
  // ---------------------

  async createDescription(
    projectId: number,
    description: Omit<ProjectDescInsert, "projectId">,
  ): Promise<{ id: number }> {
    const [desc] = await this.db
      .insert(projectDescription)
      .values({ ...description, projectId })
      .$returningId();

    return { id: desc.id };
  }

  async getDescriptionById(descId: number): Promise<ProjectDescSelect | null> {
    const [result] = await this.db
      .select()
      .from(projectDescription)
      .where(eq(projectDescription.id, descId));
    return result ?? null;
  }

  async getAllDescriptions(projectId: number): Promise<ProjectDescSelect[]> {
    return this.db
      .select()
      .from(projectDescription)
      .where(eq(projectDescription.projectId, projectId));
  }

  async updateDescription(
    descId: number,
    newDescription: ProjectDescUpdate,
  ): Promise<boolean> {
    const [result] = await this.db
      .update(projectDescription)
      .set(newDescription)
      .where(eq(projectDescription.id, descId));

    return result.affectedRows > 0;
  }

  async deleteDescription(descId: number): Promise<boolean> {
    const [result] = await this.db
      .delete(projectDescription)
      .where(eq(projectDescription.id, descId));

    return result.affectedRows > 0;
  }

  // ---------------------
  // Technologies
  // ---------------------

  async addTechnologies(
    projectId: number,
    technologies: ProjectTechInsert[],
  ): Promise<{ id: number }> {
    const [result] = await this.db
      .insert(projectTechnologies)
      .values(technologies.map((tech) => ({ ...tech, projectId })))
      .$returningId();

    return { id: result.id };
  }

  async addOneTechnology(
    projectId: number,
    technology: ProjectTechInsert,
  ): Promise<{ id: number }> {
    const [result] = await this.db
      .insert(projectTechnologies)
      .values({ ...technology, projectId })
      .$returningId();

    return { id: result.id };
  }

  async getAllTechnologies(projectId: number): Promise<ProjectTechSelect[]> {
    return this.db
      .select()
      .from(projectTechnologies)
      .where(eq(projectTechnologies.projectId, projectId));
  }

  async getTechnologyById(
    projectId: number,
    techId: number,
  ): Promise<ProjectTechSelect | null> {
    const [result] = await this.db
      .select()
      .from(projectTechnologies)
      .where(
        and(
          eq(projectTechnologies.projectId, projectId),
          eq(projectTechnologies.id, techId),
        ),
      );
    return result ?? null;
  }

  async updateOneTechnology(
    projectId: number,
    techId: number,
    newTechnology: ProjectTechInsert,
  ): Promise<boolean> {
    const [result] = await this.db
      .update(projectTechnologies)
      .set(newTechnology)
      .where(
        and(
          eq(projectTechnologies.projectId, projectId),
          eq(projectTechnologies.id, techId),
        ),
      );

    return result.affectedRows > 0;
  }

  async updateManyTechnologies(
    projectId: number,
    technologies: ProjectTechInsert[],
  ) {
    await this.db.transaction(async (tx) => {
      await tx
        .delete(projectTechnologies)
        .where(eq(projectTechnologies.projectId, projectId));

      if (technologies.length > 0) {
        await tx
          .insert(projectTechnologies)
          .values(technologies.map((tech) => ({ ...tech, projectId })));
      }
    });
  }

  async deleteTechnology(projectId: number): Promise<boolean> {
    const [result] = await this.db
      .delete(projectTechnologies)
      .where(eq(projectTechnologies.projectId, projectId));

    return result.affectedRows > 0;
  }

  // ---------------------
  // Bulk operations: Project with Descriptions and Technologies
  // ---------------------

  async createProjectWithDescriptions(
    projectData: ProjectInsert,
    descriptions: Omit<ProjectDescInsert, "projectId">[],
  ): Promise<{ id: number }> {
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
      return { id: project.id };
    });
  }

  async createProjectFull(
    projectData: ProjectInsert,
    descriptions: Omit<ProjectDescInsert, "projectId">[],
    technologies: Omit<ProjectTechInsert, "projectId">[],
  ): Promise<{ id: number }> {
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

      if (technologies.length > 0) {
        await tx
          .insert(projectTechnologies)
          .values(
            technologies.map((tech) => ({ ...tech, projectId: project.id })),
          );
      }

      return { id: project.id };
    });
  }

  async updateProjectFull(
    projectId: number,
    projectData: ProjectWithDescAndTechUpdate,
  ): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      const { project, descriptions, technologies } = projectData;

      const [result] = await tx
        .update(projects)
        .set(project ? project : {})
        .where(eq(projects.id, projectId));

      if (result.affectedRows === 0) {
        return false;
      }

      if ((descriptions ?? []).length > 0) {
        await tx
          .delete(projectDescription)
          .where(eq(projectDescription.projectId, projectId));
        await tx
          .insert(projectDescription)
          .values((descriptions ?? []).map((desc) => ({ ...desc, projectId })));
      }

      if ((technologies ?? []).length > 0) {
        await tx
          .delete(projectTechnologies)
          .where(eq(projectTechnologies.projectId, projectId));
        await tx.insert(projectTechnologies).values(
          (technologies ?? []).map((tech) => ({
            category: tech.category ?? "",
            technology: tech.technology ?? "",
            projectId,
          })),
        );
      }

      return true;
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

  async deleteProjectFull(id: number): Promise<boolean> {
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
}
