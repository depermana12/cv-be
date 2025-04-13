import { eq } from "drizzle-orm";

import { db } from "../db/index";
import {
  organizationExperience,
  orgExpDetails,
} from "../db/schema/organization";
import type {
  OrganizationInsert,
  OrganizationDetailInsert,
} from "../db/index.types";

export class Organization {
  async getAll() {
    try {
      return await db.select().from(organizationExperience);
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async getById(organizationId: number) {
    try {
      const rows = await db
        .select()
        .from(organizationExperience)
        .where(eq(organizationExperience.id, organizationId));
      return rows[0];
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async create(orgExp: OrganizationInsert) {
    try {
      const insertedOrgExp = await db
        .insert(organizationExperience)
        .values(orgExp)
        .$returningId();
      return this.getById(insertedOrgExp[0].id);
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async update(organizationId: number, newOrgExp: Partial<OrganizationInsert>) {
    try {
      await db
        .update(organizationExperience)
        .set(newOrgExp)
        .where(eq(organizationExperience.id, organizationId));
      return this.getById(organizationId);
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async getDetailById(detailId: number) {
    try {
      const rows = await db
        .select()
        .from(orgExpDetails)
        .where(eq(orgExpDetails.id, detailId));
      return rows[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async addDetail(orgExpId: number, newOrgExp: OrganizationDetailInsert) {
    try {
      const insertedDetail = await db
        .insert(orgExpDetails)
        .values({ ...newOrgExp, organizationExperienceId: orgExpId })
        .$returningId();
      return this.getDetailById(insertedDetail[0].id);
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async updateDetails(
    detailId: number,
    newDetailExp: Partial<OrganizationDetailInsert>,
  ) {
    try {
      await db
        .update(orgExpDetails)
        .set(newDetailExp)
        .where(eq(orgExpDetails.id, detailId));
      return this.getDetailById(detailId);
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async delete(id: number) {
    try {
      await db.delete(orgExpDetails).where(eq(orgExpDetails.id, id));
      await db
        .delete(organizationExperience)
        .where(eq(organizationExperience.id, id));
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
}
