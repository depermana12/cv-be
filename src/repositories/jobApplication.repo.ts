import { and, eq, sql, desc, asc, gte, lte } from "drizzle-orm";
import { jobApplications } from "../db/schema/jobApplication.db";
import type {
  JobApplicationCreate,
  JobApplicationSelect,
  JobApplicationUpdate,
  JobApplicationQueryOptions,
  PaginatedJobApplicationResponse,
} from "../db/types/jobApplication.type";
import type { Database } from "../db/index";

export interface IJobApplication {
  create(data: JobApplicationCreate): Promise<JobApplicationSelect>;
  getByIdAndUser(
    id: number,
    userId: number,
  ): Promise<JobApplicationSelect | null>;
  getAllByUser(
    userId: number,
    options?: JobApplicationQueryOptions,
  ): Promise<PaginatedJobApplicationResponse>;
  updateByIdAndUser(
    id: number,
    userId: number,
    data: JobApplicationUpdate,
  ): Promise<JobApplicationSelect | null>;
  deleteByIdAndUser(id: number, userId: number): Promise<boolean>;
}

export class JobApplicationRepository implements IJobApplication {
  private readonly table = jobApplications;
  constructor(private readonly db: Database) {}

  async create(data: JobApplicationCreate) {
    const [result] = await this.db.insert(this.table).values(data).returning();
    return result;
  }

  async getByIdAndUser(id: number, userId: number) {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(and(eq(this.table.id, id), eq(this.table.userId, userId)))
      .limit(1);
    return result ?? null;
  }

  async getAllByUser(userId: number, options?: JobApplicationQueryOptions) {
    const whereClause = [eq(this.table.userId, userId)];

    if (options?.search) {
      const searchTerm = `%${options.search}%`;
      whereClause.push(
        sql`(${this.table.companyName} ilike ${searchTerm} or ${this.table.jobTitle} ilike ${searchTerm})`,
      );
    }

    if (options?.appliedAtFrom) {
      whereClause.push(gte(this.table.appliedAt, options.appliedAtFrom));
    }

    if (options?.appliedAtTo) {
      whereClause.push(lte(this.table.appliedAt, options.appliedAtTo));
    }

    const data = await this.db
      .select()
      .from(this.table)
      .where(and(...whereClause))
      .orderBy(
        options?.sortBy
          ? options.sortOrder === "desc"
            ? desc(this.table[options.sortBy])
            : asc(this.table[options.sortBy])
          : desc(this.table.createdAt),
      )
      .limit(options?.limit ?? 10)
      .offset(options?.offset ?? 0);

    const [countResult] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(this.table)
      .where(and(...whereClause));

    return {
      data,
      total: countResult.count,
      limit: options?.limit ?? 10,
      offset: options?.offset ?? 0,
    };
  }

  async updateByIdAndUser(
    id: number,
    userId: number,
    data: JobApplicationUpdate,
  ) {
    const result = await this.db
      .update(this.table)
      .set(data)
      .where(and(eq(this.table.id, id), eq(this.table.userId, userId)))
      .returning();
    return result.length > 0 ? result[0] : null;
  }

  async deleteByIdAndUser(id: number, userId: number) {
    const result = await this.db
      .delete(this.table)
      .where(and(eq(this.table.id, id), eq(this.table.userId, userId)))
      .returning();
    return result.length > 0;
  }
}
