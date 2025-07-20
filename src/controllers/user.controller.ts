import { zValidator } from "../utils/validator";
import { updateUserSchema } from "../schemas/user.schema";
import { userService } from "../lib/container";
import { createHonoBindings } from "../lib/create-hono";

export const userRoutes = createHonoBindings()
  .get("/me", async (c) => {
    const { id: userId } = c.get("jwtPayload");

    const me = await userService.getUserByIdSafe(+userId);

    return c.json(
      {
        success: true,
        message: "it's me",
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
  .get("/me/email-verification-status", async (c) => {
    const { id: userId } = c.get("jwtPayload");

    const verificationStatus = await userService.isUserEmailVerified(+userId);

    return c.json({
      success: true,
      message: "email verification status retrieved",
      data: verificationStatus,
    });
  })
  .delete("/me", async (c) => {
    const { id: userId } = c.get("jwtPayload");

    const deleted = await userService.deleteUser(+userId);

    return c.json({
      success: true,
      message: "user account deleted successfully",
      data: { deleted },
    });
  });
