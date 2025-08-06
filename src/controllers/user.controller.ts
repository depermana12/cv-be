import { zValidator } from "../utils/validator";
import {
  updateUserSchema,
  updateUserCredentialsSchema,
  updateUserPreferencesSchema,
  updateUserSubscriptionSchema,
  deleteUserSchema,
  updateMonthlyGoalSchema,
} from "../schemas/user.schema";
import { userService } from "../lib/container";
import { createHonoBindings } from "../lib/create-hono";
import { verifiedEmail } from "../middlewares/verifiedEmail";

// Routes that don't require email verification (basic user info)
export const userBasicRoutes = createHonoBindings()
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
  .get("/me/email-verification-status", async (c) => {
    const { id: userId } = c.get("jwtPayload");

    const verificationStatus = await userService.isUserEmailVerified(+userId);

    return c.json({
      success: true,
      message: "email verification status retrieved",
      data: verificationStatus,
    });
  });

// Routes that require email verification
export const userRoutes = createHonoBindings()
  .use("/*", verifiedEmail)
  .get("/me/stats", async (c) => {
    const { id: userId } = c.get("jwtPayload");

    const userStats = await userService.getUserStats(+userId);

    return c.json({
      success: true,
      message: "user statistics retrieved",
      data: userStats,
    });
  })
  .get("/me/monthly-goal", async (c) => {
    const { id: userId } = c.get("jwtPayload");

    const monthlyGoal = await userService.getMonthlyGoal(+userId);

    return c.json({
      success: true,
      message: "Monthly goal retrieved successfully",
      data: monthlyGoal,
    });
  })
  .patch(
    "/me/monthly-goal",
    zValidator("json", updateMonthlyGoalSchema),
    async (c) => {
      const { id: userId } = c.get("jwtPayload");
      const { goal } = c.req.valid("json");

      const updatedGoal = await userService.updateMonthlyGoal(+userId, goal);

      return c.json({
        success: true,
        message: "Monthly goal updated successfully",
        data: updatedGoal,
      });
    },
  )
  .get("/me/profile-progress", async (c) => {
    const { id: userId } = c.get("jwtPayload");

    const profileProgress = await userService.getProfileProgress(+userId);

    return c.json({
      success: true,
      message: "Profile progress retrieved successfully",
      data: profileProgress,
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
  .delete("/me", zValidator("json", deleteUserSchema), async (c) => {
    const { id: userId } = c.get("jwtPayload");
    const { password } = c.req.valid("json");

    const deleted = await userService.deleteUser(+userId, password);

    c.header(
      "Set-Cookie",
      "refreshToken=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict",
    );

    return c.json({
      success: true,
      message: "user account deleted successfully",
      data: { deleted },
    });
  });
