import { CvChildRepository } from "./cvChild.repo";
import { socials } from "../db/schema/social.db";
import type {
  SocialInsert,
  SocialSelect,
  SocialUpdate,
} from "../db/types/social.type";
import { getDb } from "../db";

const db = await getDb();
export class Social extends CvChildRepository<
  typeof socials,
  SocialInsert,
  SocialSelect,
  SocialUpdate
> {
  constructor() {
    super(socials, db);
  }
}
