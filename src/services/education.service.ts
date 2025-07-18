import { CvChildService } from "./cvChild.service";
import type { EducationRepository } from "../repositories/education.repo";
import type {
  EducationInsert,
  EducationQueryOptions,
  EducationSelect,
} from "../db/types/education.type";

export class EducationService extends CvChildService<
  EducationSelect,
  EducationInsert
> {
  constructor(private readonly educationRepository: EducationRepository) {
    super(educationRepository);
  }

  async createEducation(
    cvId: number,
    educationData: Omit<EducationInsert, "cvId">,
  ): Promise<EducationSelect> {
    return this.createInCv(cvId, { ...educationData, cvId });
  }

  async getEducation(
    cvId: number,
    educationId: number,
  ): Promise<EducationSelect> {
    return this.getByIdInCv(cvId, educationId);
  }

  async getAllEducations(
    cvId: number,
    options?: EducationQueryOptions,
  ): Promise<EducationSelect[]> {
    return this.educationRepository.getAllEducations(cvId, options);
  }

  async updateEducation(
    cvId: number,
    educationId: number,
    newEducationData: Omit<EducationInsert, "cvId">,
  ): Promise<EducationSelect> {
    return this.updateInCv(cvId, educationId, newEducationData);
  }

  async deleteEducation(cvId: number, educationId: number): Promise<boolean> {
    return this.deleteInCv(cvId, educationId);
  }
}
