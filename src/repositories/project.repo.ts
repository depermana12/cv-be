import { and, asc, desc, eq, like, sql } from "drizzle-orm";

import { CvChildRepository } from "./cvChild.repo";
import { projects } from "../db/schema/project.db";
import type {
  ProjectInsert,
  ProjectSelect,
  ProjectUpdate,
  ProjectQueryOptions,
} from "../db/types/project.type";

export interface IProjectRepository {
  getProject(cvId: number, projectId: number): Promise<ProjectSelect | null>;
  getAllProjects(
    cvId: number,
    options?: ProjectQueryOptions,
  ): Promise<ProjectSelect[]>;
  createProject(
    cvId: number,
    projectData: ProjectInsert,
  ): Promise<ProjectSelect>;
  updateProject(
    cvId: number,
    projectId: number,
    projectData: ProjectUpdate,
  ): Promise<ProjectSelect>;
  deleteProject(cvId: number, projectId: number): Promise<boolean>;
}
import type { Database } from "../db/index";

export class ProjectRepository
  extends CvChildRepository<typeof projects, ProjectInsert, ProjectSelect, "id">
  implements IProjectRepository
{
  constructor(db: Database) {
    super(projects, db, "id");
  }

  async getProject(cvId: number, projectId: number) {
    return this.getByIdInCv(cvId, projectId);
  }

  async getAllProjects(cvId: number, options?: ProjectQueryOptions) {
    const whereClause = [eq(projects.cvId, cvId)];

    if (options?.search) {
      const searchTerm = `%${options.search.toLowerCase()}%`;
      whereClause.push(like(sql`lower(${projects.name})`, searchTerm));
    }

    return this.db
      .select()
      .from(projects)
      .where(and(...whereClause))
      .orderBy(
        options?.sortBy
          ? options.sortOrder === "desc"
            ? desc(projects[options.sortBy])
            : asc(projects[options.sortBy])
          : desc(projects.startDate),
      );
  }

  async createProject(cvId: number, projectData: ProjectInsert) {
    return this.createInCv(cvId, projectData);
  }

  async updateProject(
    cvId: number,
    projectId: number,
    projectData: ProjectUpdate,
  ) {
    return this.updateInCv(cvId, projectId, projectData);
  }

  async deleteProject(cvId: number, projectId: number) {
    return this.deleteInCv(cvId, projectId);
  }
}
