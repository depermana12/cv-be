import { BaseCrudService } from "./base.service";
import { organizationRepository } from "./instance.repo";

import type {
  OrganizationDescInsert,
  OrganizationInsert,
  OrganizationSelect,
} from "../db/types/organization.type";
import { NotFoundError } from "../errors/not-found.error";

export class OrganizationService extends BaseCrudService<
  OrganizationSelect,
  OrganizationInsert
> {
  constructor(private readonly repo = organizationRepository) {
    super(repo);
  }

  async getDetailById(detailId: number) {
    const record = await this.repo.getDescription(detailId);
    if (!record) {
      throw new NotFoundError(`cannot get: detail ${detailId} not found`);
    }
    return record;
  }

  async addDetail(
    organizationId: number,
    newOrganization: OrganizationDescInsert,
  ) {
    const record = await this.repo.addDescription(
      organizationId,
      newOrganization,
    );
    if (!record) {
      throw new Error("failed to create the record.");
    }
    return record;
  }

  async updateDetails(
    detailId: number,
    newDetailExp: Partial<OrganizationDescInsert>,
  ) {
    const exists = await this.repo.getDescription(detailId);
    if (!exists) {
      throw new NotFoundError(`cannot update: detail ${detailId} not found`);
    }
    return this.repo.updateDescription(detailId, newDetailExp);
  }

  override async delete(id: number) {
    const exists = await this.getDetailById(id);
    if (!exists) {
      throw new NotFoundError(`cannot delete: detail ${id} not found`);
    }
    return this.repo.deleteProjectCascade(id);
  }
}
