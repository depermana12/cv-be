import { and, asc, desc, eq, like, sql } from "drizzle-orm";
import { CvChildRepository } from "./cvChild.repo";
import { profile } from "../db/schema/profile.db";
import type {
  ProfileInsert,
  ProfileQueryOptions,
  ProfileSelect,
  ProfileUpdate,
} from "../db/types/profile.type";
import { getDb } from "../db";

const db = await getDb();
export class ProfileRepository extends CvChildRepository<
  typeof profile,
  ProfileInsert,
  ProfileSelect,
  ProfileUpdate
> {
  constructor() {
    super(profile, db);
  }

  async getAllProfiles(
    cvId: number,
    options?: ProfileQueryOptions,
  ): Promise<ProfileSelect[]> {
    const whereClause = [eq(profile.cvId, cvId)];

    if (options?.search) {
      const searchTerm = `%${options.search.toLowerCase()}%`;
      const fullName = sql`lower(concat(${profile.firstName}, ' ', coalesce(${profile.lastName}, '')))`;
      whereClause.push(like(fullName, searchTerm));
    }

    return this.db.query.profile.findMany({
      where: and(...whereClause),
      orderBy: options?.sortBy
        ? [
            options.sortOrder === "desc"
              ? desc(profile[options.sortBy])
              : asc(profile[options.sortBy]),
          ]
        : [],
    });
  }
}
