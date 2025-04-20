import { eq, type InferSelectModel } from "drizzle-orm";
import { MySqlTable, type TableConfig } from "drizzle-orm/mysql-core";
import { DataBaseError } from "../errors/database.error";

export interface BaseCrudRepository<
  TSelect,
  TInsert,
  TUpdate = Partial<TInsert>,
> {
  getAll(): Promise<TSelect[]>;
  getById(id: number): Promise<TSelect | null>;
  create(data: TInsert): Promise<{ id: number }>;
  update(id: number, data: TUpdate): Promise<TSelect>;
  delete(id: number): Promise<void>;
  exists(id: number | string): Promise<boolean>;
}

/**
 * Base implementation of the BaseCrudRepository interface.
 * Provides generic CRUD operations using Drizzle ORM.
 *
 * @template TTable - The type of table database
 * @template TSelect - The type used when returning records
 * @template TInsert - The type used when inserting records
 * @template TUpdate - The type used when updating records (defaults to Partial<TInsert>)
 * @implements {BaseCrudRepository<TTable, TSelect, TInsert, TUpdate>}
 */
export class BaseRepository<
  TTable extends MySqlTable<TableConfig>,
  TInsert,
  TSelect = InferSelectModel<TTable>,
  TUpdate = Partial<TInsert>,
> implements BaseCrudRepository<TSelect, TInsert, TUpdate>
{
  /**
   * Instanciate baseRepository.
   *
   * @param {any} db - The database connection/client
   * @param {MySqlTable} table - The Drizzle table definition
   */
  constructor(protected readonly db: any, protected readonly table: TTable) {}
  async getAll(): Promise<TSelect[]> {
    return await this.db.select().from(this.table);
  }
  async getById(id: number): Promise<TSelect | null> {
    const rows = await this.db
      .select()
      .from(this.table)
      .where(eq((this.table as any).id, id))
      .limit(1);
    return rows[0] ?? null;
  }

  // the mysql insert returning is problematic
  async create(data: TInsert): Promise<{ id: number }> {
    const inserted = await this.db
      .insert(this.table)
      .values(data)
      .$returningId();

    if (!inserted[0]?.id) {
      throw new DataBaseError("Insert did not return an ID.");
    }

    return { id: inserted.id };
  }

  async update(id: number, data: TUpdate): Promise<TSelect> {
    await this.db
      .update(this.table)
      .set(data)
      .where(eq((this.table as any).id, id));
    const result = await this.getById(id);
    if (!result) {
      throw new DataBaseError("failed to retrieve the updated record.");
    }
    return result;
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(this.table).where(eq((this.table as any).id, id));
  }
  async exists(id: number | string): Promise<boolean> {
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq((this.table as any).id, id))
      .limit(1);
    return result.length > 0;
  }
}
