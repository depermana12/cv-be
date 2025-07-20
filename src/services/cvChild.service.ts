import type { CvChildCrudRepository } from "../repositories/cvChild.repo";
import { BadRequestError } from "../errors/bad-request.error";
import { NotFoundError } from "../errors/not-found.error";

export abstract class CvChildService<TS, TI> {
  constructor(protected readonly repository: CvChildCrudRepository<TS, TI>) {}

  // All service methods operate within CV scope for data isolation and security

  async create(cvId: number, data: Omit<TI, "cvId">): Promise<TS> {
    const result = await this.repository.create(cvId, data);
    if (!result) {
      throw new BadRequestError(`Failed to create record in CV: ${cvId}`);
    }
    return result;
  }

  async getOne(cvId: number, childId: number): Promise<TS> {
    const result = await this.repository.getOne(cvId, childId);
    if (!result) {
      throw new NotFoundError(
        `Record with ID ${childId} not found in CV: ${cvId}`,
      );
    }
    return result;
  }

  async getAll(cvId: number): Promise<TS[]> {
    return this.repository.getAll(cvId);
  }

  async update(
    cvId: number,
    childId: number,
    data: Partial<Omit<TI, "id" | "cvId">>,
  ): Promise<TS> {
    const exists = await this.repository.getOne(cvId, childId);
    if (!exists) {
      throw new NotFoundError(
        `Record with ID ${childId} not found in CV: ${cvId}`,
      );
    }

    const result = await this.repository.update(cvId, childId, data);
    if (!result) {
      throw new BadRequestError(
        `Failed to update record with ID ${childId} in CV: ${cvId}`,
      );
    }
    return result;
  }

  async delete(cvId: number, childId: number): Promise<boolean> {
    const exists = await this.repository.getOne(cvId, childId);
    if (!exists) {
      throw new NotFoundError(
        `Record with ID ${childId} not found in CV: ${cvId}`,
      );
    }

    const result = await this.repository.delete(cvId, childId);
    if (!result) {
      throw new BadRequestError(
        `Failed to delete record with ID ${childId} in CV: ${cvId}`,
      );
    }
    return result;
  }

  async exists(cvId: number, childId: number): Promise<boolean> {
    return this.repository.exists(cvId, childId);
  }
}
