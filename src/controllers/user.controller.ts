import { zValidator } from "../utils/validator";
import {
  updateUserSchema,
  updateUserCredentialsSchema,
  updateUserPreferencesSchema,
  updateUserSubscriptionSchema,
  deleteUserSchema,
} from "../schemas/user.schema";
import { userService } from "../lib/container";
import { createHonoBindings } from "../lib/create-hono";

export const userRoutes = createHonoBindings()
  .get("/me", async (c) => {
    const { id: userId } = c.get("jwtPayload");

    const me = await userService.getUserByIdSafe(+userId);

    return c.json(
      {
        success: true,
        message: "user profile retrieved",
        data: me,
      },
      200,
    );
  })
  .get("/me/stats", async (c) => {
    const { id: userId } = c.get("jwtPayload");

    const userStats = await userService.getUserStats(+userId);

    return c.json({
      success: true,
      message: "user statistics retrieved",
      data: userStats,
    });
  })
  .patch("/me", zValidator("json", updateUserSchema), async (c) => {
    const { id: userId } = c.get("jwtPayload");
    const validatedBody = c.req.valid("json");

    const updatedUser = await userService.updateUserProfile(
      +userId,
      validatedBody,
    );

    return c.json({
      success: true,
      message: "user profile updated successfully",
      data: updatedUser,
    });
  })
  .patch(
    "/me/credentials",
    zValidator("json", updateUserCredentialsSchema),
    async (c) => {
      const { id: userId } = c.get("jwtPayload");
      const validatedBody = c.req.valid("json");

      let updatedUser;

      if (validatedBody.username) {
        updatedUser = await userService.updateUserUsername(
          +userId,
          validatedBody.username,
        );
      }

      if (validatedBody.email) {
        updatedUser = await userService.updateUserEmail(
          +userId,
          validatedBody.email,
        );
      }

      if (!updatedUser) {
        updatedUser = await userService.getUserByIdSafe(+userId);
      }

      return c.json({
        success: true,
        message: "user credentials updated successfully",
        data: updatedUser,
      });
    },
  )
  .patch(
    "/me/preferences",
    zValidator("json", updateUserPreferencesSchema),
    async (c) => {
      const { id: userId } = c.get("jwtPayload");
      const validatedBody = c.req.valid("json");

      const updatedUser = await userService.updateUserPreferences(
        +userId,
        validatedBody,
      );

      return c.json({
        success: true,
        message: "user preferences updated successfully",
        data: updatedUser,
      });
    },
  )
  .patch(
    "/me/subscription",
    zValidator("json", updateUserSubscriptionSchema),
    async (c) => {
      const { id: userId } = c.get("jwtPayload");
      const validatedBody = c.req.valid("json");

      const updatedUser = await userService.updateUserSubscription(
        +userId,
        validatedBody,
      );

      return c.json({
        success: true,
        message: "user subscription updated successfully",
        data: updatedUser,
      });
    },
  )
  .get("/me/email-verification-status", async (c) => {
    const { id: userId } = c.get("jwtPayload");

    const verificationStatus = await userService.isUserEmailVerified(+userId);

    return c.json({
      success: true,
      message: "email verification status retrieved",
      data: verificationStatus,
    });
  })
  .delete("/me", zValidator("json", deleteUserSchema), async (c) => {
    const { id: userId } = c.get("jwtPayload");
    const { password } = c.req.valid("json");

    const deleted = await userService.deleteUser(+userId, password);

    return c.json({
      success: true,
      message: "user account deleted successfully",
      data: { deleted },
    });
  });
