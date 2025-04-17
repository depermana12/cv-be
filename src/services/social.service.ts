import { BaseCrudService } from "./base.service";
import { socialRepository } from "./instance.repo";
import { personalSocial } from "../db/schema/personal.db";

export class Social extends BaseCrudService<typeof personalSocial> {
  constructor(private readonly repo = socialRepository) {
    super(repo, "id");
  }
}
