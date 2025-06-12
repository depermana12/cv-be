import { and, asc, desc, eq, like, sql } from "drizzle-orm";
import { CvChildRepository } from "./cvChild.repo";
import { socials } from "../db/schema/social.db";
import type {
  SocialInsert,
  SocialQueryOptions,
  SocialSelect,
  SocialUpdate,
} from "../db/types/social.type";
import { getDb } from "../db";

const db = await getDb();
export class SocialMediaRepository extends CvChildRepository<
  typeof socials,
  SocialInsert,
  SocialSelect,
  SocialUpdate
> {
  constructor() {
    super(socials, db);
  }

  async getAllSocialMedia(
    cvId: number,
    options?: SocialQueryOptions,
  ): Promise<SocialSelect[]> {
    const whereClause = [eq(socials.cvId, cvId)];

    if (options?.search) {
      const searchTerm = `%${options.search.toLowerCase()}%`;
      whereClause.push(like(sql`lower(${socials.social})`, searchTerm));
    }

    return this.db.query.socials.findMany({
      where: and(...whereClause),
      orderBy: options?.sortBy
        ? [
            options.sortOrder === "desc"
              ? desc(socials[options.sortBy])
              : asc(socials[options.sortBy]),
          ]
        : [],
    });
  }
}
