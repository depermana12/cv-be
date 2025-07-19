import { CvChildService } from "./cvChild.service";
import type {
  OrganizationInsert,
  OrganizationSelect,
  OrganizationUpdate,
} from "../db/types/organization.type";
import { OrganizationRepository } from "../repositories/organization.repo";

export interface IOrganizationService {
  updateOrganization(
    cvId: number,
    organizationId: number,
    updateData: OrganizationUpdate,
  ): Promise<OrganizationSelect>;
}

export class OrganizationService
  extends CvChildService<OrganizationSelect, OrganizationInsert>
  implements IOrganizationService
{
  constructor(private readonly organizationRepository: OrganizationRepository) {
    super(organizationRepository);
  }

  // Custom method: specific updateData type (removes cvId from updateData)
  async updateOrganization(
    cvId: number,
    organizationId: number,
    updateData: OrganizationUpdate,
  ) {
    return this.updateInCv(cvId, organizationId, updateData);
  }
}
