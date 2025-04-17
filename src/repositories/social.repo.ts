import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { BaseRepository } from "./base.repo";
import {
  personalSocial,
  type PersonalSocialInsert,
} from "../db/schema/personal.db";

export class Social extends BaseRepository<typeof personalSocial> {
  constructor() {
    super(personalSocial, "id");
  }
  async getByPersonalId(personalId: number) {
    return db
      .select()
      .from(this.table)
      .where(eq(this.table.personalId, personalId));
  }
  async replaceAllForPersonalId(
    personalId: number,
    socials: PersonalSocialInsert[],
  ) {
    await db
      .delete(this.table)
      .where(eq(personalSocial.personalId, personalId));

    if (socials.length > 0) {
      await db.insert(personalSocial).values(
        socials.map((social) => ({
          ...social,
          personalId,
        })),
      );
    }

    return this.getAll();
  }
}
