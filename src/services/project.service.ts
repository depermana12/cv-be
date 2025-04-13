import { eq } from "drizzle-orm";

import { db } from "../db/index";
import { projects, projectDetails } from "../db/schema/project";
import type { ProjectInsert, ProjectDetailsInsert } from "../db/index.types";

export class Project {
  async getAll() {
    try {
      return await db.select().from(projects);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async getById(projectId: number) {
    try {
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId));
      return project[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async create(project: ProjectInsert) {
    try {
      const insertedProject = await db
        .insert(projects)
        .values(project)
        .$returningId();
      return this.getById(insertedProject[0].id);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async update(projectId: number, newProjectData: Partial<ProjectInsert>) {
    try {
      await db
        .update(projects)
        .set(newProjectData)
        .where(eq(projects.id, projectId));
      return this.getById(projectId);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async getDetailById(detailId: number) {
    try {
      const rows = await db
        .select()
        .from(projectDetails)
        .where(eq(projectDetails.id, detailId));
      return rows[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async addDetails(projectId: number, newProjectDetail: ProjectDetailsInsert) {
    try {
      const insertedDetail = await db
        .insert(projectDetails)
        .values({ ...newProjectDetail, projectId })
        .$returningId();
      return this.getDetailById(insertedDetail[0].id);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async updateDetails(
    detailId: number,
    newDetail: Partial<ProjectDetailsInsert>,
  ) {
    try {
      await db
        .update(projectDetails)
        .set(newDetail)
        .where(eq(projectDetails.id, detailId));
      return this.getDetailById(detailId);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async delete(id: number) {
    try {
      await db.delete(projectDetails).where(eq(projectDetails.id, id));
      await db.delete(projects).where(eq(projects.id, id));
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
}
