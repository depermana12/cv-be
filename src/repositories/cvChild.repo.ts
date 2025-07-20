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
  // create a child record for a specific CV
  createInCv(cvId: number, data: TI): Promise<TS>;
  // get a child record by ID, but only if it belongs to the specified CV
  getByIdInCv(cvId: number, childId: number): Promise<TS | null>;

  // use the get all for cv, because we care all the child that belongs to the cv
  // get all child records for a specific CV
  getAllInCv(cvId: number): Promise<TS[]>;
  // update a child record by ID, but only if it belongs to the specified CV
  updateInCv(cvId: number, childId: number, data: Partial<TI>): Promise<TS>;
  // delete a child record by ID, but only if it belongs to the specified CV
  deleteInCv(cvId: number, childId: number): Promise<boolean>;
  // check if a child record exists in a specific CV
  existsInCv(cvId: number, childId: number): Promise<boolean>;
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
  async existsInCv(cvId: number, childId: number): Promise<boolean> {
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

  async createInCv(cvId: number, data: TI): Promise<TS> {
    const records = await this.db
      .insert(this.table)
      .values({
        ...data,
        cvId,
      })
      .returning();

    return records[0] as TS;
  }

  async getAllInCv(cvId: number): Promise<TS[]> {
    return (await this.db
      .select()
      .from(this.table as any)
      .where(eq((this.table as any).cvId, cvId))
      .orderBy(asc((this.table as any).displayOrder))) as TS[];
  }

  async getByIdInCv(cvId: number, childId: number): Promise<TS | null> {
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

  async updateInCv(
    cvId: number,
    childId: number,
    data: Partial<TI>,
  ): Promise<TS> {
    const records = await this.db
      .update(this.table)
      .set(data)
      .where(
        and(
          eq((this.table as any)[this.primaryKey], childId),
          eq((this.table as any).cvId, cvId),
        ),
      )
      .returning();

    return (records as TS[])[0];
  }

  async deleteInCv(cvId: number, childId: number): Promise<boolean> {
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
