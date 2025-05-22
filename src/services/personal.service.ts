import { BaseCrudService } from "./base.service";
import { basicRepository } from "./instance.repo";
import type { PersonalSelect, PersonalInsert } from "../db/types/personal.type";

export class PersonalService extends BaseCrudService<
  PersonalSelect,
  PersonalInsert
> {
  constructor(private readonly repo = basicRepository) {
    super(repo);
  }
}
