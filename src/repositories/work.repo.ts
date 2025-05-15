import { eq } from "drizzle-orm";
import { BaseRepository } from "./base.repo";
import { works, workDescriptions } from "../db/schema/work.db";
import type {
  WorkInsert,
  WorkDescInsert,
  WorkSelect,
} from "../db/types/work.type";
import { getDb } from "../db";

const db = await getDb();
export class WorkRepository extends BaseRepository<
  typeof works,
  WorkInsert,
  WorkSelect
> {
  constructor() {
    super(works, db);
  }

  // probably not working since i setup schema relations not in spreaded
  // i already setup spreaded schema drizzle queries in 14/05/25
  async getByIdWithDescriptions(id: number) {
    return await this.db.query.works.findFirst({
      where: eq(works.id, id),
      with: {
        descriptions: true,
      },
    });
  }
  async getDescription(descId: number) {
    const rows = await this.db
      .select()
      .from(workDescriptions)
      .where(eq(workDescriptions.id, descId));
    return rows[0] ?? null;
  }
  async addDescription(workId: number, description: WorkDescInsert) {
    const insertedDetail = await this.db
      .insert(workDescriptions)
      .values({ ...description, workId })
      .$returningId();
    return this.getById(insertedDetail[0].id);
  }

  async updateDescription(
    descId: number,
    newDescription: Partial<WorkDescInsert>,
  ) {
    await this.db
      .update(workDescriptions)
      .set(newDescription)
      .where(eq(workDescriptions.id, descId));
    return this.getDescription(descId);
  }
  async deleteProjectCascade(id: number) {
    await this.db
      .delete(workDescriptions)
      .where(eq(workDescriptions.workId, id));
    await this.db.delete(works).where(eq(works.id, id));
  }
}
