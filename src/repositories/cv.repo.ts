import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  lte,
  ne,
  sql,
} from "drizzle-orm";
import { BaseRepository } from "./base.repo";
import { cv } from "../db/schema/cv.db";
import { users } from "../db/schema/user.db";
import type {
  CvInsert,
  CvQueryOptions,
  CvSelect,
  CvStats,
  CvUpdate,
  CvMinimalSelect,
  PaginatedCvResponse,
  ThemeUpdate,
} from "../db/types/cv.type";
import type { Database } from "../db/index";

export interface ICvRepository {
  createCv(cvData: CvInsert): Promise<CvSelect>;
  getCvForUser(cvId: number, userId: number): Promise<CvSelect | null>;
  getCvById(cvId: number): Promise<CvSelect | null>;
  getAllCvForUser(
    userId: number,
    options?: CvQueryOptions,
  ): Promise<PaginatedCvResponse>;
  updateCvForUser(
    cvId: number,
    userId: number,
    newCvData: CvUpdate,
  ): Promise<CvSelect>;
  deleteCvForUser(cvId: number, userId: number): Promise<boolean>;

  getCvByUsernameAndSlug(
    username: string,
    slug: string,
  ): Promise<CvMinimalSelect | null>;
  incrementViews(cvId: number): Promise<void>;
  incrementDownloads(cvId: number): Promise<void>;
  checkSlugAvailability(slug: string, excludeCvId?: number): Promise<boolean>;
  getPopularCvs(limit?: number): Promise<CvSelect[]>;
  getUserCvStats(userId: number): Promise<CvStats>;
  updateSectionOrder(
    cvId: number,
    userId: number,
    sections: string[],
  ): Promise<void>;
  updateCvTheme( // TODO: tidy up into export type
    cvId: number,
    userId: number,
    updateTheme: ThemeUpdate,
  ): Promise<void>;
}

export class CvRepository
  extends BaseRepository<typeof cv, CvInsert, CvSelect, "id">
  implements ICvRepository
{
  constructor(db: Database) {
    super(cv, db, "id");
  }

  async createCv(cvData: CvInsert) {
    return this.create(cvData);
  }

  async getCvForUser(cvId: number, userId: number) {
    const records = await this.db
      .select()
      .from(cv)
      .where(and(eq(cv.id, cvId), eq(cv.userId, userId)))
      .limit(1);

    return (records[0] as CvSelect) ?? null;
  }

  async getCvById(cvId: number) {
    const records = await this.db
      .select()
      .from(cv)
      .where(eq(cv.id, cvId))
      .limit(1);

    return (records[0] as CvSelect) ?? null;
  }

  async getAllCvForUser(userId: number, options?: CvQueryOptions) {
    const whereClause = [eq(cv.userId, userId)];

    if (options?.search) {
      const searchTerm = `%${options.search}%`;
      whereClause.push(ilike(cv.title, searchTerm));
    }

    // Use !== undefined to handle explicit false values
    // This allows filtering for:
    // - isPublic: true (only public CVs)
    // - isPublic: false (only private CVs)
    // - isPublic: undefined (all CVs - no filter applied)
    if (options?.isPublic !== undefined) {
      whereClause.push(eq(cv.isPublic, options.isPublic));
    }

    if (options?.from) {
      whereClause.push(gte(cv.createdAt, options.from));
    }

    if (options?.to) {
      whereClause.push(lte(cv.createdAt, options.to));
    }

    const data = await this.db
      .select()
      .from(cv)
      .where(and(...whereClause))
      .orderBy(
        options?.sortBy
          ? options.sortOrder === "desc"
            ? desc(cv[options.sortBy])
            : asc(cv[options.sortBy])
          : desc(cv.createdAt),
      )
      .limit(options?.limit ?? 10)
      .offset(options?.offset ?? 0);

    const [countResult] = await this.db
      .select({ count: count() })
      .from(cv)
      .where(and(...whereClause));

    const total = countResult?.count ?? 0;

    return {
      data: data,
      total: total,
      limit: options?.limit ?? 10,
      offset: options?.offset ?? 0,
    };
  }

  async updateCvForUser(cvId: number, userId: number, newCvData: CvUpdate) {
    const records = await this.db
      .update(cv)
      .set(newCvData)
      .where(and(eq(cv.id, cvId), eq(cv.userId, userId)))
      .returning();

    return (records as CvSelect[])[0];
  }

  async deleteCvForUser(cvId: number, userId: number) {
    const records = await this.db
      .delete(cv)
      .where(and(eq(cv.id, cvId), eq(cv.userId, userId)))
      .returning();

    return records.length > 0;
  }

  async getCvByUsernameAndSlug(username: string, slug: string) {
    const records = await this.db
      .select({
        id: cv.id,
        title: cv.title,
        description: cv.description,
        isPublic: cv.isPublic,
        views: cv.views,
        createdAt: cv.createdAt,
        updatedAt: cv.updatedAt,
      })
      .from(cv)
      .innerJoin(users, eq(cv.userId, users.id))
      .where(
        and(
          eq(users.username, username),
          eq(cv.slug, slug),
          eq(cv.isPublic, true),
        ),
      )
      .limit(1);

    return (records[0] as CvMinimalSelect) ?? null;
  }

  async incrementViews(cvId: number) {
    await this.db
      .update(cv)
      .set({ views: sql`${cv.views} + 1` })
      .where(eq(cv.id, cvId));
  }

  async incrementDownloads(cvId: number) {
    await this.db
      .update(cv)
      .set({ downloads: sql`${cv.downloads} + 1` })
      .where(eq(cv.id, cvId));
  }

  async checkSlugAvailability(slug: string, excludeCvId?: number) {
    const whereClause = [eq(cv.slug, slug)];

    if (excludeCvId) {
      whereClause.push(ne(cv.id, excludeCvId));
    }

    const records = await this.db
      .select({ id: cv.id })
      .from(cv)
      .where(and(...whereClause))
      .limit(1);

    return records.length === 0;
  }

  async getPopularCvs(limit = 10) {
    const data = await this.db
      .select()
      .from(cv)
      .where(eq(cv.isPublic, true))
      .orderBy(desc(cv.views), desc(cv.downloads))
      .limit(limit);

    return data;
  }

  async getUserCvStats(userId: number) {
    const statsResult = await this.db
      .select({
        totalViews: sql<number>`coalesce(sum(${cv.views}), 0)`,
        totalDownloads: sql<number>`coalesce(sum(${cv.downloads}), 0)`,
        totalCvs: count(),
      })
      .from(cv)
      .where(eq(cv.userId, userId));

    const stats = statsResult[0];

    return {
      totalViews: stats?.totalViews ?? 0,
      totalDownloads: stats?.totalDownloads ?? 0,
      totalCvs: stats?.totalCvs ?? 0,
    };
  }

  async updateSectionOrder(cvId: number, userId: number, sections: string[]) {
    await this.db
      .update(cv)
      .set({
        sections: sql`${JSON.stringify({ order: sections })}::jsonb`,
      })
      .where(and(eq(cv.id, cvId), eq(cv.userId, userId)));
  }
  async updateCvTheme(cvId: number, userId: number, updateTheme: ThemeUpdate) {
    const record = await this.db
      .select({ themes: cv.themes })
      .from(cv)
      .where(and(eq(cv.id, cvId), eq(cv.userId, userId)))
      .limit(1);
    const currentThemes = record[0]?.themes ?? {};

    // Merge/partial the update
    const updatedThemes = {
      ...currentThemes,
      [updateTheme.themeKey]: {
        ...currentThemes[updateTheme.themeKey],
        ...updateTheme.themeValue,
      },
    };
    await this.db
      .update(cv)
      .set({
        themes: sql`${JSON.stringify(updatedThemes)}::jsonb`,
      })
      .where(and(eq(cv.id, cvId), eq(cv.userId, userId)));
  }
}
