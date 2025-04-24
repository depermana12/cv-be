import { eq } from "drizzle-orm";

import { BaseRepository } from "./base.repo";
import { db } from "../db/index";
import { projects, projectDescription } from "../db/schema/project.db";
import type {
  ProjectInsert,
  ProjectDetailsInsert,
} from "../db/schema/project.db";

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
  async getDetail(projectId: number) {
    const rows = await this.db
      .select()
      .from(projectDescription)
      .where(eq(projectDescription.id, projectId));
    return rows[0];
  }
  async addDetail(projectId: number, newProjectDetail: ProjectDetailsInsert) {
    const [insertedDetail] = await this.db
      .insert(projectDescription)
      .values({ ...newProjectDetail, projectId })
      .$returningId();
    return this.getById(insertedDetail.id);
  }

  async updateDetails(
    detailId: number,
    newDetail: Partial<ProjectDetailsInsert>,
  ) {
    await this.db
      .update(projectDescription)
      .set(newDetail)
      .where(eq(projectDescription.id, detailId));
    return this.getDetail(detailId);
  }
  async deleteProjectWithDetails(id: number) {
    await this.db
      .delete(projectDescription)
      .where(eq(projectDescription.projectId, id));
    await this.db.delete(projects).where(eq(projects.id, id));
  }
}
