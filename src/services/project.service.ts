import { BaseCrudService } from "./base.service";
import { projectRepository } from "./instance.repo";
import { projects } from "../db/schema/project.db";
import type { ProjectDetailsInsert } from "../db/index.types";

export class Project extends BaseCrudService<typeof projects> {
  constructor() {
    super(projectRepository, "id");
  }

  async getDetailById(detailId: number) {
    return projectRepository.getDetailById(detailId);
  }

  async addDetails(projectId: number, newProjectDetail: ProjectDetailsInsert) {
    return projectRepository.addDetails(projectId, newProjectDetail);
  }

  async updateDetails(
    detailId: number,
    newDetail: Partial<ProjectDetailsInsert>,
  ) {
    return await projectRepository.updateDetails(detailId, newDetail);
  }

  override async delete(id: number) {
    return projectRepository.deleteProjectWithDetails(id);
  }
}
