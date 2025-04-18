import { BaseCrudService } from "./base.service";
import { basicRepository } from "./instance.repo";
import { basicTable } from "../db/schema/personal.db";

export class Basic extends BaseCrudService<typeof basicTable> {
  constructor(private readonly repo = basicRepository) {
    super(repo, "id");
  }
}
