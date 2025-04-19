import { BaseCrudService } from "./base.service";
import { basicRepository } from "./instance.repo";
import {
  basicTable,
  type BasicBase,
  type BasicInsert,
} from "../db/schema/personal.db";

export class Basic extends BaseCrudService<
  typeof basicTable,
  BasicBase,
  BasicInsert
> {
  constructor(private readonly repo = basicRepository) {
    super(repo, "id");
  }
}
