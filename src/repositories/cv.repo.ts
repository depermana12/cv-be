import { and, asc, desc, eq, like, sql } from "drizzle-orm";
import { BaseRepository } from "./base.repo";
import { cv } from "../db/schema/cv.db";
import type {
  CvInsert,
  CvQueryOptions,
  CvSelect,
  CvUpdate,
  PaginatedCvResponse,
} from "../db/types/cv.type";
import type { Database } from "../db/index";

export interface ICvRepository {
  createCv(cvData: CvInsert): Promise<CvSelect>;
  getCvForUser(cvId: number, userId: number): Promise<CvSelect | null>;
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

  async getAllCvForUser(userId: number, options?: CvQueryOptions) {
    const whereClause = [eq(cv.userId, userId)];

    if (options?.search) {
      whereClause.push(
        like(sql`lower(${cv.title})`, `%${options.search.toLowerCase()}%`),
      );
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

    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(cv)
      .where(and(...whereClause));

    const count = countResult[0]?.count ?? 0;

    return {
      data: data as CvSelect[],
      total: count,
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
}
