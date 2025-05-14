import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { BaseRepository } from "./base.repo";
import { location } from "../db/schema/location.db";
import type { LocationInsert } from "../db/types/location.type";

export class Location extends BaseRepository<typeof location, LocationInsert> {
  constructor() {
    super(db, location);
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
