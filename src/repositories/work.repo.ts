import { CvChildRepository } from "./cvChild.repo";
import { works } from "../db/schema/work.db";
import type { WorkInsert, WorkSelect } from "../db/types/work.type";
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
}
