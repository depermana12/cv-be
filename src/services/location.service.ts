import { BaseCrudService } from "./base.service";
import { locationRepository } from "./instance.repo";
import {
  locationTable,
  type LocationBase,
  type LocationInsert,
} from "../db/schema/personal.db";

export class Location extends BaseCrudService<
  typeof locationTable,
  LocationBase,
  LocationInsert
> {
  constructor(private readonly repo = locationRepository) {
    super(repo, "id");
  }
}
