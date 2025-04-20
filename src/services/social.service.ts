import { BaseCrudService } from "./base.service";
import { socialRepository } from "./instance.repo";
import { type SocialBase, type SocialInsert } from "../db/schema/personal.db";

export class SocialService extends BaseCrudService<SocialBase, SocialInsert> {
  constructor(private readonly repo = socialRepository) {
    super(repo);
  }
}
