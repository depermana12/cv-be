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
  "id"
> {
  constructor(db: Database) {
    super(languages, db, "id");
  }

  async getLanguage(
    cvId: number,
    languageId: number,
  ): Promise<LanguageSelect | null> {
    return this.getByIdInCv(cvId, languageId);
  }

  async getAllLanguages(
    cvId: number,
    options?: LanguageQueryOptions,
  ): Promise<LanguageSelect[]> {
    const whereClause = [eq(languages.cvId, cvId)];

    if (options?.search) {
      const searchTerm = `%${options.search.toLowerCase()}%`;
      whereClause.push(like(sql`lower(${languages.language})`, searchTerm));
    }

    return this.db
      .select()
      .from(languages)
      .where(and(...whereClause))
      .orderBy(
        options?.sortBy
          ? options.sortOrder === "desc"
            ? desc(languages[options.sortBy])
            : asc(languages[options.sortBy])
          : asc(languages.id),
      );
  }

  async createLanguage(
    cvId: number,
    languageData: LanguageInsert,
  ): Promise<LanguageSelect> {
    return this.createInCv(cvId, languageData);
  }

  async updateLanguage(
    cvId: number,
    languageId: number,
    languageData: LanguageUpdate,
  ): Promise<LanguageSelect> {
    return this.updateInCv(cvId, languageId, languageData);
  }

  async deleteLanguage(cvId: number, languageId: number): Promise<boolean> {
    return this.deleteInCv(cvId, languageId);
  }
}
