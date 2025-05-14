import { db } from "../db/index";
import { BaseRepository } from "./base.repo";
import { personal } from "../db/schema/personal.db";
import type { PersonalInsert, PersonalSelect } from "../db/types/personal.type";

export class Basic extends BaseRepository<
  typeof personal,
  PersonalInsert,
  PersonalSelect
> {
  constructor() {
    super(db, personal);
  }
}
