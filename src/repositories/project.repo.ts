import { eq } from "drizzle-orm";

import { BaseRepository } from "./base.repo";
import { db } from "../db/index";
import { projects, projectDetails } from "../db/schema/project.db";
import type {
  ProjectInsert,
  ProjectDetailsInsert,
  ProjectSelect,
} from "../db/schema/project.db";

export class ProjectRepository extends BaseRepository<
  typeof projects,
  ProjectSelect,
  ProjectInsert
> {
  constructor() {
    super(db, projects, "id");
  }
  async getDetail(projectId: number) {
    const rows = await this.db
      .select()
      .from(projectDetails)
      .where(eq(projectDetails.id, projectId));
    return rows[0];
  }
  async addDetail(projectId: number, newProjectDetail: ProjectDetailsInsert) {
    const [insertedDetail] = await this.db
      .insert(projectDetails)
      .values({ ...newProjectDetail, projectId })
      .$returningId();
    return this.getById(insertedDetail.id);
  }

  async updateDetails(
    detailId: number,
    newDetail: Partial<ProjectDetailsInsert>,
  ) {
    await this.db
      .update(projectDetails)
      .set(newDetail)
      .where(eq(projectDetails.id, detailId));
    return this.getDetail(detailId);
  }
  async deleteProjectWithDetails(id: number) {
    await this.db
      .delete(projectDetails)
      .where(eq(projectDetails.projectId, id));
    await this.db.delete(projects).where(eq(projects.id, id));
  }
}
