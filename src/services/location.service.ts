import { BaseCrudService } from "./base.service";
import { locationRepository } from "./instance.repo";
import type { LocationSelect, LocationInsert } from "../db/schema/location.db";

export class LocationService extends BaseCrudService<
  LocationSelect,
  LocationInsert
> {
  constructor(private readonly repo = locationRepository) {
    super(repo);
  }
}
