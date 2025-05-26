import { CvChildService } from "./cvChild.service";
import { educationRepository } from "./instance.repo";
import type {
  EducationInsert,
  EducationQueryOptions,
  EducationSelect,
  EducationUpdate,
} from "../db/types/education.type";

export class EducationService extends CvChildService<
  EducationSelect,
  EducationInsert,
  EducationUpdate
> {
  constructor(private readonly repo = educationRepository) {
    super(repo);
  }

  async createEducation(
    cvId: number,
    educationData: Omit<EducationInsert, "cvId">,
  ): Promise<EducationSelect> {
    return this.createForCv(cvId, { ...educationData, cvId });
  }

  async getEducation(
    cvId: number,
    educationId: number,
  ): Promise<EducationSelect> {
    return this.findByCvId(cvId, educationId);
  }

  /**
   * Get all education entries for a specific CV.
   * Uses method from the repository not cvChild service.
   * @param cvId - The ID of the CV.
   * @param options - Query options for filtering and sorting.
   * @param options.search - Optional search term to filter by institution name.
   * @param options.sortBy - Optional field to sort by (e.g., "startDate", "endDate").
   * @param options.sortOrder - Optional sort order ("asc" or "desc").
   * @returns A promise that resolves to an array of EducationSelect objects.
   */
  async getAllEducations(
    cvId: number,
    options?: EducationQueryOptions,
  ): Promise<EducationSelect[]> {
    return this.repo.getAllEducations(cvId, options);
  }

  async updateEducation(
    cvId: number,
    educationId: number,
    newEducationData: EducationUpdate,
  ): Promise<EducationSelect> {
    return this.updateForCv(cvId, educationId, newEducationData);
  }

  async deleteEducation(cvId: number, educationId: number): Promise<boolean> {
    return this.deleteFromCv(cvId, educationId);
  }
}
