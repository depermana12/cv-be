import { eq } from "drizzle-orm";

import { CvChildRepository } from "./cvChild.repo";
import { works, workDescriptions } from "../db/schema/work.db";
import type {
  WorkInsert,
  WorkDescInsert,
  WorkSelect,
  WorkDescUpdate,
  WorkUpdate,
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
  async getByIdWithDescriptions(id: number) {
    return this.db.query.works.findFirst({
      where: eq(works.id, id),
      with: {
        descriptions: true,
      },
    });
  }

  async getAllByIdWithDescriptions(cvId: number) {
    return this.db.query.works.findMany({
      where: eq(works.cvId, cvId),
      with: {
        descriptions: true,
      },
    });
  }

  async createWorkWithDescriptions(
    workData: WorkInsert,
    descriptions: WorkDescInsert[],
  ) {
    return this.db.transaction(async (tx) => {
      const [work] = await tx.insert(works).values(workData).$returningId();

      if (descriptions.length > 0) {
        await tx
          .insert(workDescriptions)
          .values(descriptions.map((desc) => ({ ...desc, workId: work.id })));
      }
      return work.id;
    });
  }

  async deleteWorkWithDescriptions(id: number): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      await tx.delete(workDescriptions).where(eq(workDescriptions.workId, id));
      const [result] = await tx.delete(works).where(eq(works.id, id));
      return result.affectedRows > 0;
    });
  }

  async createDescription(workId: number, description: WorkDescInsert) {
    const [desc] = await this.db
      .insert(workDescriptions)
      .values({ ...description, workId })
      .$returningId();

    return desc.id;
  }

  async getDescriptionById(descId: number) {
    const [result] = await this.db
      .select()
      .from(workDescriptions)
      .where(eq(workDescriptions.id, descId));

    return result ?? null;
  }

  async getAllDescriptions(workId: number) {
    return this.db
      .select()
      .from(workDescriptions)
      .where(eq(workDescriptions.workId, workId));
  }

  async updateDescription(descId: number, newDescription: WorkDescUpdate) {
    const [result] = await this.db
      .update(workDescriptions)
      .set(newDescription)
      .where(eq(workDescriptions.id, descId));

    return result.affectedRows > 0;
  }

  async deleteDescription(descId: number) {
    const [result] = await this.db
      .delete(workDescriptions)
      .where(eq(workDescriptions.id, descId));

    return result.affectedRows > 0;
  }
}
