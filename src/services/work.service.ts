import { BaseCrudService } from "./base.service";
import { workRepository } from "./instance.repo";
import { workExperience } from "../db/schema/work.db";
import type { WorkDetailInsert } from "../db/index.types";

export class Work extends BaseCrudService<typeof workExperience> {
  constructor() {
    super(workRepository, "id");
  }

  async getDetailById(detailId: number) {
    return workRepository.getDetailById(detailId);
  }

  async addDetail(workExpId: number, newWorkExp: WorkDetailInsert) {
    return workRepository.addDetails(workExpId, newWorkExp);
  }

  async updateDetails(
    detailId: number,
    newDetailExp: Partial<WorkDetailInsert>,
  ) {
    return workRepository.updateDetails(detailId, newDetailExp);
  }

  override async delete(id: number) {
    return workRepository.deleteProjectWithDetails(id);
  }
}
