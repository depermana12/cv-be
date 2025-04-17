import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { BaseRepository } from "./base.repo";
import {
  personalLocation,
  type PersonalLocationInsert,
} from "../db/schema/personal.db";

export class Location extends BaseRepository<typeof personalLocation> {
  constructor() {
    super(personalLocation, "id");
  }
  async getByPersonalId(personalId: number) {
    return db
      .select()
      .from(this.table)
      .where(eq(this.table.personalId, personalId));
  }

  async updateByPersonalId(
    personalId: number,
    data: Partial<PersonalLocationInsert>,
  ) {
    await db
      .update(personalLocation)
      .set(data)
      .where(eq(personalLocation.personalId, personalId));

    return this.getByPersonalId(personalId);
  }
}
