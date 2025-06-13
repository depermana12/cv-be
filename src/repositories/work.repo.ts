import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";

import { CvChildRepository } from "./cvChild.repo";
import { works, workDescriptions } from "../db/schema/work.db";
import type {
  WorkInsert,
  WorkDescInsert,
  WorkSelect,
  WorkDescUpdate,
  WorkUpdate,
  WorkDescSelect,
  WorkQueryOptions,
  WorkResponse,
} from "../db/types/work.type";
import { getDb } from "../db";

const db = await getDb();
export class WorkRepository extends CvChildRepository<
  typeof works,
  WorkInsert,
  WorkSelect,
  WorkUpdate
> {
  constructor() {
    super(works, db);
  }

  async getWork(id: number): Promise<WorkResponse | null> {
    const result = await this.db.query.works.findFirst({
      where: eq(works.id, id),
      with: {
        descriptions: true,
      },
    });
    return result ?? null;
  }

  async replaceDescriptions(
    workId: number,
    descriptions: Omit<WorkDescInsert, "workId">[],
  ): Promise<void> {
    return this.db.transaction(async (tx) => {
      // Delete existing descriptions
      await tx
        .delete(workDescriptions)
        .where(eq(workDescriptions.workId, workId));

      // Insert new descriptions if any
      if (descriptions.length > 0) {
        await tx
          .insert(workDescriptions)
          .values(descriptions.map((desc) => ({ ...desc, workId })));
      }
    });
  }

  async getAllWorks(
    cvId: number,
    options?: WorkQueryOptions,
  ): Promise<WorkResponse[]> {
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

    return this.db.query.works.findMany({
      where: and(...whereClause),
      with: {
        descriptions: true,
      },
      orderBy: options?.sortBy
        ? [
            options.sortOrder === "asc"
              ? asc(works[options.sortBy])
              : desc(works[options.sortBy]),
          ]
        : [],
    });
  }

  async createWork(
    workData: WorkInsert,
    descriptions: Omit<WorkDescInsert, "workId">[],
  ): Promise<{ id: number }> {
    return this.db.transaction(async (tx) => {
      const [work] = await tx.insert(works).values(workData).$returningId();

      if (descriptions.length > 0) {
        await tx
          .insert(workDescriptions)
          .values(descriptions.map((desc) => ({ ...desc, workId: work.id })));
      }
      return { id: work.id };
    });
  }

  async updateWork(
    workId: number,
    workData: WorkUpdate,
    descriptions?: Omit<WorkDescInsert, "workId">[],
  ): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      // Update main work only if there's actual data
      if (Object.keys(workData).length > 0) {
        const [result] = await tx
          .update(works)
          .set(workData)
          .where(eq(works.id, workId));

        if (result.affectedRows === 0) return false;
      }

      // Replace descriptions if provided
      if (descriptions !== undefined) {
        await tx
          .delete(workDescriptions)
          .where(eq(workDescriptions.workId, workId));

        if (descriptions.length > 0) {
          await tx
            .insert(workDescriptions)
            .values(descriptions.map((desc) => ({ ...desc, workId })));
        }
      }

      return true;
    });
  }

  async deleteWork(id: number): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      await tx.delete(workDescriptions).where(eq(workDescriptions.workId, id));
      const [result] = await tx.delete(works).where(eq(works.id, id));
      return result.affectedRows > 0;
    });
  }

  async createDescription(
    workId: number,
    description: Omit<WorkDescInsert, "workId">,
  ): Promise<{ id: number }> {
    const [desc] = await this.db
      .insert(workDescriptions)
      .values({ ...description, workId })
      .$returningId();

    return { id: desc.id };
  }

  async getOneDescription(descId: number): Promise<WorkDescSelect | null> {
    const [result] = await this.db
      .select()
      .from(workDescriptions)
      .where(eq(workDescriptions.id, descId));

    return result ?? null;
  }

  async getManyDescriptions(workId: number): Promise<WorkDescSelect[]> {
    return this.db
      .select()
      .from(workDescriptions)
      .where(eq(workDescriptions.workId, workId));
  }

  async updateDescription(
    descId: number,
    newDescription: WorkDescUpdate,
  ): Promise<boolean> {
    const [result] = await this.db
      .update(workDescriptions)
      .set(newDescription)
      .where(eq(workDescriptions.id, descId));

    return result.affectedRows > 0;
  }

  async deleteDescription(descId: number): Promise<boolean> {
    const [result] = await this.db
      .delete(workDescriptions)
      .where(eq(workDescriptions.id, descId));

    return result.affectedRows > 0;
  }
}
