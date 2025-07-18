import type { CvChildCrudRepository } from "../repositories/cvChild.repo";
import { BadRequestError } from "../errors/bad-request.error";
import { NotFoundError } from "../errors/not-found.error";

export abstract class CvChildService<TS, TI> {
  constructor(protected readonly repository: CvChildCrudRepository<TS, TI>) {}

  async createInCv(cvId: number, data: TI): Promise<TS> {
    const result = await this.repository.createInCv(cvId, data);
    if (!result) {
      throw new BadRequestError(`Failed to create record in CV: ${cvId}`);
    }
    return result;
  }

  async getByIdInCv(cvId: number, childId: number): Promise<TS> {
    const result = await this.repository.getByIdInCv(cvId, childId);
    if (!result) {
      throw new NotFoundError(
        `Record with ID ${childId} not found in CV: ${cvId}`,
      );
    }
    return result;
  }

  async getAllInCv(cvId: number): Promise<TS[]> {
    return this.repository.getAllInCv(cvId);
  }

  async updateInCv(
    cvId: number,
    childId: number,
    data: Partial<TI>,
  ): Promise<TS> {
    const exists = await this.repository.getByIdInCv(cvId, childId);
    if (!exists) {
      throw new NotFoundError(
        `Record with ID ${childId} not found in CV: ${cvId}`,
      );
    }

    const result = await this.repository.updateInCv(cvId, childId, data);
    if (!result) {
      throw new BadRequestError(
        `Failed to update record with ID ${childId} in CV: ${cvId}`,
      );
    }
    return result;
  }

  async deleteInCv(cvId: number, childId: number): Promise<boolean> {
    const exists = await this.repository.getByIdInCv(cvId, childId);
    if (!exists) {
      throw new NotFoundError(
        `Record with ID ${childId} not found in CV: ${cvId}`,
      );
    }

    const result = await this.repository.deleteInCv(cvId, childId);
    if (!result) {
      throw new BadRequestError(
        `Failed to delete record with ID ${childId} in CV: ${cvId}`,
      );
    }
    return result;
  }

  async existsInCv(cvId: number, childId: number): Promise<boolean> {
    return this.repository.existsInCv(cvId, childId);
  }
}
