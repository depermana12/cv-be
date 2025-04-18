import { eq } from "drizzle-orm";

import { BaseRepository } from "./base.repo";
import { db } from "../db/index";
import { projects, projectDetails } from "../db/schema/project.db";
import type {
  ProjectInsert,
  ProjectDetailsInsert,
} from "../db/schema/project.db";

export class ProjectRepository extends BaseRepository<
  typeof projects,
  ProjectInsert
> {
  constructor() {
    super(projects, "id");
  }
  async getDetailById(projectId: number) {
    const rows = await db
      .select()
      .from(projectDetails)
      .where(eq(projectDetails.id, projectId));
    return rows[0];
  }
  async addDetails(projectId: number, newProjectDetail: ProjectDetailsInsert) {
    const insertedDetail = await db
      .insert(projectDetails)
      .values({ ...newProjectDetail, projectId })
      .$returningId();
    return this.getById(insertedDetail[0].id);
  }

  async updateDetails(
    detailId: number,
    newDetail: Partial<ProjectDetailsInsert>,
  ) {
    await db
      .update(projectDetails)
      .set(newDetail)
      .where(eq(projectDetails.id, detailId));
    return this.getDetailById(detailId);
  }
  async deleteProjectWithDetails(id: number) {
    await db.delete(projectDetails).where(eq(projectDetails.projectId, id));
    await db.delete(projects).where(eq(projects.id, id));
  }
}
