import type { ICvRepository } from "../repositories/cv.repo";
import type {
  CvInsert,
  CvQueryOptions,
  CvSelect,
  CvUpdate,
  PaginatedCvResponse,
} from "../db/types/cv.type";
import { NotFoundError } from "../errors/not-found.error";

export interface ICvService {
  createCv(cvData: Omit<CvInsert, "userId">, userId: number): Promise<CvSelect>;
  getCvById(cvId: number, userId: number): Promise<CvSelect>;
  getAllCvs(
    userId: number,
    options?: CvQueryOptions,
  ): Promise<PaginatedCvResponse>;
  getUserCvCount(userId: number): Promise<number>;
  updateCv(
    cvId: number,
    userId: number,
    newCvData: CvUpdate,
  ): Promise<CvSelect>;
  deleteCv(cvId: number, userId: number): Promise<boolean>;
}

export class CvService implements ICvService {
  constructor(private readonly cvRepository: ICvRepository) {}

  private async assertCvOwnedByUser(
    cvId: number,
    userId: number,
  ): Promise<CvSelect> {
    const cv = await this.cvRepository.getCvByIdAndUserId(cvId, userId);
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
    const { id } = await this.cvRepository.createCv({ ...cvData, userId });

    return this.getCvById(id, userId);
  }

  async getCvById(cvId: number, userId: number): Promise<CvSelect> {
    return this.assertCvOwnedByUser(cvId, userId);
  }

  async getAllCvs(
    userId: number,
    options?: CvQueryOptions,
  ): Promise<PaginatedCvResponse> {
    return this.cvRepository.getAllCvByUserId(userId, options);
  }

  async getUserCvCount(userId: number): Promise<number> {
    const userCv = await this.cvRepository.getUserCvCount(userId);
    return userCv ?? 0;
  }

  async updateCv(
    cvId: number,
    userId: number,
    newCvData: CvUpdate,
  ): Promise<CvSelect> {
    const cv = await this.assertCvOwnedByUser(cvId, userId);
    const updated = await this.cvRepository.updateCvByIdAndUserId(
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
    return this.cvRepository.deleteCvByIdAndUserId(cvId, userId);
  }
}
