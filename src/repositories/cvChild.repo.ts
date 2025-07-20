import { PgTable, type TableConfig } from "drizzle-orm/pg-core";
import {
  and,
  asc,
  eq,
  type InferInsertModel,
  type InferSelectModel,
} from "drizzle-orm";
import type { Database } from "../db";

export interface CvChildCrudRepository<TS, TI> {
  // All operations are scoped to the parent CV - cvId ensures data isolation

  // Create a child record within the specified CV
  create(cvId: number, data: Omit<TI, "cvId">): Promise<TS>;

  // Get a child record by ID, only if it belongs to the specified CV
  getOne(cvId: number, childId: number): Promise<TS | null>;

  // Get all child records for the specified CV, ordered by displayOrder
  getAll(cvId: number): Promise<TS[]>;

  // Update a child record by ID, only if it belongs to the specified CV
  update(
    cvId: number,
    childId: number,
    data: Partial<Omit<TI, "id" | "cvId">>,
  ): Promise<TS>;

  // Delete a child record by ID, only if it belongs to the specified CV
  delete(cvId: number, childId: number): Promise<boolean>;

  // Check if a child record exists within the specified CV
  exists(cvId: number, childId: number): Promise<boolean>;
}

export abstract class CvChildRepository<
  TT extends PgTable<TableConfig>,
  TI extends InferInsertModel<TT>,
  TS extends InferSelectModel<TT>,
  ID extends keyof TT["$inferSelect"],
> implements CvChildCrudRepository<TS, TI>
{
  constructor(
    protected readonly table: TT,
    protected readonly db: Database,
    protected readonly primaryKey: ID,
  ) {}

  // All methods operate within CV scope - cvId parameter ensures proper data isolation

  async exists(cvId: number, childId: number): Promise<boolean> {
    const records = await this.db
      .select()
      .from(this.table as any)
      .where(
        and(
          eq((this.table as any)[this.primaryKey], childId),
          eq((this.table as any).cvId, cvId),
        ),
      )
      .limit(1);
    return records.length > 0;
  }

  async create(cvId: number, data: Omit<TI, "cvId">): Promise<TS> {
    const records = await this.db
      .insert(this.table)
      .values({
        ...data,
        cvId,
      } as unknown as TI)
      .returning();

    return records[0] as TS;
  }

  async getAll(cvId: number): Promise<TS[]> {
    return (await this.db
      .select()
      .from(this.table as any)
      .where(eq((this.table as any).cvId, cvId))
      .orderBy(asc((this.table as any).displayOrder))) as TS[];
  }

  async getOne(cvId: number, childId: number): Promise<TS | null> {
    const records = await this.db
      .select()
      .from(this.table as any)
      .where(
        and(
          eq((this.table as any)[this.primaryKey], childId),
          eq((this.table as any).cvId, cvId),
        ),
      )
      .limit(1);

    return (records[0] as TS) ?? null;
  }

  async update(
    cvId: number,
    childId: number,
    data: Partial<Omit<TI, "id" | "cvId">>,
  ): Promise<TS> {
    const records = await this.db
      .update(this.table)
      .set(data as any)
      .where(
        and(
          eq((this.table as any)[this.primaryKey], childId),
          eq((this.table as any).cvId, cvId),
        ),
      )
      .returning();

    return (records as TS[])[0];
  }

  async delete(cvId: number, childId: number): Promise<boolean> {
    const records = await this.db
      .delete(this.table)
      .where(
        and(
          eq((this.table as any)[this.primaryKey], childId),
          eq((this.table as any).cvId, cvId),
        ),
      )
      .returning();

    return records.length > 0;
  }
}
