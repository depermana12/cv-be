import { and, asc, desc, eq, like, sql } from "drizzle-orm";

import { CvChildRepository } from "./cvChild.repo";
import type {
  OrganizationInsert,
  OrganizationSelect,
  OrganizationUpdate,
  OrganizationQueryOptions,
} from "../db/types/organization.type";

export interface IOrganizationRepository {
  getOrganization(
    cvId: number,
    organizationId: number,
  ): Promise<OrganizationSelect | null>;
  getAllOrganizations(
    cvId: number,
    options?: OrganizationQueryOptions,
  ): Promise<OrganizationSelect[]>;
  createOrganization(
    cvId: number,
    organizationData: OrganizationInsert,
  ): Promise<OrganizationSelect>;
  updateOrganization(
    cvId: number,
    organizationId: number,
    organizationData: OrganizationUpdate,
  ): Promise<OrganizationSelect>;
  deleteOrganization(cvId: number, organizationId: number): Promise<boolean>;
}
import { organizations } from "../db/schema/organization.db";
import type { Database } from "../db/index";

export class OrganizationRepository
  extends CvChildRepository<
    typeof organizations,
    OrganizationInsert,
    OrganizationSelect,
    "id"
  >
  implements IOrganizationRepository
{
  constructor(db: Database) {
    super(organizations, db, "id");
  }

  async getOrganization(cvId: number, organizationId: number) {
    return this.getByIdInCv(cvId, organizationId);
  }

  async getAllOrganizations(cvId: number, options?: OrganizationQueryOptions) {
    const whereClause = [eq(organizations.cvId, cvId)];

    if (options?.search) {
      whereClause.push(
        like(
          sql`lower(${organizations.organization})`,
          `%${options.search.toLowerCase()}%`,
        ),
      );
    }

    return this.db
      .select()
      .from(organizations)
      .where(and(...whereClause))
      .orderBy(
        options?.sortBy
          ? options.sortOrder === "asc"
            ? asc(organizations[options.sortBy])
            : desc(organizations[options.sortBy])
          : desc(organizations.startDate),
      );
  }

  async createOrganization(cvId: number, organizationData: OrganizationInsert) {
    return this.createInCv(cvId, organizationData);
  }

  async updateOrganization(
    cvId: number,
    organizationId: number,
    organizationData: OrganizationUpdate,
  ) {
    return this.updateInCv(cvId, organizationId, organizationData);
  }

  async deleteOrganization(cvId: number, organizationId: number) {
    return this.deleteInCv(cvId, organizationId);
  }
}
