import { CvChildService } from "./cvChild.service";
import type {
  WorkCreateRequest,
  WorkUpdateRequest,
  WorkDescInsert,
  WorkDescSelect,
  WorkDescUpdate,
  WorkInsert,
  WorkQueryOptions,
  WorkSelect,
  WorkUpdate,
  WorkResponse,
} from "../db/types/work.type";
import { BadRequestError } from "../errors/bad-request.error";
import { NotFoundError } from "../errors/not-found.error";
import { WorkRepository } from "../repositories/work.repo";

export class WorkService extends CvChildService<
  WorkSelect,
  WorkInsert,
  WorkUpdate
> {
  constructor(private readonly workRepository: WorkRepository) {
    super(workRepository);
  }

  async getAllWorks(
    cvId: number,
    options?: WorkQueryOptions,
  ): Promise<WorkResponse[]> {
    return this.workRepository.getAllWorks(cvId, options);
  }

  async getWork(cvId: number, workId: number): Promise<WorkResponse> {
    const work = await this.workRepository.getWork(workId);
    if (!work || work.cvId !== cvId) {
      throw new NotFoundError(`Work ${workId} not found for CV ${cvId}`);
    }
    return work;
  }

  async createWork(
    cvId: number,
    workData: WorkCreateRequest,
  ): Promise<WorkResponse> {
    const { descriptions = [], ...restWorkData } = workData;

    const result = await this.workRepository.createWork(
      { ...restWorkData, cvId },
      descriptions,
    );

    return this.getWork(cvId, result.id);
  }

  async updateWork(
    cvId: number,
    workId: number,
    updateData: WorkUpdateRequest,
  ): Promise<WorkResponse> {
    await this.getWork(cvId, workId);

    const { descriptions, ...workData } = updateData;
    await this.workRepository.updateWork(workId, workData, descriptions);

    return this.getWork(cvId, workId);
  }

  async deleteWork(cvId: number, workId: number): Promise<boolean> {
    await this.getWork(cvId, workId);
    return this.workRepository.deleteWork(workId);
  }

  async getAllWorkDescriptions(
    cvId: number,
    workId: number,
  ): Promise<WorkDescSelect[]> {
    await this.getWork(cvId, workId);
    return this.workRepository.getManyDescriptions(workId);
  }

  async addWorkDescription(
    cvId: number,
    workId: number,
    descriptionData: { description: string },
  ): Promise<WorkDescSelect> {
    await this.getWork(cvId, workId);
    const result = await this.workRepository.createDescription(
      workId,
      descriptionData,
    );

    if (!result) {
      throw new BadRequestError(`Failed to add description to work ${workId}`);
    }

    return this.getWorkDescription(cvId, result.id);
  }

  async getWorkDescription(
    cvId: number,
    descriptionId: number,
  ): Promise<WorkDescSelect> {
    const description = await this.workRepository.getOneDescription(
      descriptionId,
    );
    if (!description) {
      throw new NotFoundError(`Description ${descriptionId} not found`);
    }

    await this.getWork(cvId, description.workId);
    return description;
  }

  async updateWorkDescription(
    cvId: number,
    descriptionId: number,
    updateData: WorkDescUpdate,
  ): Promise<WorkDescSelect> {
    const description = await this.workRepository.getOneDescription(
      descriptionId,
    );
    if (!description) {
      throw new NotFoundError(`Description ${descriptionId} not found`);
    }

    await this.getWork(cvId, description.workId);

    const updated = await this.workRepository.updateDescription(
      descriptionId,
      updateData,
    );
    if (!updated) {
      throw new BadRequestError(
        `Failed to update description ${descriptionId}`,
      );
    }

    return this.getWorkDescription(cvId, descriptionId);
  }

  async deleteWorkDescription(
    cvId: number,
    descriptionId: number,
  ): Promise<boolean> {
    const description = await this.workRepository.getOneDescription(
      descriptionId,
    );
    if (!description) {
      throw new NotFoundError(`Description ${descriptionId} not found`);
    }

    await this.getWork(cvId, description.workId);
    return this.workRepository.deleteDescription(descriptionId);
  }
}
