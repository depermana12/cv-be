import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { BaseRepository } from "./base.repo";
import { socialTable, type SocialInsert } from "../db/schema/personal.db";

export class Social extends BaseRepository<typeof socialTable, SocialInsert> {
  constructor() {
    super(db, socialTable);
  }
  async getByPersonalId(personalId: number) {
    return this.db
      .select()
      .from(this.table)
      .where(eq(this.table.personalId, personalId));
  }
  async replaceAllForPersonalId(
    personalId: number,
    socials: SocialInsert[],
  ): Promise<void> {
    await this.db
      .delete(this.table)
      .where(eq(this.table.personalId, personalId));

    if (socials.length > 0) {
      await this.db.insert(socialTable).values(
        socials.map((social) => ({
          ...social,
          personalId,
        })),
      );
    }
  }

  async deleteByPersonalId(personalId: number) {
    await this.db
      .delete(this.table)
      .where(eq(this.table.personalId, personalId));
  }
}
