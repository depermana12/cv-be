import { MySqlTable, type TableConfig } from "drizzle-orm/mysql-core";
import { eq, type InferSelectModel } from "drizzle-orm";
import { DataBaseError } from "../errors/database.error";
import type { MySql2Database } from "drizzle-orm/mysql2";
import { type schema } from "../db";

/**
 * Base CRUD repository interface.
 * @template TSelect - The type of data to select.
 * @template TInsert - The type of data to insert.
 * @template TUpdate - The type of data to update.
 */
export interface BaseCrudRepository<
  TSelect,
  TInsert,
  TUpdate = Partial<TInsert>,
> {
  getAll(): Promise<TSelect[]>;
  getById(id: number): Promise<TSelect | null>;
  create(data: TInsert): Promise<{ id: number }>;
  update(id: number, data: TUpdate): Promise<boolean>;
  delete(id: number): Promise<boolean>;
  exists(id: number): Promise<boolean>;
}

/**
 * Base repository class for CRUD operations.
 * @template TTable - The table type.
 * @template TInsert - The type of data to insert.
 * @template TSelect - The type of data to select.
 * @template TUpdate - The type of data to update.
 */
export class BaseRepository<
  TTable extends MySqlTable<TableConfig>,
  TInsert,
  TSelect = InferSelectModel<TTable>,
  TUpdate = Partial<TInsert>,
> implements BaseCrudRepository<TSelect, TInsert, TUpdate>
{
  constructor(
    protected readonly table: TTable,
    protected readonly db: MySql2Database<typeof schema>,
  ) {}

  /**
   * Get all entries from the database.
   * @returns An array of entries.
   */
  async getAll(): Promise<TSelect[]> {
    return (await this.db.select().from(this.table)) as TSelect[];
  }

  /**
   * Find an entry in the database by its ID.
   * @param id - The ID of the entry to find.
   * @returns The entry if found, or null if not found.
   */
  private async findId(id: number): Promise<TSelect[]> {
    return (await this.db
      .select()
      .from(this.table)
      .where(eq((this.table as any).id, id))
      .limit(1)) as TSelect[];
  }

  /**
   * Get an entry from the database by its ID.
   * @param id - The ID of the entry to retrieve.
   * @returns The entry if found, or null if not found.
   */
  async getById(id: number): Promise<TSelect | null> {
    const result = await this.findId(id);
    return (result[0] as TSelect) ?? null;
  }

  /**
   * Create a new entry in the database.
   * @param data - The data to insert into the database.
   * @returns The ID of the newly created entry.
   */
  async create(data: TInsert): Promise<{ id: number }> {
    const result = await this.db
      .insert(this.table)
      .values(data as any)
      .$returningId();

    const id = (result as Array<{ insertId: number }>)[0].insertId;

    if (!id) {
      throw new DataBaseError("Insert did not return an ID.");
    }

    return { id };
  }

  /**
   * Update an entry in the database by its ID.
   * @param id - The ID of the entry to update.
   * @param data - The data to update the entry with.
   * @returns A boolean indicating whether the update was successful.
   */
  async update(id: number, data: TUpdate): Promise<boolean> {
    const result = await this.db
      .update(this.table)
      .set(data)
      .where(eq((this.table as any).id, id));
    return result[0].affectedRows > 0;
  }

  /**
   * Delete an entry from the database by its ID.
   * @param id - The ID of the entry to delete.
   * @returns A boolean indicating whether the deletion was successful.
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(this.table)
      .where(eq((this.table as any).id, id));
    return result[0].affectedRows > 0;
  }

  /**
   * Check if an entry exists in the database by its ID.
   * @param id - The ID of the entry to check.
   * @returns A boolean indicating whether the entry exists.
   */
  async exists(id: number): Promise<boolean> {
    const result = await this.findId(id);
    return result.length > 0;
  }
}
