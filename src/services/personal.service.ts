import { BaseCrudService } from "./base.service";
import { introRepository } from "./instance.repo";
import type { PersonalSelect, PersonalInsert } from "../db/schema/personal.db";

export class PersonalService extends BaseCrudService<
  PersonalSelect,
  PersonalInsert
> {
  constructor(private readonly repo = introRepository) {
    super(repo);
  }
}
