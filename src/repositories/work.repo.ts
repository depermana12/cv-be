import { and, asc, desc, eq, like, sql } from "drizzle-orm";

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
  WorkWithDescriptions,
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

  // probably not working since i setup schema relations not in spreaded
  // i already setup spreaded schema drizzle queries in 14/05/25
  async getByIdWithDescriptions(
    id: number,
  ): Promise<WorkWithDescriptions | null> {
    const result = await this.db.query.works.findFirst({
      where: eq(works.id, id),
      with: {
        descriptions: true,
      },
    });
    return result ?? null;
  }

  async getAllByIdWithDescriptions(
    cvId: number,
    options?: WorkQueryOptions,
  ): Promise<WorkWithDescriptions[]> {
    const whereClause = [eq(works.cvId, cvId)];

    if (options?.search) {
      whereClause.push(
        like(sql`lower(${works.company})`, `%${options.search.toLowerCase()}%`),
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

  async createWorkWithDescriptions(
    workData: WorkInsert,
    descriptions: WorkDescInsert[],
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

  async deleteWorkWithDescriptions(id: number): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      await tx.delete(workDescriptions).where(eq(workDescriptions.workId, id));
      const [result] = await tx.delete(works).where(eq(works.id, id));
      return result.affectedRows > 0;
    });
  }

  async createDescription(
    workId: number,
    description: WorkDescInsert,
  ): Promise<{ id: number }> {
    const [desc] = await this.db
      .insert(workDescriptions)
      .values({ ...description, workId })
      .$returningId();

    return { id: desc.id };
  }

  async getDescriptionById(descId: number): Promise<WorkDescSelect | null> {
    const [result] = await this.db
      .select()
      .from(workDescriptions)
      .where(eq(workDescriptions.id, descId));

    return result ?? null;
  }

  async getAllDescriptions(workId: number): Promise<WorkDescSelect[]> {
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
