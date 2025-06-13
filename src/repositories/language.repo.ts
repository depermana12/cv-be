import { and, asc, desc, eq, like, sql } from "drizzle-orm";
import { CvChildRepository } from "./cvChild.repo";
import { languages } from "../db/schema/language.db";
import type {
  LanguageInsert,
  LanguageQueryOptions,
  LanguageSelect,
  LanguageUpdate,
} from "../db/types/language.type";
import type { Database } from "../db/index";
export class LanguageRepository extends CvChildRepository<
  typeof languages,
  LanguageInsert,
  LanguageSelect,
  LanguageUpdate
> {
  constructor(db: Database) {
    super(languages, db);
  }

  async getAllLanguages(
    cvId: number,
    search?: LanguageQueryOptions,
  ): Promise<LanguageSelect[]> {
    const whereClause = [eq(languages.cvId, cvId)];

    if (search?.search) {
      const searchTerm = `%${search.search.toLowerCase()}%`;
      whereClause.push(like(sql`lower(${languages.language})`, searchTerm));
    }

    return this.db.query.languages.findMany({
      where: and(...whereClause),
      orderBy: search?.sortBy
        ? [
            search.sortOrder === "desc"
              ? desc(languages[search.sortBy])
              : asc(languages[search.sortBy]),
          ]
        : [],
    });
  }
}
