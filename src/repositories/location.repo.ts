import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { BaseRepository } from "./base.repo";
import { locationTable, type LocationInsert } from "../db/schema/personal.db";

export class Location extends BaseRepository<
  typeof locationTable,
  LocationInsert
> {
  constructor() {
    super(locationTable, "id");
  }
  async getByPersonalId(personalId: number) {
    return db
      .select()
      .from(this.table)
      .where(eq(this.table.personalId, personalId));
  }

  async updateByPersonalId(personalId: number, data: Partial<LocationInsert>) {
    await db
      .update(locationTable)
      .set(data)
      .where(eq(locationTable.personalId, personalId));

    return this.getByPersonalId(personalId);
  }
  async deleteByPersonalId(personalId: number) {
    await db.delete(this.table).where(eq(this.table.personalId, personalId));
  }
}
