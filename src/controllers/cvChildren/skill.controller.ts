import { createHonoBindings } from "../../lib/create-hono";
import { zValidator } from "../../utils/validator";
import { skillService } from "../../lib/container";
import {
  createSkillSchema,
  updateSkillSchema,
  cvIdParamsSchema,
  skillParamsSchema,
} from "../../schemas/skill.schema";

export const skillRoutes = createHonoBindings()
  .get("/:cvId/skills", zValidator("param", cvIdParamsSchema), async (c) => {
    const { cvId } = c.req.valid("param");

    const skills = await skillService.getAll(cvId);

    return c.json({
      success: true,
      message: "Skills retrieved successfully",
      data: skills,
    });
  })
  .get(
    "/:cvId/skills/:skillId",
    zValidator("param", skillParamsSchema),
    async (c) => {
      const { cvId, skillId } = c.req.valid("param");

      const skill = await skillService.getOne(cvId, skillId);

      return c.json({
        success: true,
        message: "Skill retrieved successfully",
        data: skill,
      });
    },
  )
  .post(
    "/:cvId/skills",
    zValidator("param", cvIdParamsSchema),
    zValidator("json", createSkillSchema),
    async (c) => {
      const { cvId } = c.req.valid("param");
      const skillData = c.req.valid("json");

      const skill = await skillService.create(cvId, skillData);

      return c.json(
        {
          success: true,
          message: "Skill created successfully",
          data: skill,
        },
        201,
      );
    },
  )
  .patch(
    "/:cvId/skills/:skillId",
    zValidator("param", skillParamsSchema),
    zValidator("json", updateSkillSchema),
    async (c) => {
      const { cvId, skillId } = c.req.valid("param");
      const updateData = c.req.valid("json");

      const skill = await skillService.update(cvId, skillId, updateData);

      return c.json({
        success: true,
        message: "Skill updated successfully",
        data: skill,
      });
    },
  )
  .delete(
    "/:cvId/skills/:skillId",
    zValidator("param", skillParamsSchema),
    async (c) => {
      const { cvId, skillId } = c.req.valid("param");

      const deleted = await skillService.delete(cvId, skillId);

      return c.json({
        success: true,
        message: "Skill deleted successfully",
        data: deleted,
      });
    },
  );
