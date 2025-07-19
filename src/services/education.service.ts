import { CvChildService } from "./cvChild.service";
import type { EducationRepository } from "../repositories/education.repo";
import type {
  EducationInsert,
  EducationSelect,
  EducationUpdate,
} from "../db/types/education.type";

export interface IEducationService {
  updateEducation(
    cvId: number,
    educationId: number,
    newEducationData: EducationUpdate,
  ): Promise<EducationSelect>;
}

export class EducationService
  extends CvChildService<EducationSelect, EducationInsert>
  implements IEducationService
{
  constructor(private readonly educationRepository: EducationRepository) {
    super(educationRepository);
  }

  // Custom method: specific updateData type (removes cvId from updateData)
  async updateEducation(
    cvId: number,
    educationId: number,
    newEducationData: EducationUpdate,
  ) {
    return this.updateInCv(cvId, educationId, newEducationData);
  }
}
