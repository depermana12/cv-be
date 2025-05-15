import { eq } from "drizzle-orm";
import { BaseRepository } from "./base.repo";
import { socials } from "../db/schema/social.db";
import type { SocialInsert } from "../db/types/social.type";
import { getDb } from "../db";

const db = await getDb();
export class Social extends BaseRepository<typeof socials, SocialInsert> {
  constructor() {
    super(socials, db);
  }
  async getByPersonalId(personalId: number) {
    return this.db
      .select()
      .from(this.table)
      .where(eq(this.table.personalId, personalId));
  }

  async deleteByPersonalId(personalId: number) {
    await this.db
      .delete(this.table)
      .where(eq(this.table.personalId, personalId));
  }
}
