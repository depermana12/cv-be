import type { ICvRepository } from "../repositories/cv.repo";
import type {
  CvInsert,
  CvQueryOptions,
  CvSelect,
  CvStats,
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
  updateCv(
    cvId: number,
    userId: number,
    newCvData: CvUpdate,
  ): Promise<CvSelect>;
  deleteCv(cvId: number, userId: number): Promise<boolean>;

  getCvBySlug(slug: string): Promise<CvSelect>;
  viewCv(cvId: number): Promise<CvSelect>;
  downloadCv(cvId: number): Promise<CvSelect>;
  getPopularCvs(limit?: number): Promise<CvSelect[]>;
  getUserStats(userId: number): Promise<CvStats>;
}

export class CvService implements ICvService {
  constructor(private readonly cvRepository: ICvRepository) {}

  private async assertCvOwnedByUser(
    cvId: number,
    userId: number,
  ): Promise<CvSelect> {
    const cv = await this.cvRepository.getCvForUser(cvId, userId);
    if (!cv) {
      throw new NotFoundError(
        `[Service] CV with ID ${cvId} not found for user ${userId}`,
      );
    }
    return cv;
  }

  async createCv(cvData: Omit<CvInsert, "userId">, userId: number) {
    const { id } = await this.cvRepository.createCv({ ...cvData, userId });
    return this.getCvById(id, userId);
  }

  async getCvById(cvId: number, userId: number) {
    return this.assertCvOwnedByUser(cvId, userId);
  }

  async getAllCvs(userId: number, options?: CvQueryOptions) {
    return this.cvRepository.getAllCvForUser(userId, options);
  }

  async updateCv(cvId: number, userId: number, newCvData: CvUpdate) {
    const cv = await this.assertCvOwnedByUser(cvId, userId);
    const updated = await this.cvRepository.updateCvForUser(
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

  async deleteCv(cvId: number, userId: number) {
    return this.cvRepository.deleteCvForUser(cvId, userId);
  }

  async getCvBySlug(slug: string) {
    const cv = await this.cvRepository.getCvBySlug(slug);
    if (!cv) {
      throw new NotFoundError(`[Service] CV with slug '${slug}' not found`);
    }
    return cv;
  }

  async viewCv(cvId: number) {
    const cv = await this.cvRepository.getCvBySlug(cvId.toString());
    if (!cv) {
      throw new NotFoundError(`[Service] CV with ID ${cvId} not found`);
    }

    await this.cvRepository.incrementViews(cvId);

    return { ...cv, views: cv.views + 1 };
  }

  async downloadCv(cvId: number) {
    const cv = await this.cvRepository.getCvBySlug(cvId.toString());
    if (!cv) {
      throw new NotFoundError(`[Service] CV with ID ${cvId} not found`);
    }

    await this.cvRepository.incrementDownloads(cvId);

    return { ...cv, downloads: cv.downloads + 1 };
  }

  async getPopularCvs(limit = 10) {
    return this.cvRepository.getPopularCvs(limit);
  }

  async getUserStats(userId: number) {
    return this.cvRepository.getUserCvStats(userId);
  }
}
