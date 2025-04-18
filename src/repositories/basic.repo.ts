import { BaseRepository } from "./base.repo";
import { basicTable } from "../db/schema/personal.db";

export class Basic extends BaseRepository<typeof basicTable> {
  constructor() {
    super(basicTable, "id");
  }
}
