import { BaseCrudService } from "./base.service";
import { locationRepository } from "./instance.repo";
import {
  type LocationBase,
  type LocationInsert,
} from "../db/schema/personal.db";

export class LocationService extends BaseCrudService<
  LocationBase,
  LocationInsert
> {
  constructor(private readonly repo = locationRepository) {
    super(repo);
  }
}
