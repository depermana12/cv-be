import type { CvChildRepository } from "../repositories/cvChild.repo";
import { BadRequestError } from "../errors/bad-request.error";
import { NotFoundError } from "../errors/not-found.error";

/**
 * Base Abstract class for CV child services.
 * @template TSelect - The type of data to select.
 * @template TInsert - The type of data to insert.
 * @template TUpdate - The type of data to update.
 *
 */
export abstract class CvChildService<
  TSelect,
  TInsert,
  TUpdate = Partial<TInsert>,
> {
  /**
   * Constructor for the CvChildService class.
   * @param {CvChildRepository<any, TInsert, TSelect, TUpdate>} repository - The repository instance.
   */
  constructor(
    protected readonly repository: CvChildRepository<
      any,
      TInsert,
      TSelect,
      TUpdate
    >,
  ) {}

  async createForCv(cvId: number, data: TInsert): Promise<TSelect> {
    const inserted = await this.repository.createForCv(cvId, data);
    if (!inserted) {
      throw new BadRequestError(`[Service] failed to create in CV: ${cvId}`);
    }
    return this.findByCvId(cvId, inserted.id);
  }

  /**
   * Get all entries from the database by CV ID.
   * @param {number} cvId - The ID of the CV.
   * @returns {Promise<TSelect[]>} - An array of entries.
   * @description This method retrieves all entries associated with a specific CV ID.
   */
  async findAllByCvId(cvId: number): Promise<TSelect[]> {
    return this.repository.getAllByIdInCv(cvId);
  }

  /**
   * Get an entry from the database by CV ID and entry ID.
   * @param cvId - The ID of the parent which is CV.
   * @param id - The ID of the entry to retrieve.
   * @returns The entry if found, or throws NotFoundError if not found.
   */
  async findByCvId(cvId: number, id: number): Promise<TSelect> {
    const result = await this.repository.getByIdInCv(cvId, id);
    if (!result) {
      throw new NotFoundError(
        `[Service] Item with ID ${id} not found in CV: ${cvId}`,
      );
    }
    return result;
  }

  /**
   * Create a new entry in the database associated with a specific CV ID.
   * @param cvId - The ID of the parent which is CV.
   * @param data - The data to insert.
   * @returns The created entry.
   */
  async updateForCv(cvId: number, id: number, data: TUpdate): Promise<TSelect> {
    const result = await this.repository.updateInCv(cvId, id, data);
    if (!result) {
      throw new BadRequestError(`[Service] failed to update: ${id}`);
    }
    return this.findByCvId(cvId, id);
  }

  /**
   * Delete an entry from the database by CV ID and entry ID.
   * @param cvId - The ID of the parent which is CV.
   * @param id - The ID of the entry which is child to delete.
   * @returns A boolean indicating success or failure.
   */
  async deleteFromCv(cvId: number, id: number): Promise<boolean> {
    return this.repository.deleteByIdInCv(cvId, id);
  }

  /**
   * Check if an entry exists in the database by CV ID and entry ID.
   * @param cvId - The ID of the parent which is CV.
   * @param id - The ID of the entry to check.
   * @returns A boolean indicating whether the entry exists.
   */
  async belongsToCv(cvId: number, id: number): Promise<boolean> {
    return this.repository.existsInCv(cvId, id);
  }
}
