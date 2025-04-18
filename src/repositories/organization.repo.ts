import { eq } from "drizzle-orm";

import { BaseRepository } from "./base.repo";
import { db } from "../db/index";
import {
  organization,
  organizationDetails,
} from "../db/schema/organization.db";
import type {
  OrganizationInsert,
  OrganizationDetailInsert,
} from "../db/schema/organization.db";

export class OrganizationRepository extends BaseRepository<
  typeof organization,
  OrganizationInsert
> {
  constructor() {
    super(db, organization, "id");
  }
  async getDetailById(organizationExperienceId: number) {
    const rows = await this.db
      .select()
      .from(organizationDetails)
      .where(eq(organizationDetails.id, organizationExperienceId));
    return rows[0];
  }
  async addDetails(
    organizationId: number,
    newOrganizationDetail: OrganizationDetailInsert,
  ) {
    const insertedDetail = await this.db
      .insert(organizationDetails)
      .values({ ...newOrganizationDetail, organizationId })
      .$returningId();
    return this.getById(insertedDetail[0].id);
  }

  async updateDetails(
    detailId: number,
    newDetail: Partial<OrganizationDetailInsert>,
  ) {
    await this.db
      .update(organizationDetails)
      .set(newDetail)
      .where(eq(organizationDetails.id, detailId));
    return this.getDetailById(detailId);
  }
  async deleteProjectWithDetails(id: number) {
    await this.db
      .delete(organizationDetails)
      .where(eq(organizationDetails.organizationId, id));
    await this.db.delete(organization).where(eq(organization.id, id));
  }
}
