import { db } from "../db/index";
import { BaseRepository } from "./base.repo";
import { intro, type BasicInsert } from "../db/schema/personal.db";

export class Basic extends BaseRepository<typeof intro, BasicInsert> {
  constructor() {
    super(db, intro);
  }
}
