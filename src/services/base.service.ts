import { eq, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { MySqlTable } from "drizzle-orm/mysql-core";
import { BaseRepository } from "../repositories/base.repo";

export class BaseService<
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
  ) {}

  async getAll(): Promise<TSelect[]> {
    return this.repository.getAll();
  }

  async getById(id: number | string): Promise<TSelect | undefined> {
    return this.repository.getById(id);
  }

  async create(data: TInsert) {
    return this.repository.create(data);
  }

  async update(id: number, data: TUpdate): Promise<TSelect | undefined> {
    return this.repository.update(id, data);
  }

  async delete(id: number): Promise<void> {
    return this.repository.delete(id);
  }

  async exists(id: number | string): Promise<boolean> {
    return this.repository.exists(id);
  }
}
