import { CvChildService } from "../cvChild.service";
import type { WorkInsert, WorkSelect } from "../../db/types/work.type";
import { WorkRepository } from "../../repositories/cvChildren/work.repo";

export class WorkService extends CvChildService<WorkSelect, WorkInsert> {
  constructor(private readonly workRepository: WorkRepository) {
    super(workRepository);
  }
}
