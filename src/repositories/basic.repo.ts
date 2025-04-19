import { db } from "../db/index";
import { BaseRepository } from "./base.repo";
import {
  basicTable,
  type BasicBase,
  type BasicInsert,
} from "../db/schema/personal.db";

export class Basic extends BaseRepository<
  typeof basicTable,
  BasicBase,
  BasicInsert
> {
  constructor() {
    super(db, basicTable, "id");
  }
}
