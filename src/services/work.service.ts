import type { WorkInsert, WorkSelect } from "../db/types/work.type";
import { CvChildService } from "./cvChild.service";
import { WorkRepository } from "../repositories/work.repo";

export class WorkService extends CvChildService<WorkSelect, WorkInsert> {
  constructor(private readonly workRepository: WorkRepository) {
    super(workRepository);
  }
}
