import { BaseCrudService } from "./base.service";
import { socialRepository } from "./instance.repo";
import type { SocialSelect, SocialInsert } from "../db/types/social.type";

export class SocialService extends BaseCrudService<SocialSelect, SocialInsert> {
  constructor(private readonly repo = socialRepository) {
    super(repo);
  }
}
