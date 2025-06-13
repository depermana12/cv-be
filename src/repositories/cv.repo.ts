import { and, asc, desc, eq, like, sql } from "drizzle-orm";
import { cv } from "../db/schema/cv.db";
import type {
  CvInsert,
  CvQueryOptions,
  CvSelect,
  CvUpdate,
  PaginatedCvResponse,
} from "../db/types/cv.type";
import type { Database } from "../db/index";

export class CvRepository {
  constructor(private readonly db: Database) {}

  async createCv(cvData: CvInsert): Promise<{ id: number }> {
    const [result] = await this.db.insert(cv).values(cvData).$returningId();
    return { id: result.id };
  }

  async getCvByIdAndUserId(
    cvId: number,
    userId: number,
  ): Promise<CvSelect | null> {
    const result = await this.db.query.cv.findFirst({
      where: and(eq(cv.id, cvId), eq(cv.userId, userId)),
    });

    return result ?? null;
  }

  async getAllCvByUserId(
    userId: number,
    options?: CvQueryOptions,
  ): Promise<PaginatedCvResponse> {
    const whereClause = [eq(cv.userId, userId)];

    if (options?.search) {
      whereClause.push(
        like(sql`lower(${cv.title})`, `%${options.search.toLowerCase()}%`),
      );
    }

    const data = await this.db.query.cv.findMany({
      where: and(...whereClause),
      orderBy: options?.sortBy
        ? [
            options.sortOrder === "desc"
              ? desc(cv[options.sortBy])
              : asc(cv[options.sortBy]),
          ]
        : [desc(cv.createdAt)],
      limit: options?.limit ?? 10,
      offset: options?.offset ?? 0,
    });

    const count = await this.db.$count(cv, and(...whereClause));

    return {
      data,
      total: count,
      limit: options?.limit ?? 10,
      offset: options?.offset ?? 0,
    };
  }

  async getUserCvCount(userId: number): Promise<number> {
    return this.db.$count(cv, eq(cv.userId, userId));
  }

  async updateCvByIdAndUserId(
    cvId: number,
    userId: number,
    newCvData: CvUpdate,
  ): Promise<boolean> {
    const result = await this.db
      .update(cv)
      .set(newCvData)
      .where(and(eq(cv.id, cvId), eq(cv.userId, userId)));

    return result.length > 0;
  }

  async deleteCvByIdAndUserId(cvId: number, userId: number): Promise<boolean> {
    const result = await this.db
      .delete(cv)
      .where(and(eq(cv.id, cvId), eq(cv.userId, userId)));

    return result.length > 0;
  }
}
