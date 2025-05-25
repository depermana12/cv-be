import type { MySqlTable, TableConfig } from "drizzle-orm/mysql-core";
import { BaseRepository } from "./base.repo";
import { and, eq, type InferSelectModel } from "drizzle-orm";
import { DataBaseError } from "../errors/database.error";

export abstract class CvChildRepository<
  TTable extends MySqlTable<TableConfig>,
  TInsert,
  TSelect = InferSelectModel<TTable>,
  TUpdate = Partial<TInsert>,
> extends BaseRepository<TTable, TInsert, TSelect, TUpdate> {
  async existsInCv(cvId: number, id: number): Promise<boolean> {
    const record = await this.db
      .select()
      .from(this.table)
      .where(
        and(eq((this.table as any).id, id), eq((this.table as any).cvId, cvId)),
      )
      .limit(1);
    return record.length > 0;
  }

  async createForCv(cvId: number, data: TInsert): Promise<{ id: number }> {
    const result = await this.db
      .insert(this.table)
      .values({
        ...(data as any),
        cvId,
      })
      .$returningId();

    const id = (result as Array<{ insertId: number }>)[0].insertId;
    if (!id)
      throw new DataBaseError(
        `[CvChildRepository] Failed to create record in CV ${cvId}`,
      );

    return { id };
  }

  async getAllByIdInCv(cvId: number): Promise<TSelect[]> {
    return this.db
      .select()
      .from(this.table)
      .where(eq((this.table as any).cvId, cvId)) as Promise<TSelect[]>;
  }

  async getByIdInCv(cvId: number, id: number): Promise<TSelect> {
    const row = await this.db
      .select()
      .from(this.table)
      .where(
        and(eq((this.table as any).id, id), eq((this.table as any).cvId, cvId)),
      )
      .limit(1);

    const result = row.at(0);
    if (!result)
      throw new DataBaseError(
        `[CvChildRepository] Record ID ${id} not found in CV ${cvId}`,
      );

    return result as TSelect;
  }

  async updateInCv(cvId: number, id: number, data: TUpdate): Promise<boolean> {
    const isExist = await this.existsInCv(cvId, id);
    if (!isExist)
      throw new DataBaseError(
        `[CvChildRepository] Record ID ${id} not found in CV ${cvId}`,
      );

    return this.update(id, data);
  }

  async deleteByIdInCv(cvId: number, id: number): Promise<boolean> {
    const isExist = await this.existsInCv(cvId, id);
    if (!isExist)
      throw new DataBaseError(
        `[CvChildRepository] Record ID ${id} not found in CV ${cvId}`,
      );

    return this.delete(id);
  }
}
