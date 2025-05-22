import { eq, type InferSelectModel } from "drizzle-orm";
import { MySqlTable, type TableConfig } from "drizzle-orm/mysql-core";
import { DataBaseError } from "../errors/database.error";
import { QueryBuilder } from "../lib/query-builder";
import type { QueryOptions } from "../lib/query-builder";
import type { MySql2Database } from "drizzle-orm/mysql2";
import { type schema } from "../db";
export interface BaseCrudRepository<
  TSelect,
  TInsert,
  TUpdate = Partial<TInsert>,
> {
  getAll(): Promise<TSelect[]>;
  findMany(options: QueryOptions): Promise<TSelect[]>;
  getById(id: number): Promise<TSelect | null>;
  create(data: TInsert): Promise<{ id: number }>;
  update(id: number, data: TUpdate): Promise<TSelect>;
  delete(id: number): Promise<void>;
  exists(id: number | string): Promise<boolean>;
}

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

  async findMany(options: QueryOptions = {}): Promise<TSelect[]> {
    const qb = new QueryBuilder(
      this.table,
      this.db.select().from(this.table) as any,
    );
    const query = qb.build(options).getQuery();
    return (await query.execute()) as TSelect[];
  }
  async getAll(): Promise<TSelect[]> {
    return (await this.db.select().from(this.table)) as TSelect[];
  }

  async getById(id: number): Promise<TSelect | null> {
    const rows = (await this.db
      .select()
      .from(this.table)
      .where(eq((this.table as any).id, id))
      .limit(1)) as TSelect[];
    return rows[0] ?? null;
  }

  async create(data: TInsert): Promise<{ id: number }> {
    const inserted = await this.db
      .insert(this.table)
      .values(data as any)
      .$returningId();

    const id = (inserted as Array<{ id: number }>)[0]?.id;

    if (!id) {
      throw new DataBaseError("Insert did not return an ID.");
    }

    return { id };
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
