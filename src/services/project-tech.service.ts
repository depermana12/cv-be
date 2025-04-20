import { BaseCrudService } from "./base.service";
import { projectTechStackRepository } from "./instance.repo";
import type {
  ProjectTechStackInsert,
  ProjectTechStackSelect,
} from "../db/schema/project.db";
import { NotFoundError } from "../errors/not-found.error";

export class ProjectTechStackService extends BaseCrudService<
  ProjectTechStackSelect,
  ProjectTechStackInsert
> {
  constructor(private readonly repo = projectTechStackRepository) {
    super(repo);
  }

  async getByProjectId(projectId: number) {
    const record = await this.repo.getByProjectId(projectId);
    if (!record) {
      throw new NotFoundError(`cannot get: detail ${projectId} not found`);
    }
    return record;
  }

  async getByProjectIdGrouped() {
    return this.repo.getByProjectIdGrouped();
  }

  async addTech(
    projectId: number,
    tech: Omit<ProjectTechStackInsert, "projectId">,
  ) {
    return this.repo.addTech(projectId, tech);
  }
}
