import { zValidator } from "../utils/validator";
import {
  socialMediaInsertSchema,
  socialMediaUpdateSchema,
  socialMediaQueryOptionsSchema,
} from "../schemas/socialMedia.schema";
import { socialMediaService } from "../lib/container";
import { createHonoBindings } from "../lib/create-hono";

export const socialRoutes = createHonoBindings()
  .get(
    "/:cvId/social-medias",
    zValidator("query", socialMediaQueryOptionsSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const options = c.req.valid("query");

      const socialMedia = await socialMediaService.getAllSocialMedia(
        cvId,
        options,
      );

      return c.json({
        success: true,
        message: `retrieved ${socialMedia.length} social media records successfully`,
        data: socialMedia,
      });
    },
  )
  .get("/:cvId/social-medias/:socialId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const socialId = Number(c.req.param("socialId"));

    const socialMedia = await socialMediaService.getSocialMedia(cvId, socialId);

    return c.json({
      success: true,
      message: `social media record ${socialId} retrieved successfully`,
      data: socialMedia,
    });
  })
  .post(
    "/:cvId/social-medias",
    zValidator("json", socialMediaInsertSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const socialData = c.req.valid("json");

      const newSocialMedia = await socialMediaService.createSocialMedia(
        cvId,
        socialData,
      );

      return c.json(
        {
          success: true,
          message: `social media record created with ID: ${newSocialMedia.id}`,
          data: newSocialMedia,
        },
        201,
      );
    },
  )
  .patch(
    "/:cvId/social-medias/:socialId",
    zValidator("json", socialMediaUpdateSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const socialId = Number(c.req.param("socialId"));
      const updateData = c.req.valid("json");

      const updatedSocialMedia = await socialMediaService.updateSocialMedia(
        cvId,
        socialId,
        updateData,
      );

      return c.json({
        success: true,
        message: `social media record ${socialId} updated successfully`,
        data: updatedSocialMedia,
      });
    },
  )
  .delete("/:cvId/social-medias/:socialId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const socialId = Number(c.req.param("socialId"));

    await socialMediaService.deleteSocialMedia(cvId, socialId);

    return c.json({
      success: true,
      message: `social media record ${socialId} deleted successfully`,
    });
  });
