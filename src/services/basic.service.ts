import { BaseCrudService } from "./base.service";
import { basicRepository } from "./instance.repo";
import { type BasicBase, type BasicInsert } from "../db/schema/personal.db";

export class BasicService extends BaseCrudService<BasicBase, BasicInsert> {
  constructor(private readonly repo = basicRepository) {
    super(repo);
  }
}
