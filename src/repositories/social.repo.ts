import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { BaseRepository } from "./base.repo";
import { socialTable, type SocialInsert } from "../db/schema/personal.db";

export class Social extends BaseRepository<typeof socialTable, SocialInsert> {
  constructor() {
    super(socialTable, "id");
  }
  async getByPersonalId(personalId: number) {
    return db
      .select()
      .from(this.table)
      .where(eq(this.table.personalId, personalId));
  }
  async replaceAllForPersonalId(personalId: number, socials: SocialInsert[]) {
    await db.delete(this.table).where(eq(socialTable.personalId, personalId));

    if (socials.length > 0) {
      await db.insert(socialTable).values(
        socials.map((social) => ({
          ...social,
          personalId,
        })),
      );
    }

    return this.getAll();
  }

  async deleteByPersonalId(personalId: number) {
    await db.delete(this.table).where(eq(this.table.personalId, personalId));
  }
}
