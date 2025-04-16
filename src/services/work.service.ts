import { BaseCrudService } from "./base.service";
import { workRepository } from "./instance.repo";
import { workExperience } from "../db/schema/work.db";
import type { WorkDetailInsert } from "../db/schema/work.db";
import { NotFoundError } from "../errors/not-found.error";

export class Work extends BaseCrudService<typeof workExperience> {
  constructor() {
    super(workRepository, "id");
  }

  async getDetailById(detailId: number) {
    const record = await workRepository.getDetailById(detailId);
    if (!record) {
      throw new NotFoundError(
        `cannot get: detail ${this.primaryKey} ${detailId} not found`,
      );
    }
    return record;
  }

  async addDetail(workExpId: number, newWorkExp: WorkDetailInsert) {
    const record = await workRepository.addDetails(workExpId, newWorkExp);
    if (!record) {
      throw new Error("failed to create the record.");
    }
    return record;
  }

  async updateDetails(
    detailId: number,
    newDetailExp: Partial<WorkDetailInsert>,
  ) {
    const exists = await this.getDetailById(detailId);
    if (!exists) {
      throw new NotFoundError(
        `cannot update: detail ${this.primaryKey} ${detailId} not found`,
      );
    }
    return workRepository.updateDetails(detailId, newDetailExp);
  }

  override async delete(id: number) {
    const exists = await this.getDetailById(id);
    if (!exists) {
      throw new NotFoundError(
        `cannot delete: detail ${this.primaryKey} ${id} not found`,
      );
    }
    return workRepository.deleteProjectWithDetails(id);
  }
}
