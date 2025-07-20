import { CvChildRepository } from "../cvChild.repo";
import { projects } from "../../db/schema/project.db";
import type { ProjectInsert, ProjectSelect } from "../../db/types/project.type";
import type { Database } from "../../db/index";

export class ProjectRepository extends CvChildRepository<
  typeof projects,
  ProjectInsert,
  ProjectSelect,
  "id"
> {
  constructor(db: Database) {
    super(projects, db, "id");
  }
}
