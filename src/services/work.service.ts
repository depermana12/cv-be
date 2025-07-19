import type {
  WorkInsert,
  WorkQueryOptions,
  WorkSelect,
} from "../db/types/work.type";
import { CvChildService } from "./cvChild.service";
import { WorkRepository } from "../repositories/work.repo";

export interface IWorkService {
  createWork(
    cvId: number,
    workData: Omit<WorkInsert, "cvId">,
  ): Promise<WorkSelect>;
  getWork(cvId: number, workId: number): Promise<WorkSelect>;
  getAllWorks(cvId: number, options?: WorkQueryOptions): Promise<WorkSelect[]>;
  updateWork(
    cvId: number,
    workId: number,
    updateData: Omit<WorkInsert, "cvId">,
  ): Promise<WorkSelect>;
  deleteWork(cvId: number, workId: number): Promise<boolean>;
}

export class WorkService
  extends CvChildService<WorkSelect, WorkInsert>
  implements IWorkService
{
  constructor(private readonly workRepository: WorkRepository) {
    super(workRepository);
  }
  async createWork(cvId: number, workData: Omit<WorkInsert, "cvId">) {
    return this.createInCv(cvId, { ...workData, cvId });
  }

  async getWork(cvId: number, workId: number) {
    return this.getByIdInCv(cvId, workId);
  }

  async getAllWorks(cvId: number, options?: WorkQueryOptions) {
    return this.workRepository.getAllWorks(cvId, options);
  }

  async updateWork(
    cvId: number,
    workId: number,
    updateData: Omit<WorkInsert, "cvId">,
  ) {
    return this.updateInCv(cvId, workId, updateData);
  }

  async deleteWork(cvId: number, workId: number) {
    return this.deleteInCv(cvId, workId);
  }
}
