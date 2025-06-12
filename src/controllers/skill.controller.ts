import { zValidator } from "../utils/validator";
import { SkillService } from "../services/skill.service";
import {
  skillInsertSchema,
  skillUpdateSchema,
  skillQueryOptionsSchema,
} from "../schemas/skill.schema";
import { SkillRepository } from "../repositories/skill.repo";
import { createHonoBindings } from "../lib/create-hono";

const skillRepository = new SkillRepository();
const skillService = new SkillService(skillRepository);

export const skillRoutes = createHonoBindings()
  .get("/:cvId/skills/categories", async (c) => {
    const cvId = Number(c.req.param("cvId"));

    const categories = await skillService.getUniqueCategories(cvId);

    return c.json({
      success: true,
      message: `retrieved ${categories.length} skill categories for CV ${cvId}`,
      data: categories,
    });
  })
  .get(
    "/:cvId/skills",
    zValidator("query", skillQueryOptionsSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const options = c.req.valid("query");

      const skills = await skillService.getAllSkills(cvId, options);

      return c.json({
        success: true,
        message: `retrieved ${skills.length} skill records successfully`,
        data: skills,
      });
    },
  )
  .get("/:cvId/skills/:skillId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const skillId = Number(c.req.param("skillId"));

    const skill = await skillService.getSkill(cvId, skillId);

    return c.json({
      success: true,
      message: `skill record ${skillId} retrieved successfully`,
      data: skill,
    });
  })
  .post("/:cvId/skills", zValidator("json", skillInsertSchema), async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const skillData = c.req.valid("json");

    const newSkill = await skillService.createSkill(cvId, skillData);

    return c.json(
      {
        success: true,
        message: `skill record created with ID: ${newSkill.id}`,
        data: newSkill,
      },
      201,
    );
  })
  .patch(
    "/:cvId/skills/:skillId",
    zValidator("json", skillUpdateSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const skillId = Number(c.req.param("skillId"));
      const updateData = c.req.valid("json");

      const updatedSkill = await skillService.updateSkill(
        cvId,
        skillId,
        updateData,
      );

      return c.json({
        success: true,
        message: `skill record ${skillId} updated successfully`,
        data: updatedSkill,
      });
    },
  )
  .delete("/:cvId/skills/:skillId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const skillId = Number(c.req.param("skillId"));

    await skillService.deleteSkill(cvId, skillId);

    return c.json({
      success: true,
      message: `skill record ${skillId} deleted successfully`,
    });
  });
