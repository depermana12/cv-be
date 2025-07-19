import { CvChildService } from "./cvChild.service";
import type { EducationRepository } from "../repositories/education.repo";
import type {
  EducationInsert,
  EducationQueryOptions,
  EducationSelect,
} from "../db/types/education.type";

export interface IEducationService {
  createEducation(
    cvId: number,
    educationData: Omit<EducationInsert, "cvId">,
  ): Promise<EducationSelect>;
  getEducation(cvId: number, educationId: number): Promise<EducationSelect>;
  getAllEducations(
    cvId: number,
    options?: EducationQueryOptions,
  ): Promise<EducationSelect[]>;
  updateEducation(
    cvId: number,
    educationId: number,
    newEducationData: Omit<EducationInsert, "cvId">,
  ): Promise<EducationSelect>;
  deleteEducation(cvId: number, educationId: number): Promise<boolean>;
}

export class EducationService
  extends CvChildService<EducationSelect, EducationInsert>
  implements IEducationService
{
  constructor(private readonly educationRepository: EducationRepository) {
    super(educationRepository);
  }

  async createEducation(
    cvId: number,
    educationData: Omit<EducationInsert, "cvId">,
  ) {
    return this.createInCv(cvId, { ...educationData, cvId });
  }

  async getEducation(cvId: number, educationId: number) {
    return this.getByIdInCv(cvId, educationId);
  }

  async getAllEducations(cvId: number, options?: EducationQueryOptions) {
    return this.educationRepository.getAllEducations(cvId, options);
  }

  async updateEducation(
    cvId: number,
    educationId: number,
    newEducationData: Omit<EducationInsert, "cvId">,
  ) {
    return this.updateInCv(cvId, educationId, newEducationData);
  }

  async deleteEducation(cvId: number, educationId: number) {
    return this.deleteInCv(cvId, educationId);
  }
}
