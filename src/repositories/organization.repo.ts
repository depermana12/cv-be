import { eq } from "drizzle-orm";

import { BaseRepository } from "./base.repo";
import { db } from "../db/index";
import { organizations, organizationDesc } from "../db/schema/organization.db";
import type {
  OrganizationInsert,
  OrganizationDetailInsert,
} from "../db/schema/organization.db";

export class OrganizationRepository extends BaseRepository<
  typeof organizations,
  OrganizationInsert
> {
  constructor() {
    super(db, organizations);
  }
  async getDetailById(organizationExperienceId: number) {
    const rows = await this.db
      .select()
      .from(organizationDesc)
      .where(eq(organizationDesc.id, organizationExperienceId));
    return rows[0];
  }
  async addDetails(
    organizationId: number,
    newOrganizationDetail: OrganizationDetailInsert,
  ) {
    const insertedDetail = await this.db
      .insert(organizationDesc)
      .values({ ...newOrganizationDetail, organizationId })
      .$returningId();
    return this.getById(insertedDetail[0].id);
  }

  async updateDetails(
    detailId: number,
    newDetail: Partial<OrganizationDetailInsert>,
  ) {
    await this.db
      .update(organizationDesc)
      .set(newDetail)
      .where(eq(organizationDesc.id, detailId));
    return this.getDetailById(detailId);
  }
  async deleteProjectWithDetails(id: number) {
    await this.db
      .delete(organizationDesc)
      .where(eq(organizationDesc.organizationId, id));
    await this.db.delete(organizations).where(eq(organizations.id, id));
  }
}
