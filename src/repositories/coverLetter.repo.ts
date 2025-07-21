import { eq, and, desc, count } from "drizzle-orm";
import type { Database } from "../db/index.js";
import {
  coverLetters,
  coverLetterTemplates,
} from "../db/schema/coverLetter.db.js";
import { cv } from "../db/schema/cv.db.js";
import type {
  CoverLetter,
  CoverLetterInsert,
  CoverLetterUpdate,
  CoverLetterQuery,
  CoverLetterTemplate,
  CoverLetterTemplateInsert,
  CoverLetterTemplateUpdate,
  CoverLetterTemplateQuery,
  CoverLetterStats,
  PaginatedCoverLetterTemplates,
  PaginatedCoverLetters,
} from "../db/types/coverLetter.type.js";

export interface CoverLetterRepository {
  // Template methods
  createTemplate(data: CoverLetterTemplateInsert): Promise<CoverLetterTemplate>;
  getTemplates(
    userId: number,
    query: CoverLetterTemplateQuery,
  ): Promise<PaginatedCoverLetterTemplates>;
  getTemplateById(
    userId: number,
    templateId: number,
  ): Promise<CoverLetterTemplate>;
  updateTemplate(
    userId: number,
    templateId: number,
    data: CoverLetterTemplateUpdate,
  ): Promise<CoverLetterTemplate>;
  deleteTemplate(userId: number, templateId: number): Promise<void>;

  // Cover letter methods
  createCoverLetter(data: CoverLetterInsert): Promise<CoverLetter>;
  getCoverLetters(
    userId: number,
    query: CoverLetterQuery,
  ): Promise<PaginatedCoverLetters>;
  getCoverLetterById(
    userId: number,
    coverLetterId: number,
  ): Promise<CoverLetter>;
  updateCoverLetter(
    userId: number,
    coverLetterId: number,
    data: CoverLetterUpdate,
  ): Promise<CoverLetter>;
  deleteCoverLetter(userId: number, coverLetterId: number): Promise<void>;

  // Utility methods
  verifyCvOwnership(cvId: number, userId: number): Promise<boolean>;
  getCoverLetterStats(userId: number): Promise<CoverLetterStats>;
}

export class CoverLetterRepositoryImpl implements CoverLetterRepository {
  constructor(private db: Database) {}

  // ===== TEMPLATE METHODS =====

  async createTemplate(
    data: CoverLetterTemplateInsert,
  ): Promise<CoverLetterTemplate> {
    const [template] = await this.db
      .insert(coverLetterTemplates)
      .values(data)
      .returning();

    return template;
  }

  async getTemplates(
    userId: number,
    query: CoverLetterTemplateQuery,
  ): Promise<PaginatedCoverLetterTemplates> {
    const { limit = 10, offset = 0, tone, isDefault } = query;

    let whereConditions = [eq(coverLetterTemplates.userId, userId)];

    if (tone) {
      whereConditions.push(eq(coverLetterTemplates.tone, tone));
    }

    if (isDefault !== undefined) {
      whereConditions.push(eq(coverLetterTemplates.isDefault, isDefault));
    }

    const [templates, [{ count: total }]] = await Promise.all([
      this.db
        .select()
        .from(coverLetterTemplates)
        .where(and(...whereConditions))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(coverLetterTemplates.createdAt)),

      this.db
        .select({ count: count() })
        .from(coverLetterTemplates)
        .where(and(...whereConditions)),
    ]);

    return {
      data: templates,
      pagination: {
        total,
        limit,
        offset,
      },
    };
  }

  async getTemplateById(
    userId: number,
    templateId: number,
  ): Promise<CoverLetterTemplate> {
    const [template] = await this.db
      .select()
      .from(coverLetterTemplates)
      .where(
        and(
          eq(coverLetterTemplates.id, templateId),
          eq(coverLetterTemplates.userId, userId),
        ),
      );

    return template;
  }

  async updateTemplate(
    userId: number,
    templateId: number,
    data: CoverLetterTemplateUpdate,
  ): Promise<CoverLetterTemplate> {
    const [template] = await this.db
      .update(coverLetterTemplates)
      .set(data)
      .where(
        and(
          eq(coverLetterTemplates.id, templateId),
          eq(coverLetterTemplates.userId, userId),
        ),
      )
      .returning();

    return template;
  }

  async deleteTemplate(userId: number, templateId: number): Promise<void> {
    await this.db
      .delete(coverLetterTemplates)
      .where(
        and(
          eq(coverLetterTemplates.id, templateId),
          eq(coverLetterTemplates.userId, userId),
        ),
      );
  }

  // ===== COVER LETTER METHODS =====

  async createCoverLetter(data: CoverLetterInsert): Promise<CoverLetter> {
    const [coverLetter] = await this.db
      .insert(coverLetters)
      .values(data)
      .returning();

    return coverLetter;
  }

  async getCoverLetters(
    userId: number,
    query: CoverLetterQuery,
  ): Promise<PaginatedCoverLetters> {
    const { limit = 10, offset = 0, cvId, tone, applicationId } = query;

    let whereConditions = [eq(coverLetters.userId, userId)];

    if (cvId) {
      whereConditions.push(eq(coverLetters.cvId, cvId));
    }
    if (tone) {
      whereConditions.push(eq(coverLetters.tone, tone));
    }
    if (applicationId) {
      whereConditions.push(eq(coverLetters.applicationId, applicationId));
    }

    const [coverLettersList, [{ count: total }]] = await Promise.all([
      this.db
        .select()
        .from(coverLetters)
        .where(and(...whereConditions))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(coverLetters.updatedAt)),

      this.db
        .select({ count: count() })
        .from(coverLetters)
        .where(and(...whereConditions)),
    ]);

    return {
      data: coverLettersList,
      pagination: {
        total,
        limit,
        offset,
      },
    };
  }

  async getCoverLetterById(
    userId: number,
    coverLetterId: number,
  ): Promise<CoverLetter> {
    const [coverLetter] = await this.db
      .select()
      .from(coverLetters)
      .where(
        and(
          eq(coverLetters.id, coverLetterId),
          eq(coverLetters.userId, userId),
        ),
      );

    return coverLetter;
  }

  async updateCoverLetter(
    userId: number,
    coverLetterId: number,
    data: CoverLetterUpdate,
  ): Promise<CoverLetter> {
    const [coverLetter] = await this.db
      .update(coverLetters)
      .set(data)
      .where(
        and(
          eq(coverLetters.id, coverLetterId),
          eq(coverLetters.userId, userId),
        ),
      )
      .returning();

    return coverLetter;
  }

  async deleteCoverLetter(
    userId: number,
    coverLetterId: number,
  ): Promise<void> {
    await this.db
      .delete(coverLetters)
      .where(
        and(
          eq(coverLetters.id, coverLetterId),
          eq(coverLetters.userId, userId),
        ),
      );
  }

  // ===== UTILITY METHODS =====

  async verifyCvOwnership(cvId: number, userId: number): Promise<boolean> {
    const [cvExists] = await this.db
      .select({ id: cv.id })
      .from(cv)
      .where(and(eq(cv.id, cvId), eq(cv.userId, userId)));

    return !!cvExists;
  }

  async getCoverLetterStats(userId: number): Promise<CoverLetterStats> {
    const [stats] = await this.db
      .select({
        totalCoverLetters: count(),
      })
      .from(coverLetters)
      .where(eq(coverLetters.userId, userId));

    return {
      totalCoverLetters: stats.totalCoverLetters,
    };
  }
}
