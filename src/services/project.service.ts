import { BaseCrudService } from "./base.service";
import { projectRepository } from "./instance.repo";
import { projects } from "../db/schema/project.db";
import type { ProjectDetailsInsert } from "../db/schema/project.db";
import { NotFoundError } from "../errors/not-found.error";

export class Project extends BaseCrudService<typeof projects> {
  constructor() {
    super(projectRepository, "id");
  }

  async getDetailById(detailId: number) {
    const record = await projectRepository.getDetailById(detailId);
    if (!record) {
      throw new NotFoundError(
        `cannot get: detail ${this.primaryKey} ${detailId} not found`,
      );
    }
    return record;
  }

  async addDetails(projectId: number, newProjectDetail: ProjectDetailsInsert) {
    const record = await projectRepository.addDetails(
      projectId,
      newProjectDetail,
    );
    if (!record) {
      throw new Error("failed to create the record.");
    }
    return record;
  }

  async updateDetails(
    detailId: number,
    newDetail: Partial<ProjectDetailsInsert>,
  ) {
    const exists = await this.getDetailById(detailId);
    if (!exists) {
      throw new NotFoundError(
        `cannot update: detail ${this.primaryKey} ${detailId} not found`,
      );
    }
    return projectRepository.updateDetails(detailId, newDetail);
  }

  override async delete(id: number) {
    const exists = await this.getDetailById(id);
    if (!exists) {
      throw new NotFoundError(
        `cannot delete: detail ${this.primaryKey} ${id} not found`,
      );
    }
    return projectRepository.deleteProjectWithDetails(id);
  }
}
