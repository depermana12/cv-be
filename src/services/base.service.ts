import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { MySqlTable } from "drizzle-orm/mysql-core";
import { BaseRepository } from "../repositories/base.repo";
import { NotFoundError } from "../errors/not-found.error";

export class BaseCrudService<
  TTable extends MySqlTable,
  TInsert = InferInsertModel<TTable>,
  TSelect = InferSelectModel<TTable>,
  TUpdate extends Partial<TInsert> = Partial<TInsert>,
> {
  constructor(
    protected readonly repository: BaseRepository<
      TTable,
      TInsert,
      TSelect,
      TUpdate
    >,
    protected readonly primaryKey: keyof TSelect & string,
  ) {}

  async getAll(): Promise<TSelect[]> {
    return this.repository.getAll();
  }

  async getById(id: number | string): Promise<TSelect> {
    const record = await this.repository.getById(id);
    if (!record) {
      throw new NotFoundError(`cannot get: ${this.primaryKey} ${id} not found`);
    }
    return record;
  }

  async create(
    data: Omit<TInsert, "personalId"> & { personalId?: number },
  ): Promise<TSelect> {
    const record = await this.repository.create(data as TInsert);
    if (!record) {
      throw new Error("failed to create the record.");
    }
    return record;
  }

  async update(id: number, data: TUpdate) {
    const exists = await this.exists(id);
    if (!exists) {
      throw new NotFoundError(
        `cannot update: ${this.primaryKey} ${id} not found`,
      );
    }
    return this.repository.update(id, data);
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
