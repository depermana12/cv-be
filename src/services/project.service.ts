import { BaseCrudService } from "./base.service";
import { projectRepository } from "./instance.repo";
import type {
  ProjectDescInsert,
  ProjectInsert,
  ProjectSelect,
} from "../db/schema/project.db";
import { NotFoundError } from "../errors/not-found.error";

export class ProjectService extends BaseCrudService<
  ProjectSelect,
  ProjectInsert
> {
  constructor(private readonly repo = projectRepository) {
    super(repo);
  }

  async getDescription(descId: number) {
    const record = await this.repo.getDescription(descId);
    if (!record) {
      throw new NotFoundError(`cannot get: detail ${descId} not found`);
    }
    return record;
  }

  async addDescription(projectId: number, description: ProjectDescInsert) {
    const record = await this.repo.addDescription(projectId, description);
    if (!record) {
      throw new Error("failed to create the record.");
    }
    return record;
  }

  async updateDescription(
    descId: number,
    newDescription: Partial<ProjectDescInsert>,
  ) {
    const exists = await this.repo.getDescription(descId);
    if (!exists) {
      throw new NotFoundError(`cannot update: detail ${descId} not found`);
    }
    return this.repo.updateDescription(descId, newDescription);
  }

  override async delete(id: number) {
    const exists = await this.repo.getDescription(id);
    if (!exists) {
      throw new NotFoundError(`cannot delete: detail ${id} not found`);
    }
    return this.repo.deleteProjectCascade(id);
  }
}
