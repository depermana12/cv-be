import { zValidator } from "../utils/validator";
import {
  projectInsertSchema,
  projectUpdateSchema,
  projectDescInsertSchema,
  projectTechInsertSchema,
  projectQueryOptionsSchema,
} from "../schemas/project.schema";
import { projectService } from "../lib/container";
import { createHonoBindings } from "../lib/create-hono";

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
        updateData,
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
  .get("/:cvId/projects/:projectId/descriptions", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const projectId = Number(c.req.param("projectId"));

    const descriptions = await projectService.getDescriptions(cvId, projectId);

    return c.json({
      success: true,
      message: `retrieved ${descriptions.length} description records`,
      data: descriptions,
    });
  })
  .get("/:cvId/projects/descriptions/:descriptionId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const descriptionId = Number(c.req.param("descriptionId"));

    const description = await projectService.getDescription(
      cvId,
      descriptionId,
    );

    return c.json({
      success: true,
      message: `description ${descriptionId} retrieved successfully`,
      data: description,
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
  )
  .patch(
    "/:cvId/projects/:projectId/descriptions/:descriptionId",
    zValidator("json", projectDescInsertSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const projectId = Number(c.req.param("projectId"));
      const descriptionId = Number(c.req.param("descriptionId"));
      const updateData = c.req.valid("json");

      const updatedDescription = await projectService.updateDescription(
        cvId,
        descriptionId,
        updateData,
      );

      return c.json({
        success: true,
        message: `description ${descriptionId} updated successfully`,
        data: updatedDescription,
      });
    },
  )

  .delete(
    "/:cvId/projects/:projectId/descriptions/:descriptionId",
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const projectId = Number(c.req.param("projectId"));
      const descriptionId = Number(c.req.param("descriptionId"));

      await projectService.deleteDescription(cvId, descriptionId);

      return c.json({
        success: true,
        message: `description ${descriptionId} deleted successfully`,
      });
    },
  );
