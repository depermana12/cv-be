import type {
  CvInsert,
  CvQueryOptions,
  CvSelect,
  CvUpdate,
  PaginatedCvResponse,
} from "../db/types/cv.type";
import { NotFoundError } from "../errors/not-found.error";
import { cvRepository } from "./instance.repo";

export class CvService {
  constructor(private readonly repo = cvRepository) {}

  private async assertCvOwnedByUser(
    cvId: number,
    userId: number,
  ): Promise<CvSelect> {
    const cv = await this.repo.getCvByIdAndUserId(cvId, userId);
    if (!cv) {
      throw new NotFoundError(
        `[Service] CV with ID ${cvId} not found for user ${userId}`,
      );
    }
    return cv;
  }

  async createCv(
    cvData: Omit<CvInsert, "userId">,
    userId: number,
  ): Promise<CvSelect> {
    const { id } = await this.repo.createCv({ ...cvData, userId });

    return this.getCvById(id, userId);
  }

  async getCvById(cvId: number, userId: number): Promise<CvSelect> {
    return this.assertCvOwnedByUser(cvId, userId);
  }

  async getAllCvs(
    userId: number,
    options?: CvQueryOptions,
  ): Promise<PaginatedCvResponse> {
    return this.repo.getAllCvByUserId(userId, options);
  }

  async updateCv(
    cvId: number,
    userId: number,
    newCvData: CvUpdate,
  ): Promise<CvSelect> {
    const cv = await this.assertCvOwnedByUser(cvId, userId);
    const updated = await this.repo.updateCvByIdAndUserId(
      cv.id,
      userId,
      newCvData,
    );
    if (!updated) {
      throw new NotFoundError(
        `[Service] CV with ID ${cvId} not found for user ${userId}`,
      );
    }
    return this.getCvById(cvId, userId);
  }

  async deleteCv(cvId: number, userId: number): Promise<boolean> {
    return this.repo.deleteCvByIdAndUserId(cvId, userId);
  }
}
