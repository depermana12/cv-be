import { and, asc, desc, eq, like, sql } from "drizzle-orm";
import type { MySql2Database } from "drizzle-orm/mysql2";
import { cv } from "../db/schema/cv.db";
import type {
  CvInsert,
  CvQueryOptions,
  CvSelect,
  CvUpdate,
  PaginatedCvResponse,
} from "../db/types/cv.type";
import { getDb } from "../db/index";
import { schema } from "../db/index";

const dbInstance = await getDb();
export class CvRepository {
  constructor(
    private readonly db: MySql2Database<typeof schema> = dbInstance,
  ) {}

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
        : [],
      limit: options?.limit ?? 10,
      offset: options?.offset ?? 0,
    });

    const count = await this.db.$count(cv, ...whereClause);

    return {
      data,
      total: count,
      limit: options?.limit ?? 10,
      offset: options?.offset ?? 0,
    };
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
