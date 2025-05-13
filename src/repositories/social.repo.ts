import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { BaseRepository } from "./base.repo";
import { socials } from "../db/schema/social.db";
import type { SocialInsert } from "../db/types/social.type";

export class Social extends BaseRepository<typeof socials, SocialInsert> {
  constructor() {
    super(db, socials);
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
