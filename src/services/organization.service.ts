import { BaseCrudService } from "./base.service";
import { organizationRepository } from "./instance.repo";
import { organizationExperience } from "../db/schema/organization.db";

import type { OrganizationDetailInsert } from "../db/schema/organization.db";
import { NotFoundError } from "../errors/not-found.error";

export class Organization extends BaseCrudService<
  typeof organizationExperience
> {
  constructor() {
    super(organizationRepository, "id");
  }

  async getDetailById(detailId: number) {
    const record = await organizationRepository.getDetailById(detailId);
    if (!record) {
      throw new NotFoundError(
        `cannot get: detail ${this.primaryKey} ${detailId} not found`,
      );
    }
    return record;
  }

  async addDetail(orgExpId: number, newOrgExp: OrganizationDetailInsert) {
    const record = await organizationRepository.addDetails(orgExpId, newOrgExp);
    if (!record) {
      throw new Error("failed to create the record.");
    }
    return record;
  }

  async updateDetails(
    detailId: number,
    newDetailExp: Partial<OrganizationDetailInsert>,
  ) {
    const exists = await this.getDetailById(detailId);
    if (!exists) {
      throw new NotFoundError(
        `cannot update: detail ${this.primaryKey} ${detailId} not found`,
      );
    }
    return organizationRepository.updateDetails(detailId, newDetailExp);
  }

  override async delete(id: number) {
    const exists = await this.getDetailById(id);
    if (!exists) {
      throw new NotFoundError(
        `cannot delete: detail ${this.primaryKey} ${id} not found`,
      );
    }
    return organizationRepository.deleteProjectWithDetails(id);
  }
}
