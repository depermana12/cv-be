import type { WorkInsert, WorkSelect, WorkUpdate } from "../db/types/work.type";
import { CvChildService } from "./cvChild.service";
import { WorkRepository } from "../repositories/work.repo";

export interface IWorkService {
  updateWork(
    cvId: number,
    workId: number,
    updateData: WorkUpdate,
  ): Promise<WorkSelect>;
}

export class WorkService
  extends CvChildService<WorkSelect, WorkInsert>
  implements IWorkService
{
  constructor(private readonly workRepository: WorkRepository) {
    super(workRepository);
  }

  // Custom method: specific updateData type (removes cvId from updateData)
  async updateWork(cvId: number, workId: number, updateData: WorkUpdate) {
    return this.updateInCv(cvId, workId, updateData);
  }
}
