import { eq } from "drizzle-orm";

import { BaseRepository } from "./base.repo";
import { db } from "../db/index";
import { organizations, organizationDesc } from "../db/schema/organization.db";
import type {
  OrganizationInsert,
  OrganizationDescInsert,
} from "../db/schema/organization.db";

export class OrganizationRepository extends BaseRepository<
  typeof organizations,
  OrganizationInsert
> {
  constructor() {
    super(db, organizations);
  }
  async getDescription(descId: number) {
    const rows = await this.db
      .select()
      .from(organizationDesc)
      .where(eq(organizationDesc.organizationId, descId));
    return rows[0] ?? null;
  }
  async addDescription(
    organizationId: number,
    description: OrganizationDescInsert,
  ) {
    const insertedDetail = await this.db
      .insert(organizationDesc)
      .values({ ...description, organizationId })
      .$returningId();

    // TODO: should return description or whole org by id?
    return this.getById(insertedDetail[0].id);
  }

  async updateDescription(
    descId: number,
    newDescription: Partial<OrganizationDescInsert>,
  ) {
    await this.db
      .update(organizationDesc)
      .set(newDescription)
      .where(eq(organizationDesc.id, descId));
    return this.getDescription(descId);
  }
  async deleteProjectCascade(id: number) {
    await this.db
      .delete(organizationDesc)
      .where(eq(organizationDesc.organizationId, id));
    await this.db.delete(organizations).where(eq(organizations.id, id));
  }
}
