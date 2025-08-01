import { CvChildRepository } from "../cvChild.repo";
import { organizations } from "../../db/schema/organization.db";
import type {
  OrganizationInsert,
  OrganizationSelect,
} from "../../db/types/organization.type";
import type { Database } from "../../db/index";

export class OrganizationRepository extends CvChildRepository<
  typeof organizations,
  OrganizationInsert,
  OrganizationSelect,
  "id"
> {
  constructor(db: Database) {
    super(organizations, db, "id");
  }
}
