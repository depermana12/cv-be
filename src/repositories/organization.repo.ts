import { eq } from "drizzle-orm";

import { BaseRepository } from "./base.repo";
import { db } from "../db/index";
import {
  organizationExperience,
  orgExpDetails,
} from "../db/schema/organization.db";
import type { OrganizationDetailInsert } from "../db/schema/organization.db";

export class OrganizationRepository extends BaseRepository<
  typeof organizationExperience
> {
  constructor() {
    super(organizationExperience, "id");
  }
  async getDetailById(organizationExperienceId: number) {
    const rows = await db
      .select()
      .from(orgExpDetails)
      .where(eq(orgExpDetails.id, organizationExperienceId));
    return rows[0];
  }
  async addDetails(
    organizationExperienceId: number,
    newOrganizationDetail: OrganizationDetailInsert,
  ) {
    const insertedDetail = await db
      .insert(orgExpDetails)
      .values({ ...newOrganizationDetail, organizationExperienceId })
      .$returningId();
    return this.getById(insertedDetail[0].id);
  }

  async updateDetails(
    detailId: number,
    newDetail: Partial<OrganizationDetailInsert>,
  ) {
    await db
      .update(orgExpDetails)
      .set(newDetail)
      .where(eq(orgExpDetails.id, detailId));
    return this.getDetailById(detailId);
  }
  async deleteProjectWithDetails(id: number) {
    await db
      .delete(orgExpDetails)
      .where(eq(orgExpDetails.organizationExperienceId, id));
    await db
      .delete(organizationExperience)
      .where(eq(organizationExperience.id, id));
  }
}
