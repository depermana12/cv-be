import { eq } from "drizzle-orm";

import { db } from "../db/index";
import { projectTechnologies } from "../db/schema/project.db";
import type { ProjectTechStackInsert } from "../db/index.types";

export class ProjectTech {
  async getAll() {
    try {
      return await db.select().from(projectTechnologies);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async getById(projectId: number) {
    try {
      const rows = await db
        .select()
        .from(projectTechnologies)
        .where(eq(projectTechnologies.projectId, projectId));
      return rows[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
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
    try {
      const insertedTech = await db
        .insert(projectTechnologies)
        .values({ ...tech, projectId })
        .$returningId();
      return this.getById(insertedTech[0].id);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async update(
    projectId: number,
    newProjectTech: Partial<ProjectTechStackInsert>,
  ) {
    try {
      await db
        .update(projectTechnologies)
        .set(newProjectTech)
        .where(eq(projectTechnologies.id, projectId));
      return this.getById(projectId);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async delete(id: number) {
    try {
      await db
        .delete(projectTechnologies)
        .where(eq(projectTechnologies.id, id));
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
}
