import { BaseCrudService } from "./base.service";
import { locationRepository } from "./instance.repo";
import { personalLocation } from "../db/schema/personal.db";

export class Location extends BaseCrudService<typeof personalLocation> {
  constructor(private readonly repo = locationRepository) {
    super(repo, "id");
  }
}
