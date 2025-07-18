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

export class WorkRepository extends CvChildRepository<
  typeof works,
  WorkInsert,
  WorkSelect,
  "id"
> {
  constructor(db: Database) {
    super(works, db, "id");
  }

  async getWork(cvId: number, workId: number): Promise<WorkSelect | null> {
    return this.getByIdInCv(cvId, workId);
  }

  async getAllWorks(
    cvId: number,
    options?: WorkQueryOptions,
  ): Promise<WorkSelect[]> {
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

  async createWork(cvId: number, workData: WorkInsert): Promise<WorkSelect> {
    return this.createInCv(cvId, workData);
  }

  async updateWork(
    cvId: number,
    workId: number,
    workData: WorkUpdate,
  ): Promise<WorkSelect> {
    return this.updateInCv(cvId, workId, workData);
  }

  async deleteWork(cvId: number, workId: number): Promise<boolean> {
    return this.deleteInCv(cvId, workId);
  }
}
