import type { ProjectInsert, ProjectSelect } from "../db/types/project.type";
import { CvChildService } from "./cvChild.service";
import { ProjectRepository } from "../repositories/project.repo";

export class ProjectService extends CvChildService<
  ProjectSelect,
  ProjectInsert
> {
  constructor(private readonly projectRepository: ProjectRepository) {
    super(projectRepository);
  }
}
