import { CvChildService } from "./cvChild.service";
import type {
  WorkDescInsert,
  WorkDescSelect,
  WorkInsert,
  WorkQueryOptions,
  WorkSelect,
  WorkUpdate,
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

  async createWork(
    cvId: number,
    workData: Omit<WorkInsert, "cvId">,
  ): Promise<WorkSelect> {
    return this.createForCv(cvId, { ...workData, cvId });
  }

  async getWork(cvId: number, workId: number): Promise<WorkSelect> {
    return this.findByCvId(cvId, workId);
  }

  async getAllWorks(
    cvId: number,
    options?: WorkQueryOptions,
  ): Promise<WorkSelect[]> {
    return this.workRepository.getAllWorks(cvId, options);
  }

  async updateWork(
    cvId: number,
    workId: number,
    newWorkData: WorkUpdate,
  ): Promise<WorkSelect> {
    return this.updateForCv(cvId, workId, newWorkData);
  }

  async deleteWork(cvId: number, workId: number): Promise<boolean> {
    return this.deleteFromCv(cvId, workId);
  }

  /**
   * Utility function that asserts that the work belongs to the specified CV.
   * @param cvId - The ID of the CV.
   * @param workId - The ID of the work.
   * @returns The work if it exists and belongs to the CV.
   * @throws NotFoundError if the work does not exist or does not belong to the CV.
   */
  private async assertWorkOwnedByCv(
    cvId: number,
    workId: number,
  ): Promise<WorkSelect> {
    return this.findByCvId(cvId, workId);
  }

  /**
   * All below are description related methods for courses.
   * whether single CRUD operations or bulk operations.
   */

  async createDescriptionForWork(
    cvId: number,
    workId: number,
    descriptionData: WorkDescInsert,
  ): Promise<WorkDescSelect> {
    const work = await this.assertWorkOwnedByCv(cvId, workId);
    const description = await this.workRepository.createDescription(
      work.id,
      descriptionData,
    );
    if (!description) {
      throw new BadRequestError(
        `cannot create description for work with id ${workId}`,
      );
    }
    return this.getWorkDescription(cvId, description.id);
  }

  async getWorkDescription(
    cvId: number,
    descriptionId: number,
  ): Promise<WorkDescSelect> {
    const description = await this.workRepository.getDescriptionById(
      descriptionId,
    );
    if (!description) {
      throw new NotFoundError(
        `cannot get: description with id ${descriptionId} not found`,
      );
    }
    await this.assertWorkOwnedByCv(cvId, description.workId);
    return description;
  }

  async getWorkDescriptions(
    cvId: number,
    workId: number,
  ): Promise<WorkDescSelect[]> {
    await this.assertWorkOwnedByCv(cvId, workId);
    return this.workRepository.getAllDescriptions(workId);
  }

  async updateWorkDescription(
    cvId: number,
    descriptionId: number,
    newDescriptionData: WorkDescInsert,
  ): Promise<WorkDescSelect> {
    const description = await this.workRepository.getDescriptionById(
      descriptionId,
    );
    if (!description) {
      throw new NotFoundError(
        `cannot update: description with id ${descriptionId} not found`,
      );
    }
    await this.assertWorkOwnedByCv(cvId, description.workId);
    const updatedDescription = await this.workRepository.updateDescription(
      descriptionId,
      newDescriptionData,
    );
    if (!updatedDescription) {
      throw new BadRequestError(
        `cannot update description with id ${descriptionId}`,
      );
    }
    return this.getWorkDescription(cvId, descriptionId);
  }

  async deleteWorkDescription(
    cvId: number,
    descriptionId: number,
  ): Promise<boolean> {
    const description = await this.workRepository.getDescriptionById(
      descriptionId,
    );
    if (!description) {
      throw new NotFoundError(
        `cannot delete: description with id ${descriptionId} not found`,
      );
    }
    await this.assertWorkOwnedByCv(cvId, description.workId);
    const deletedDescription = await this.workRepository.deleteDescription(
      descriptionId,
    );
    if (!deletedDescription) {
      throw new BadRequestError(
        `cannot delete description with id ${descriptionId}`,
      );
    }
    return deletedDescription;
  }

  /**
   * Bulk operations: create a work with multiple descriptions.
   * @param cvId - The ID of the CV.
   * @param workData - The data for the work to be created.
   * @param descriptions - An array of descriptions to be associated with the work.
   * @returns A composite object containing the created work and its descriptions.
   */
  async createWorkWithDescriptions(
    cvId: number,
    workData: Omit<WorkInsert, "cvId">,
    descriptions: WorkDescInsert[],
  ): Promise<WorkSelect & { descriptions: WorkDescSelect[] }> {
    const { id } = await this.workRepository.createWorkWithDescriptions(
      { ...workData, cvId },
      descriptions,
    );

    const workWithDescriptions =
      await this.workRepository.getWorkWithDescriptions(id);
    if (!workWithDescriptions) {
      throw new NotFoundError(`Work with id ${id} not found`);
    }

    return workWithDescriptions;
  }

  /**
   * Get all works with their descriptions for a specific CV.
   * @param cvId - The ID of the CV.
   * @param options - Optional query options for filtering or sorting.
   * @param options.search - Optional search term to filter works by title or description.
   * @param options.sortBy - Optional field to sort by (e.g., 'company', 'position').
   * @param options.sortOrder - Optional sort order ('asc' or 'desc').
   * @returns An array of works with their descriptions.
   */
  async getAllWorksWithDescriptions(
    cvId: number,
    options?: WorkQueryOptions,
  ): Promise<(WorkSelect & { descriptions: WorkDescSelect[] })[]> {
    return this.workRepository.getAllWorksWithDescriptions(cvId, options);
  }

  async deleteWorkWithDescriptions(
    cvId: number,
    workId: number,
  ): Promise<boolean> {
    await this.assertWorkOwnedByCv(cvId, workId);
    const deleted = await this.workRepository.deleteWorkWithDescriptions(
      workId,
    );
    if (!deleted) {
      throw new BadRequestError(`cannot delete work with id ${workId}`);
    }
    return deleted;
  }
}
