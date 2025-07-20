import { CvChildService } from "../cvChild.service";
import type {
  OrganizationInsert,
  OrganizationSelect,
} from "../../db/types/organization.type";
import { OrganizationRepository } from "../../repositories/cvChildren/organization.repo";

export class OrganizationService extends CvChildService<
  OrganizationSelect,
  OrganizationInsert
> {
  constructor(private readonly organizationRepository: OrganizationRepository) {
    super(organizationRepository);
  }
}
