import { BaseCrudService } from "./base.service";
import { basicRepository } from "./instance.repo";
import { personalBasic } from "../db/schema/personal.db";

export class Basic extends BaseCrudService<typeof personalBasic> {
  constructor(private readonly repo = basicRepository) {
    super(repo, "id");
  }
}
