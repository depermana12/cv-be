import { and, asc, desc, eq, like, sql } from "drizzle-orm";

import { CvChildRepository } from "./cvChild.repo";
import type {
  OrganizationInsert,
  OrganizationSelect,
  OrganizationUpdate,
  OrganizationDescInsert,
  OrganizationDescSelect,
  OrganizationResponse,
  OrganizationQueryOptions,
  OrganizationDescUpdate,
} from "../db/types/organization.type";
import { organizationDesc, organizations } from "../db/schema/organization.db";
import type { Database } from "../db/index";

export class OrganizationRepository extends CvChildRepository<
  typeof organizations,
  OrganizationInsert,
  OrganizationSelect,
  OrganizationUpdate
> {
  constructor(db: Database) {
    super(organizations, db);
  }

  async getOrganization(id: number): Promise<OrganizationResponse | null> {
    const result = await this.db.query.organizations.findFirst({
      where: eq(organizations.id, id),
      with: {
        descriptions: true,
      },
    });
    return result ?? null;
  }

  async getAllOrganizations(
    cvId: number,
    options?: OrganizationQueryOptions,
  ): Promise<OrganizationResponse[]> {
    const whereClause = [eq(organizations.cvId, cvId)];

    if (options?.search) {
      whereClause.push(
        like(
          sql`lower(${organizations.organization})`,
          `%${options.search.toLowerCase()}%`,
        ),
      );
    }

    return this.db.query.organizations.findMany({
      where: and(...whereClause),
      with: {
        descriptions: true,
      },
      orderBy: options?.sortBy
        ? [
            options.sortOrder === "asc"
              ? asc(organizations[options.sortBy])
              : desc(organizations[options.sortBy]),
          ]
        : [],
    });
  }

  async createOrganization(
    organizationData: OrganizationInsert,
    descriptions: Omit<OrganizationDescInsert, "organizationId">[],
  ): Promise<{ id: number }> {
    return this.db.transaction(async (tx) => {
      const [organization] = await tx
        .insert(organizations)
        .values(organizationData)
        .$returningId();

      if (descriptions.length > 0) {
        await tx.insert(organizationDesc).values(
          descriptions.map((desc) => ({
            ...desc,
            organizationId: organization.id,
          })),
        );
      }
      return { id: organization.id };
    });
  }

  async updateOrganization(
    organizationId: number,
    organizationData: OrganizationUpdate,
    descriptions?: Omit<OrganizationDescInsert, "organizationId">[],
  ): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      // Update main organization only if there's actual data
      if (Object.keys(organizationData).length > 0) {
        const [result] = await tx
          .update(organizations)
          .set(organizationData)
          .where(eq(organizations.id, organizationId));

        if (result.affectedRows === 0) return false;
      }

      // Replace descriptions if provided
      if (descriptions !== undefined) {
        await tx
          .delete(organizationDesc)
          .where(eq(organizationDesc.organizationId, organizationId));

        if (descriptions.length > 0) {
          await tx
            .insert(organizationDesc)
            .values(descriptions.map((desc) => ({ ...desc, organizationId })));
        }
      }

      return true;
    });
  }

  async deleteOrganization(id: number): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      await tx
        .delete(organizationDesc)
        .where(eq(organizationDesc.organizationId, id));
      const [result] = await tx
        .delete(organizations)
        .where(eq(organizations.id, id));

      return result.affectedRows > 0;
    });
  }

  async addDescription(
    organizationId: number,
    description: Omit<OrganizationDescInsert, "organizationId">,
  ): Promise<{ id: number }> {
    const [desc] = await this.db
      .insert(organizationDesc)
      .values({ ...description, organizationId })
      .$returningId();

    return { id: desc.id };
  }

  async getAllDescriptions(
    organizationId: number,
  ): Promise<OrganizationDescSelect[]> {
    return this.db
      .select()
      .from(organizationDesc)
      .where(eq(organizationDesc.organizationId, organizationId));
  }

  async getDescription(descId: number): Promise<OrganizationDescSelect | null> {
    const [result] = await this.db
      .select()
      .from(organizationDesc)
      .where(eq(organizationDesc.id, descId));

    return result ?? null;
  }

  async updateDescription(
    descId: number,
    newDescription: OrganizationDescUpdate,
  ): Promise<boolean> {
    const [result] = await this.db
      .update(organizationDesc)
      .set(newDescription)
      .where(eq(organizationDesc.id, descId));

    return result.affectedRows > 0;
  }

  async deleteDescription(descId: number): Promise<boolean> {
    const [result] = await this.db
      .delete(organizationDesc)
      .where(eq(organizationDesc.id, descId));

    return result.affectedRows > 0;
  }
}
