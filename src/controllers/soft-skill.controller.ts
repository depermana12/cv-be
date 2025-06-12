import { zValidator } from "../utils/validator";
import { SoftSkillService } from "../services/soft-skill.service";
import {
  softSkillInsertSchema,
  softSkillUpdateSchema,
  softSkillQueryOptionsSchema,
} from "../schemas/soft-skill.schema";
import { SoftSkillRepository } from "../repositories/soft-skill.repo";
import { createHonoBindings } from "../lib/create-hono";

const softSkillRepository = new SoftSkillRepository();
const softSkillService = new SoftSkillService(softSkillRepository);

export const softSkillRoutes = createHonoBindings()
  .get(
    "/:cvId/soft-skills",
    zValidator("query", softSkillQueryOptionsSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const options = c.req.valid("query");

      const softSkills = await softSkillService.getAllSoftSkills(cvId, options);

      return c.json({
        success: true,
        message: `retrieved ${softSkills.length} soft skill records successfully`,
        data: softSkills,
      });
    },
  )
  .get("/:cvId/soft-skills/:softSkillId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const softSkillId = Number(c.req.param("softSkillId"));

    const softSkill = await softSkillService.getSoftSkill(cvId, softSkillId);

    return c.json({
      success: true,
      message: `soft skill record ${softSkillId} retrieved successfully`,
      data: softSkill,
    });
  })
  .post(
    "/:cvId/soft-skills",
    zValidator("json", softSkillInsertSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const softSkillData = c.req.valid("json");

      const newSoftSkill = await softSkillService.createSoftSkill(
        cvId,
        softSkillData,
      );

      return c.json(
        {
          success: true,
          message: `soft skill record created with ID: ${newSoftSkill.id}`,
          data: newSoftSkill,
        },
        201,
      );
    },
  )
  .patch(
    "/:cvId/soft-skills/:softSkillId",
    zValidator("json", softSkillUpdateSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const softSkillId = Number(c.req.param("softSkillId"));
      const updateData = c.req.valid("json");

      const updatedSoftSkill = await softSkillService.updateSoftSkill(
        cvId,
        softSkillId,
        updateData,
      );

      return c.json({
        success: true,
        message: `soft skill record ${softSkillId} updated successfully`,
        data: updatedSoftSkill,
      });
    },
  )
  .delete("/:cvId/soft-skills/:softSkillId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const softSkillId = Number(c.req.param("softSkillId"));

    await softSkillService.deleteSoftSkill(cvId, softSkillId);

    return c.json({
      success: true,
      message: `soft skill record ${softSkillId} deleted successfully`,
    });
  });
