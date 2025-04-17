import { BaseRepository } from "./base.repo";
import { personalBasic } from "../db/schema/personal.db";

export class Basic extends BaseRepository<typeof personalBasic> {
  constructor() {
    super(personalBasic, "id");
  }
}
