import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { BaseRepository } from "./base.repo";
import {
  locationTable,
  type LocationBase,
  type LocationInsert,
} from "../db/schema/personal.db";

export class Location extends BaseRepository<
  typeof locationTable,
  LocationBase,
  LocationInsert
> {
  constructor() {
    super(db, locationTable, "id");
  }
  async getByPersonalId(personalId: number) {
    return this.db
      .select()
      .from(this.table)
      .where(eq(this.table.personalId, personalId));
  }

  async updateByPersonalId(personalId: number, data: Partial<LocationInsert>) {
    await this.db
      .update(this.table)
      .set(data)
      .where(eq(this.table.personalId, personalId));

    return this.getByPersonalId(personalId);
  }
  async deleteByPersonalId(personalId: number) {
    await this.db
      .delete(this.table)
      .where(eq(this.table.personalId, personalId));
  }
}
