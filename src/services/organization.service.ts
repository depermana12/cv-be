import { BaseCrudService } from "./base.service";
import { organizationRepository } from "./instance.repo";
import { organizationExperience } from "../db/schema/organization.db";

import type { OrganizationDetailInsert } from "../db/index.types";

export class Organization extends BaseCrudService<
  typeof organizationExperience
> {
  constructor() {
    super(organizationRepository, "id");
  }

  async getDetailById(detailId: number) {
    return organizationRepository.getDetailById(detailId);
  }

  async addDetail(orgExpId: number, newOrgExp: OrganizationDetailInsert) {
    return organizationRepository.addDetails(orgExpId, newOrgExp);
  }

  async updateDetails(
    detailId: number,
    newDetailExp: Partial<OrganizationDetailInsert>,
  ) {
    return organizationRepository.updateDetails(detailId, newDetailExp);
  }

  override async delete(id: number) {
    return organizationRepository.deleteProjectWithDetails(id);
  }
}
