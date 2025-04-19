import { eq } from "drizzle-orm";
import { MySqlTable, type TableConfig } from "drizzle-orm/mysql-core";
import { DataBaseError } from "../errors/database.error";

export interface BaseCrudRepository<
  T,
  TSelect,
  TInsert,
  TUpdate = Partial<TInsert>,
> {
  getAll(): Promise<TSelect[]>;
  getById(id: number): Promise<TSelect>;
  create(data: TInsert): Promise<TSelect>;
  update(id: number, data: TUpdate): Promise<TSelect>;
  delete(id: number): Promise<void>;
  exists(id: number | string): Promise<boolean>;
}

/**
 * Base implementation of the BaseCrudRepository interface.
 * Provides generic CRUD operations using Drizzle ORM.
 *
 * @template T - The type of table database
 * @template TSelect - The type used when returning records
 * @template TInsert - The type used when inserting records
 * @template TUpdate - The type used when updating records (defaults to Partial<TInsert>)
 * @implements {BaseCrudRepository<T, TSelect, TInsert, TUpdate>}
 */
export class BaseRepository<
  T extends MySqlTable<TableConfig>,
  TSelect,
  TInsert,
  TUpdate = Partial<TInsert>,
> implements BaseCrudRepository<T, TSelect, TInsert, TUpdate>
{
  /**
   * Instanciate baseRepository.
   *
   * @param {any} db - The database connection/client
   * @param {MySqlTable} table - The Drizzle table definition
   * @param {keyof TSelect & string} primaryKey - The name of the primary key column "id"
   */
  constructor(
    protected readonly db: any,
    protected readonly table: T,
    protected readonly primaryKey: keyof TSelect & string,
  ) {}
  async getAll(): Promise<TSelect[]> {
    return await this.db.select().from(this.table);
  }
  async getById(id: number): Promise<TSelect> {
    const rows = await this.db
      .select()
      .from(this.table)
      .where(eq((this.table as any)[this.primaryKey], id));
    return rows[0] as TSelect;
  }

  // the mysql insert returning is problematic
  async create(data: TInsert): Promise<TSelect> {
    const [inserted] = await this.db
      .insert(this.table)
      .values(data as any)
      .$returningId();

    if (!inserted) {
      throw new DataBaseError("insert did not return an ID.");
    }

    const id = (inserted as Record<string, any>)[this.primaryKey as string];

    const result = await this.getById(id);
    if (!result) {
      throw new DataBaseError("failed to retrieve the created record.");
    }
    return result;
  }

  async update(id: number, data: TUpdate): Promise<TSelect> {
    await this.db
      .update(this.table)
      .set(data as any)
      .where(eq((this.table as any)[this.primaryKey], id));
    const result = await this.getById(id);
    if (!result) {
      throw new DataBaseError("failed to retrieve the updated record.");
    }
    return result;
  }

  async delete(id: number): Promise<void> {
    await this.db
      .delete(this.table)
      .where(eq((this.table as any)[this.primaryKey], id));
  }
  async exists(id: number | string): Promise<boolean> {
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq((this.table as any)[this.primaryKey], id))
      .limit(1);
    return result.length > 0;
  }
}
