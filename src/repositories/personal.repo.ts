import { db } from "../db/index";
import { BaseRepository } from "./base.repo";
import { personal, type PersonalInsert } from "../db/schema/personal.db";

export class Basic extends BaseRepository<typeof personal, PersonalInsert> {
  constructor() {
    super(db, personal);
  }
}
