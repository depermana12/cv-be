import { db } from "../db/index";
import { BaseRepository } from "./base.repo";
import { basicTable, type BasicInsert } from "../db/schema/personal.db";

export class Basic extends BaseRepository<typeof basicTable, BasicInsert> {
  constructor() {
    super(db, basicTable);
  }
}
