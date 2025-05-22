import { CvChildRepository } from "./cvChild.repo";
import { personal } from "../db/schema/personal.db";
import type { PersonalInsert, PersonalSelect } from "../db/types/personal.type";
import { getDb } from "../db";

const db = await getDb();
export class Basic extends CvChildRepository<
  typeof personal,
  PersonalInsert,
  PersonalSelect
> {
  constructor() {
    super(personal, db);
  }
}
