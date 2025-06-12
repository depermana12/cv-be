import { zValidator } from "../utils/validator";
import { ProjectService } from "../services/project.service";
import { ProjectTechService } from "../services/project-tech.service";
import {
  projectInsertSchema,
  projectUpdateSchema,
  projectDescInsertSchema,
  projectTechInsertSchema,
  projectQueryOptionsSchema,
} from "../schemas/project.schema";
import { ProjectRepository } from "../repositories/project.repo";
import { ProjectTechRepository } from "../repositories/project-tech.repo";
import { createHonoBindings } from "../lib/create-hono";

const projectRepository = new ProjectRepository();
const projectTechRepository = new ProjectTechRepository();
const projectTechService = new ProjectTechService(projectTechRepository);
const projectService = new ProjectService(
  projectRepository,
  projectTechService,
);

export const projectRoutes = createHonoBindings()
  .get(
    "/:cvId/projects",
    zValidator("query", projectQueryOptionsSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const options = c.req.valid("query");

      const projects = await projectService.getAllProjects(cvId, options);

      return c.json({
        success: true,
        message: `retrieved ${projects.length} project records successfully`,
        data: projects,
      });
    },
  )
  .get("/:cvId/projects/:projectId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const projectId = Number(c.req.param("projectId"));

    const project = await projectService.getProject(cvId, projectId);

    return c.json({
      success: true,
      message: `project ${projectId} retrieved successfully`,
      data: project,
    });
  })
  .post(
    "/:cvId/projects",
    zValidator("json", projectInsertSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const projectData = c.req.valid("json");

      const newProject = await projectService.createProject(cvId, projectData);

      return c.json(
        {
          success: true,
          message: `project created with ID: ${newProject.id}`,
          data: newProject,
        },
        201,
      );
    },
  )
  .patch(
    "/:cvId/projects/:projectId",
    zValidator("json", projectUpdateSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const projectId = Number(c.req.param("projectId"));
      const updateData = c.req.valid("json");

      const updatedProject = await projectService.updateProject(
        cvId,
        projectId,
        updateData, //error here
      );

      return c.json({
        success: true,
        message: `project ${projectId} updated successfully`,
        data: updatedProject,
      });
    },
  )
  .delete("/:cvId/projects/:projectId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const projectId = Number(c.req.param("projectId"));

    await projectService.deleteProject(cvId, projectId);

    return c.json({
      success: true,
      message: `project ${projectId} deleted successfully`,
    });
  })
  .post(
    "/:cvId/projects/:projectId/descriptions",
    zValidator("json", projectDescInsertSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const projectId = Number(c.req.param("projectId"));
      const descriptionData = c.req.valid("json");

      const result = await projectService.addDescription(
        cvId,
        projectId,
        descriptionData,
      );

      return c.json(
        {
          success: true,
          message: `description added to project ${projectId}`,
          data: result,
        },
        201,
      );
    },
  )
  .post(
    "/:cvId/projects/:projectId/technologies",
    zValidator("json", projectTechInsertSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const projectId = Number(c.req.param("projectId"));
      const technologyData = c.req.valid("json");

      const result = await projectService.addTechnology(
        cvId,
        projectId,
        technologyData,
      );

      return c.json(
        {
          success: true,
          message: `technology added to project ${projectId}`,
          data: result,
        },
        201,
      );
    },
  );
