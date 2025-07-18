import { PgTable, type TableConfig } from "drizzle-orm/pg-core";
import { eq, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { type Database } from "../db";

export interface BaseCrudRepository<TS, TI> {
  create(data: TI): Promise<TS>;
  getById(id: number): Promise<TS | null>;
  getAll(): Promise<TS[]>;
  update(id: number, data: Partial<TI>): Promise<TS>;
  delete(id: number): Promise<boolean>;
}

export class BaseRepository<
  TT extends PgTable<TableConfig>,
  TI extends InferInsertModel<TT>,
  TS extends InferSelectModel<TT>,
  ID extends keyof TT["$inferSelect"],
> implements BaseCrudRepository<TS, TI>
{
  constructor(
    protected readonly table: TT,
    protected readonly db: Database,
    protected readonly primaryKey: ID,
  ) {}

  async create(data: TI): Promise<TS> {
    const result = await this.db.insert(this.table).values(data).returning();
    return result[0] as TS;
  }

  async getById(id: number): Promise<TS | null> {
    const result = await this.db
      .select()
      .from(this.table as any)
      .where(eq((this.table as any)[this.primaryKey], id))
      .limit(1);
    return (result[0] as TS) ?? null;
  }

  async getAll(): Promise<TS[]> {
    return (await this.db.select().from(this.table as any)) as TS[];
  }

  async update(id: number, data: Partial<TI>): Promise<TS> {
    const result = await this.db
      .update(this.table)
      .set(data)
      .where(eq((this.table as any)[this.primaryKey], id))
      .returning();

    return (result as TS[])[0];
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(this.table)
      .where(eq((this.table as any)[this.primaryKey], id))
      .returning();

    return result.length > 0;
  }
}
