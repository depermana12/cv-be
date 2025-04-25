import { BaseCrudService } from "./base.service";
import { workRepository } from "./instance.repo";
import type {
  WorkDescInsert,
  WorkInsert,
  WorkSelect,
} from "../db/schema/work.db";
import { NotFoundError } from "../errors/not-found.error";

export class WorkService extends BaseCrudService<WorkSelect, WorkInsert> {
  constructor(private readonly repo = workRepository) {
    super(repo);
  }

  async getDetailById(detailId: number) {
    const record = await this.repo.getDescription(detailId);
    if (!record) {
      throw new NotFoundError(`cannot get: detail ${detailId} not found`);
    }
    return record;
  }

  async addDetail(workExpId: number, newWorkExp: WorkDescInsert) {
    const record = await this.repo.addDescription(workExpId, newWorkExp);
    if (!record) {
      throw new Error("failed to create the record.");
    }
    return record;
  }

  async updateDetails(detailId: number, newDetailExp: Partial<WorkDescInsert>) {
    const exists = await this.repo.getDescription(detailId);
    if (!exists) {
      throw new NotFoundError(`cannot update: detail ${detailId} not found`);
    }
    return this.repo.updateDescription(detailId, newDetailExp);
  }

  override async delete(id: number) {
    const exists = await this.getDetailById(id);
    if (!exists) {
      throw new NotFoundError(`cannot delete: detail ${id} not found`);
    }
    return this.repo.deleteProjectCascade(id);
  }
}
