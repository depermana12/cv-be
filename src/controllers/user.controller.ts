import { zValidator } from "../utils/validator";
import { UserService } from "../services/user.service";
import { userUpdateSchema } from "../schemas/user.schema";
import { createHonoBindings } from "../lib/create-hono";
import { getDb } from "../db";
import { UserRepository } from "../repositories/user.repo";
import { CvService } from "../services/cv.service";
import { CvRepository } from "../repositories/cv.repo";

const db = await getDb();
const userRepository = new UserRepository(db);
const cvService = new CvService(new CvRepository(db));
const userService = new UserService(userRepository, cvService);

export const userRoutes = createHonoBindings()
  .get("/me", async (c) => {
    const { id } = c.get("jwtPayload");

    const me = await userService.getUserByIdSafe(Number(id));

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
    const { id } = c.get("jwtPayload");

    const userStats = await userService.getUserStats(Number(id));

    return c.json({
      success: true,
      message: "user statistics retrieved",
      data: userStats,
    });
  })
  .patch("/me", zValidator("json", userUpdateSchema), async (c) => {
    const { id } = c.get("jwtPayload");
    const updateData = c.req.valid("json");

    const updatedUser = await userService.updateUserProfile(
      Number(id),
      updateData,
    );

    return c.json({
      success: true,
      message: "user profile updated successfully",
      data: updatedUser,
    });
  })
  .get("/check-username/:username", async (c) => {
    const username = c.req.param("username");

    const exists = await userService.isUsernameExists(username);

    return c.json({
      success: true,
      message: "username availability checked",
      data: {
        username,
        available: !exists,
        exists,
      },
    });
  })
  .get("/me/email-verification-status", async (c) => {
    const { id } = c.get("jwtPayload");

    const verificationStatus = await userService.isUserEmailVerified(
      Number(id),
    );

    return c.json({
      success: true,
      message: "email verification status retrieved",
      data: verificationStatus,
    });
  });
