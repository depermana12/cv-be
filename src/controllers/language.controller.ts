import { zValidator } from "../utils/validator";
import {
  languageInsertSchema,
  languageUpdateSchema,
  languageQueryOptionsSchema,
} from "../schemas/language.schema";
import { languageService } from "../lib/container";
import { createHonoBindings } from "../lib/create-hono";

export const languageRoutes = createHonoBindings()
  .get(
    "/:cvId/languages",
    zValidator("query", languageQueryOptionsSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const options = c.req.valid("query");

      const languages = await languageService.getAllLanguages(cvId, options);

      return c.json({
        success: true,
        message: `retrieved ${languages.length} language records successfully`,
        data: languages,
      });
    },
  )
  .get("/:cvId/languages/:languageId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const languageId = Number(c.req.param("languageId"));

    const language = await languageService.getLanguage(cvId, languageId);

    return c.json({
      success: true,
      message: `language record ${languageId} retrieved successfully`,
      data: language,
    });
  })
  .post(
    "/:cvId/languages",
    zValidator("json", languageInsertSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const languageData = c.req.valid("json");

      const newLanguage = await languageService.createLanguage(
        cvId,
        languageData,
      );

      return c.json(
        {
          success: true,
          message: `language record created with ID: ${newLanguage.id}`,
          data: newLanguage,
        },
        201,
      );
    },
  )
  .patch(
    "/:cvId/languages/:languageId",
    zValidator("json", languageUpdateSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const languageId = Number(c.req.param("languageId"));
      const updateData = c.req.valid("json");

      const updatedLanguage = await languageService.updateLanguage(
        cvId,
        languageId,
        updateData,
      );

      return c.json({
        success: true,
        message: `language record ${languageId} updated successfully`,
        data: updatedLanguage,
      });
    },
  )
  .delete("/:cvId/languages/:languageId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const languageId = Number(c.req.param("languageId"));

    await languageService.deleteLanguage(cvId, languageId);

    return c.json({
      success: true,
      message: `language record ${languageId} deleted successfully`,
    });
  });
