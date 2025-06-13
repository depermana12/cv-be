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
  ProjectTechSelect,
  ProjectFullSelect,
} from "../db/types/project.type";
import type { Database } from "../db/index";
export class ProjectRepository extends CvChildRepository<
  typeof projects,
  ProjectInsert,
  ProjectSelect,
  ProjectUpdate
> {
  constructor(db: Database) {
    super(projects, db);
  }
  async getAllProjects(cvId: number, options?: ProjectQueryOptions) {
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

  async getProjectById(id: number): Promise<ProjectFullSelect | null> {
    const result = await this.db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: {
        descriptions: true,
        technologies: true,
      },
    });
    return result ?? null;
  }

  async createProject(
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

  async updateProject(
    id: number,
    projectData: ProjectUpdate,
    descriptions?: Omit<ProjectDescInsert, "projectId">[],
    technologies?: Omit<ProjectTechInsert, "projectId">[],
  ): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      // Update main project
      if (Object.keys(projectData).length > 0) {
        const [result] = await tx
          .update(projects)
          .set(projectData)
          .where(eq(projects.id, id));

        if (result.affectedRows === 0) return false;
      }

      // Replace descriptions if provided
      if (descriptions !== undefined) {
        await tx
          .delete(projectDescription)
          .where(eq(projectDescription.projectId, id));
        if (descriptions.length > 0) {
          await tx
            .insert(projectDescription)
            .values(descriptions.map((desc) => ({ ...desc, projectId: id })));
        }
      }

      // Replace technologies if provided
      if (technologies !== undefined) {
        await tx
          .delete(projectTechnologies)
          .where(eq(projectTechnologies.projectId, id));
        if (technologies.length > 0) {
          await tx
            .insert(projectTechnologies)
            .values(technologies.map((tech) => ({ ...tech, projectId: id })));
        }
      }

      return true;
    });
  }

  async deleteProject(id: number): Promise<boolean> {
    const [result] = await this.db.delete(projects).where(eq(projects.id, id));
    return result.affectedRows > 0;
  }

  async getDescriptions(projectId: number): Promise<ProjectDescSelect[]> {
    return this.db
      .select()
      .from(projectDescription)
      .where(eq(projectDescription.projectId, projectId));
  }

  async getTechnologies(projectId: number): Promise<ProjectTechSelect[]> {
    return this.db
      .select()
      .from(projectTechnologies)
      .where(eq(projectTechnologies.projectId, projectId));
  }

  async addDescription(
    projectId: number,
    description: Omit<ProjectDescInsert, "projectId">,
  ): Promise<{ id: number }> {
    const [result] = await this.db
      .insert(projectDescription)
      .values({ ...description, projectId })
      .$returningId();
    return { id: result.id };
  }

  async addTechnology(
    projectId: number,
    technology: Omit<ProjectTechInsert, "projectId">,
  ): Promise<{ id: number }> {
    const [result] = await this.db
      .insert(projectTechnologies)
      .values({ ...technology, projectId })
      .$returningId();
    return { id: result.id };
  }
}
