import { BaseCrudService } from "./base.service";
import { locationRepository } from "./instance.repo";
import { locationTable } from "../db/schema/personal.db";

export class Location extends BaseCrudService<typeof locationTable> {
  constructor(private readonly repo = locationRepository) {
    super(repo, "id");
  }
}
