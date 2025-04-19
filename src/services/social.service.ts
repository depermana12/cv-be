import { BaseCrudService } from "./base.service";
import { socialRepository } from "./instance.repo";
import {
  socialTable,
  type SocialBase,
  type SocialInsert,
} from "../db/schema/personal.db";

export class Social extends BaseCrudService<
  typeof socialTable,
  SocialBase,
  SocialInsert
> {
  constructor(private readonly repo = socialRepository) {
    super(repo, "id");
  }
}
