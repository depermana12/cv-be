import { zValidator } from "../utils/validator";
import {
  profileInsertSchema,
  profileUpdateSchema,
  profileQueryOptionsSchema,
} from "../schemas/profile.schema";
import { profileService } from "../lib/container";
import { createHonoBindings } from "../lib/create-hono";

export const profileRoutes = createHonoBindings()
  .get(
    "/:cvId/profiles",
    zValidator("query", profileQueryOptionsSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const options = c.req.valid("query");

      const profiles = await profileService.getAllProfiles(cvId, options);

      return c.json({
        success: true,
        message: `retrieved ${profiles.length} profile records successfully`,
        data: profiles,
      });
    },
  )
  .get("/:cvId/profiles/:profileId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const profileId = Number(c.req.param("profileId"));

    const profile = await profileService.getProfile(cvId, profileId);

    return c.json({
      success: true,
      message: `profile record ${profileId} retrieved successfully`,
      data: profile,
    });
  })
  .post(
    "/:cvId/profiles",
    zValidator("json", profileInsertSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const profileData = c.req.valid("json");

      const newProfile = await profileService.createProfile(cvId, profileData);

      return c.json(
        {
          success: true,
          message: `profile record created with ID: ${newProfile.id}`,
          data: newProfile,
        },
        201,
      );
    },
  )
  .patch(
    "/:cvId/profiles/:profileId",
    zValidator("json", profileUpdateSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const profileId = Number(c.req.param("profileId"));
      const updateData = c.req.valid("json");

      const updatedProfile = await profileService.updateProfile(
        cvId,
        profileId,
        updateData,
      );

      return c.json({
        success: true,
        message: `profile record ${profileId} updated successfully`,
        data: updatedProfile,
      });
    },
  )
  .delete("/:cvId/profiles/:profileId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const profileId = Number(c.req.param("profileId"));

    await profileService.deleteProfile(cvId, profileId);

    return c.json({
      success: true,
      message: `profile record ${profileId} deleted successfully`,
    });
  });
