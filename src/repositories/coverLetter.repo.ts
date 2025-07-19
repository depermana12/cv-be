import { eq, and, desc, count, sql } from "drizzle-orm";
import type { Database } from "../db/index.js";
import {
  coverLetters,
  coverLetterTemplates,
  coverLetterSections,
} from "../db/schema/coverLetter.db.js";
import { cv } from "../db/schema/cv.db.js";
import type {
  CoverLetterInsert,
  CoverLetterUpdate,
  CoverLetterQuery,
  CoverLetterTemplateInsert,
  CoverLetterTemplateUpdate,
  CoverLetterTemplateQuery,
  BulkUpdateStatus,
} from "../schemas/coverLetter.schema.js";

export interface CoverLetterRepository {
  // Template methods
  createTemplate(
    data: CoverLetterTemplateInsert & { userId: number },
  ): Promise<any>;
  getTemplates(
    userId: number,
    query: CoverLetterTemplateQuery,
  ): Promise<{ data: any[]; total: number; limit: number; offset: number }>;
  getTemplateById(userId: number, templateId: number): Promise<any>;
  updateTemplate(
    userId: number,
    templateId: number,
    data: CoverLetterTemplateUpdate,
  ): Promise<any>;
  deleteTemplate(userId: number, templateId: number): Promise<void>;

  // Cover letter methods
  createCoverLetter(
    data: CoverLetterInsert & { userId: number; wordCount: number },
  ): Promise<any>;
  getCoverLetters(
    userId: number,
    query: CoverLetterQuery,
  ): Promise<{ data: any[]; total: number; limit: number; offset: number }>;
  getCoverLetterById(userId: number, coverLetterId: number): Promise<any>;
  updateCoverLetter(
    userId: number,
    coverLetterId: number,
    data: any,
  ): Promise<any>;
  deleteCoverLetter(userId: number, coverLetterId: number): Promise<void>;

  // Utility methods
  verifyCvOwnership(cvId: number, userId: number): Promise<boolean>;
  bulkUpdateStatus(userId: number, data: BulkUpdateStatus): Promise<void>;
  getCoverLetterStats(userId: number): Promise<any>;
}

export class CoverLetterRepositoryImpl implements CoverLetterRepository {
  constructor(private db: Database) {}

  // ===== TEMPLATE METHODS =====

  async createTemplate(
    data: CoverLetterTemplateInsert & { userId: number },
  ): Promise<any> {
    const [template] = await this.db
      .insert(coverLetterTemplates)
      .values(data)
      .returning();

    return template;
  }

  async getTemplates(
    userId: number,
    query: CoverLetterTemplateQuery,
  ): Promise<{ data: any[]; total: number; limit: number; offset: number }> {
    const { limit, offset, tone, isDefault } = query;

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
      total,
      limit,
      offset,
    };
  }

  async getTemplateById(userId: number, templateId: number): Promise<any> {
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
  ): Promise<any> {
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

  async createCoverLetter(
    data: CoverLetterInsert & { userId: number; wordCount: number },
  ): Promise<any> {
    const [coverLetter] = await this.db
      .insert(coverLetters)
      .values(data)
      .returning();

    return coverLetter;
  }

  async getCoverLetters(
    userId: number,
    query: CoverLetterQuery,
  ): Promise<{ data: any[]; total: number; limit: number; offset: number }> {
    const { limit, offset, cvId, status, tone, applicationId } = query;

    let whereConditions = [eq(coverLetters.userId, userId)];

    if (cvId) {
      whereConditions.push(eq(coverLetters.cvId, cvId));
    }
    if (status) {
      whereConditions.push(eq(coverLetters.status, status));
    }
    if (tone) {
      whereConditions.push(eq(coverLetters.tone, tone));
    }
    if (applicationId) {
      whereConditions.push(eq(coverLetters.applicationId, applicationId));
    }

    const [coverLettersList, [{ count: total }]] = await Promise.all([
      this.db
        .select({
          id: coverLetters.id,
          title: coverLetters.title,
          companyName: coverLetters.companyName,
          position: coverLetters.position,
          status: coverLetters.status,
          tone: coverLetters.tone,
          wordCount: coverLetters.wordCount,
          cvId: coverLetters.cvId,
          createdAt: coverLetters.createdAt,
          updatedAt: coverLetters.updatedAt,
        })
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
      total,
      limit,
      offset,
    };
  }

  async getCoverLetterById(
    userId: number,
    coverLetterId: number,
  ): Promise<any> {
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
    data: any,
  ): Promise<any> {
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

  async bulkUpdateStatus(
    userId: number,
    data: BulkUpdateStatus,
  ): Promise<void> {
    const { coverLetterIds, status } = data;

    await this.db
      .update(coverLetters)
      .set({ status })
      .where(
        and(
          sql`${coverLetters.id} = ANY(${coverLetterIds})`,
          eq(coverLetters.userId, userId),
        ),
      );
  }

  async getCoverLetterStats(userId: number): Promise<any> {
    const [stats] = await this.db
      .select({
        totalCoverLetters: count(),
        draftCount: count(
          sql`CASE WHEN ${coverLetters.status} = 'draft' THEN 1 END`,
        ),
        activeCount: count(
          sql`CASE WHEN ${coverLetters.status} = 'active' THEN 1 END`,
        ),
        archivedCount: count(
          sql`CASE WHEN ${coverLetters.status} = 'archived' THEN 1 END`,
        ),
        avgWordCount: sql<number>`AVG(${coverLetters.wordCount})`,
      })
      .from(coverLetters)
      .where(eq(coverLetters.userId, userId));

    return stats;
  }
}
