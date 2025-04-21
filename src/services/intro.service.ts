import { BaseCrudService } from "./base.service";
import { introRepository } from "./instance.repo";
import { type BasicBase, type BasicInsert } from "../db/schema/personal.db";

export class IntroService extends BaseCrudService<BasicBase, BasicInsert> {
  constructor(private readonly repo = introRepository) {
    super(repo);
  }
}
