import { BaseRepository } from "./base.repo";
import { personal } from "../db/schema/personal.db";
import type { PersonalInsert, PersonalSelect } from "../db/types/personal.type";
import { getDb } from "../db";

const db = await getDb();
export class Basic extends BaseRepository<
  typeof personal,
  PersonalInsert,
  PersonalSelect
> {
  constructor() {
    super(personal, db);
  }
}
