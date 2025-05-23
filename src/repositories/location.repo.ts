import { CvChildRepository } from "./cvChild.repo";
import { location } from "../db/schema/location.db";
import type {
  LocationInsert,
  LocationSelect,
  LocationUpdate,
} from "../db/types/location.type";
import { getDb } from "../db";

const db = await getDb();
export class Location extends CvChildRepository<
  typeof location,
  LocationInsert,
  LocationSelect,
  LocationUpdate
> {
  constructor() {
    super(location, db);
  }
}
