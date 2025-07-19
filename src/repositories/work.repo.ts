import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { CvChildRepository } from "./cvChild.repo";
import { works } from "../db/schema/work.db";
import type {
  WorkInsert,
  WorkSelect,
  WorkUpdate,
  WorkQueryOptions,
} from "../db/types/work.type";
import type { Database } from "../db/index";

export interface IWorkRepository {
  getWork(cvId: number, workId: number): Promise<WorkSelect | null>;
  getAllWorks(cvId: number, options?: WorkQueryOptions): Promise<WorkSelect[]>;
  createWork(cvId: number, workData: WorkInsert): Promise<WorkSelect>;
  updateWork(
    cvId: number,
    workId: number,
    workData: WorkUpdate,
  ): Promise<WorkSelect>;
  deleteWork(cvId: number, workId: number): Promise<boolean>;
}

export class WorkRepository
  extends CvChildRepository<typeof works, WorkInsert, WorkSelect, "id">
  implements IWorkRepository
{
  constructor(db: Database) {
    super(works, db, "id");
  }

  async getWork(cvId: number, workId: number) {
    return this.getByIdInCv(cvId, workId);
  }

  async getAllWorks(cvId: number, options?: WorkQueryOptions) {
    const whereClause = [eq(works.cvId, cvId)];

    if (options?.search) {
      const searchTerm = `%${options.search.toLowerCase()}%`;
      whereClause.push(
        or(
          like(sql`lower(${works.company})`, searchTerm),
          like(sql`lower(${works.position})`, searchTerm),
        )!,
      );
    }

    return this.db
      .select()
      .from(works)
      .where(and(...whereClause))
      .orderBy(
        options?.sortBy
          ? options.sortOrder === "asc"
            ? asc(works[options.sortBy])
            : desc(works[options.sortBy])
          : desc(works.startDate),
      );
  }

  async createWork(cvId: number, workData: WorkInsert) {
    return this.createInCv(cvId, workData);
  }

  async updateWork(cvId: number, workId: number, workData: WorkUpdate) {
    return this.updateInCv(cvId, workId, workData);
  }

  async deleteWork(cvId: number, workId: number) {
    return this.deleteInCv(cvId, workId);
  }
}
