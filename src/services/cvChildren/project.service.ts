import { CvChildService } from "../cvChild.service";
import type { ProjectInsert, ProjectSelect } from "../../db/types/project.type";
import { ProjectRepository } from "../../repositories/cvChildren/project.repo";

export class ProjectService extends CvChildService<
  ProjectSelect,
  ProjectInsert
> {
  constructor(private readonly projectRepository: ProjectRepository) {
    super(projectRepository);
  }
}
