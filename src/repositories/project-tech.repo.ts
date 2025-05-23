import { eq } from "drizzle-orm";

import { CvChildRepository } from "./cvChild.repo";
import { projectTechnologies } from "../db/schema/project.db";
import type {
  ProjectTechStackInsert,
  ProjectTechStackSelect,
  ProjectTechStackUpdate,
} from "../db/types/project.type";
import { getDb } from "../db";

const db = await getDb();
export class ProjectTechStack extends CvChildRepository<
  typeof projectTechnologies,
  ProjectTechStackInsert,
  ProjectTechStackSelect,
  ProjectTechStackUpdate
> {
  constructor() {
    super(projectTechnologies, db);
  }

  async getByProjectId(projectId: number) {
    const rows = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.projectId, projectId));
    return rows[0] ?? null;
  }

  async getByProjectIdGrouped() {
    const techs = await this.getAll();

    const grouped = techs.reduce((acc: Record<string, string[]>, tech) => {
      const key = tech.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(tech.technology);
      return acc;
    }, {});

    return grouped;
  }

  async addTech(
    projectId: number,
    tech: Omit<ProjectTechStackInsert, "projectId">,
  ) {
    // Ensure all required fields are present
    const { category, technology } = tech;
    const inserted = await this.db
      .insert(this.table)
      .values({ category, technology, projectId })
      .$returningId();

    return this.getById(inserted[0].id);
  }

  async updateTech(id: number, tech: Omit<ProjectTechStackUpdate, "id">) {
    const { category, technology } = tech;
    await this.db
      .update(this.table)
      .set({ category, technology })
      .where(eq(this.table.id, id));
    return this.getById(id);
  }
}
