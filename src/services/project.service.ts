import { BaseCrudService } from "./base.service";
import { projectRepository } from "./instance.repo";
import { projects } from "../db/schema/project.db";
import type { ProjectDetailsInsert } from "../db/schema/project.db";
import { NotFoundError } from "../errors/not-found.error";

export class Project extends BaseCrudService<typeof projects> {
  constructor(private readonly repo = projectRepository) {
    super(repo, "id");
  }

  async getDetailById(detailId: number) {
    const record = await this.repo.getDetailById(detailId);
    if (!record) {
      throw new NotFoundError(
        `cannot get: detail ${this.primaryKey} ${detailId} not found`,
      );
    }
    return record;
  }

  async addDetails(projectId: number, newProjectDetail: ProjectDetailsInsert) {
    const record = await this.repo.addDetails(projectId, newProjectDetail);
    if (!record) {
      throw new Error("failed to create the record.");
    }
    return record;
  }

  async updateDetails(
    detailId: number,
    newDetail: Partial<ProjectDetailsInsert>,
  ) {
    const exists = await this.repo.getDetailById(detailId);
    if (!exists) {
      throw new NotFoundError(
        `cannot update: detail ${this.primaryKey} ${detailId} not found`,
      );
    }
    return this.repo.updateDetails(detailId, newDetail);
  }

  override async delete(id: number) {
    const exists = await this.repo.getDetailById(id);
    if (!exists) {
      throw new NotFoundError(
        `cannot delete: detail ${this.primaryKey} ${id} not found`,
      );
    }
    return this.repo.deleteProjectWithDetails(id);
  }
}
