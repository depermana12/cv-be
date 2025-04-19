import { type BaseCrudRepository } from "../repositories/base.repo";
import { NotFoundError } from "../errors/not-found.error";
import { BadRequestError } from "../errors/bad-request.error";

export interface IBaseCrudService<
  T,
  TSelect,
  TInsert,
  TUpdate = Partial<TInsert>,
> {
  getAll(): Promise<TSelect[]>;
  getById(id: number): Promise<TSelect | null>;
  create(data: TInsert): Promise<TSelect>;
  update(id: number, data: TUpdate): Promise<TSelect>;
  delete(id: number): Promise<void>;
  exists(id: number | string): Promise<boolean>;
}

export class BaseCrudService<T, TSelect, TInsert, TUpdate = Partial<TInsert>>
  implements IBaseCrudService<T, TSelect, TInsert, TUpdate>
{
  constructor(
    protected readonly repository: BaseCrudRepository<
      T,
      TSelect,
      TInsert,
      TUpdate
    >,
    protected readonly primaryKey: keyof TSelect & string,
  ) {}

  async getAll(): Promise<TSelect[]> {
    return this.repository.getAll();
  }

  async getById(id: number): Promise<TSelect> {
    const record = await this.repository.getById(id);
    if (!record) {
      throw new NotFoundError(`cannot get: ${this.primaryKey} ${id} not found`);
    }
    return record;
  }

  async create(data: TInsert): Promise<TSelect> {
    const record = await this.repository.create(data);
    if (!record) {
      throw new BadRequestError("failed to create the record.");
    }
    return record;
  }

  async update(id: number, data: TUpdate): Promise<TSelect> {
    const exists = await this.exists(id);
    if (!exists) {
      throw new NotFoundError(
        `cannot update: ${this.primaryKey} ${id} not found`,
      );
    }
    const updated = await this.repository.update(id, data);
    if (!updated) {
      throw new BadRequestError(`failed to update: ${this.primaryKey} ${id}`);
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    const exists = await this.exists(id);
    if (!exists) {
      throw new NotFoundError(
        `cannot delete: ${this.primaryKey} ${id} not found`,
      );
    }
    return this.repository.delete(id);
  }

  async exists(id: number | string): Promise<boolean> {
    return this.repository.exists(id);
  }
}
