import { BaseCrudService } from "./base.service";
import { socialRepository } from "./instance.repo";
import { socialTable } from "../db/schema/personal.db";

export class Social extends BaseCrudService<typeof socialTable> {
  constructor(private readonly repo = socialRepository) {
    super(repo, "id");
  }
}
