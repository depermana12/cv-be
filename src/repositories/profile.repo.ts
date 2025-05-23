import { CvChildRepository } from "./cvChild.repo";
import { profile } from "../db/schema/profile.db";
import type {
  ProfileInsert,
  ProfileSelect,
  ProfileUpdate,
} from "../db/types/profile.type";
import { getDb } from "../db";

const db = await getDb();
export class Profile extends CvChildRepository<
  typeof profile,
  ProfileInsert,
  ProfileSelect,
  ProfileUpdate
> {
  constructor() {
    super(profile, db);
  }
}
