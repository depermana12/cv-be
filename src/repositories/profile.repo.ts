import { CvChildRepository } from "./cvChild.repo";
import { profile } from "../db/schema/profile.db";
import type { ProfileInsert, ProfileSelect } from "../db/types/profile.type";
import { getDb } from "../db";

const db = await getDb();
export class Profile extends CvChildRepository<
  typeof profile,
  ProfileInsert,
  ProfileSelect
> {
  constructor() {
    super(profile, db);
  }
}
