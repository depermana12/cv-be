import { eq } from "drizzle-orm";

import { BaseRepository } from "./base.repo";
import { db } from "../db/index";
import {
  projects,
  projectDescription,
  projectTechnologies,
} from "../db/schema/project.db";
import type {
  ProjectInsert,
  ProjectDescInsert,
} from "../db/types/project.type";

export class ProjectRepository extends BaseRepository<
  typeof projects,
  ProjectInsert
> {
  constructor() {
    super(db, projects);
  }
  async searchProject(term: string) {
    return this.findMany({
      search: {
        columns: ["name"],
        term: term,
      },
    });
  }
  async getByIdWithDescription(id: number) {
    return await this.db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: {
        descriptions: true,
      },
    });
  }
  async getDescription(descId: number) {
    const rows = await this.db
      .select()
      .from(projectDescription)
      .where(eq(projectDescription.projectId, descId));
    return rows[0] ?? null;
  }
  async addDescription(projectId: number, description: ProjectDescInsert) {
    const [insertedDetail] = await this.db
      .insert(projectDescription)
      .values({ ...description, projectId })
      .$returningId();
    return this.getById(insertedDetail.id);
  }

  async updateDescription(
    descId: number,
    newDescription: Partial<ProjectDescInsert>,
  ) {
    await this.db
      .update(projectDescription)
      .set(newDescription)
      .where(eq(projectDescription.id, descId));
    return this.getDescription(descId);
  }
  async deleteProjectCascade(id: number) {
    await this.db
      .delete(projectDescription)
      .where(eq(projectDescription.projectId, id));
    await this.db
      .delete(projectTechnologies)
      .where(eq(projectTechnologies.projectId, id));
    await this.db.delete(projects).where(eq(projects.id, id));
  }
}
