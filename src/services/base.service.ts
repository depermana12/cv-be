import { type BaseCrudRepository } from "../repositories/base.repo";
import { NotFoundError } from "../errors/not-found.error";
import { BadRequestError } from "../errors/bad-request.error";

/**
 * Base CRUD service interface.
 * @template TSelect - The type of data to select.
 * @template TInsert - The type of data to insert.
 * @template TUpdate - The type of data to update.
 *
 */
export interface IBaseCrudService<
  TSelect,
  TInsert,
  TUpdate = Partial<TInsert>,
> {
  getAll(): Promise<TSelect[]>;
  getById(id: number): Promise<TSelect | null>;
  create(data: TInsert): Promise<TSelect>;
  update(id: number, data: TUpdate): Promise<TSelect>;
  delete(id: number): Promise<boolean>;
  exists(id: number): Promise<boolean>;
}
/**
 * Base repository class for CRUD operations.
 * @template TSelect - The type of data to select.
 * @template TInsert - The type of data to insert.
 * @template TUpdate - The type of data to update.
 * @implements {IBaseCrudService<TSelect, TInsert, TUpdate>}
 * @extends {BaseCrudRepository<TSelect, TInsert, TUpdate>}
 *
 */
export class BaseCrudService<TSelect, TInsert, TUpdate = Partial<TInsert>>
  implements IBaseCrudService<TSelect, TInsert, TUpdate>
{
  constructor(
    protected readonly repository: BaseCrudRepository<
      TSelect,
      TInsert,
      TUpdate
    >,
  ) {}

  /**
   * Get all entries from the database.
   * @returns An array of entries.
   */
  async getAll(): Promise<TSelect[]> {
    return this.repository.getAll();
  }

  /**
   * Find an entry in the database by its ID.
   * @param id - The ID of the entry to find.
   * @returns The entry if found, or throws NotFoundError if not found.
   */
  async getById(id: number): Promise<TSelect> {
    const result = await this.repository.getById(id);
    if (!result) {
      throw new NotFoundError(`[Service] cannot get: ${id} not found`);
    }
    return result;
  }

  /**
   * Create a new entry in the database.
   * @param data - The data to insert into the database.
   * @returns The newly created entry.
   */
  async create(data: TInsert): Promise<TSelect> {
    const result = await this.repository.create(data);
    if (!result) {
      throw new BadRequestError("[Service] failed to create.");
    }
    return this.getById(result.id);
  }

  /**
   * Update an existing entry in the database.
   * @param id - The ID of the entry to update.
   * @param data - The data to update the entry with.
   * @returns The updated entry.
   */
  async update(id: number, data: TUpdate): Promise<TSelect> {
    const exists = await this.exists(id);
    if (!exists) {
      throw new NotFoundError(`[Service] cannot update: ${id} not found`);
    }
    const updated = await this.repository.update(id, data);
    if (!updated) {
      throw new BadRequestError(`[Service] failed to update: ${id}`);
    }
    return this.getById(id);
  }

  /**
   * Delete an entry from the database.
   * @param id - The ID of the entry to delete.
   * @returns A boolean indicating whether the deletion was successful.
   */
  async delete(id: number): Promise<boolean> {
    const exists = await this.exists(id);
    if (!exists) {
      throw new NotFoundError(`[Service] cannot delete: ${id} not found`);
    }
    const result = this.repository.delete(id);
    if (!result) {
      throw new BadRequestError(`[Service] failed to delete: ${id}`);
    }
    return result;
  }

  /**
   * Check if an entry exists in the database by its ID.
   * @param id - The ID of the entry to check.
   * @returns A boolean indicating whether the entry exists.
   */
  async exists(id: number): Promise<boolean> {
    return this.repository.exists(id);
  }
}
