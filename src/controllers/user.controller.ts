import { Hono } from "hono";
import { zValidator } from "../utils/validator";
import { UserService } from "../services/user.service";
import { userInsertSchema, userSelectSchema } from "../db/schema/user.db";

const userService = new UserService();
export const userRoutes = new Hono().post(
  "/",
  zValidator("json", userInsertSchema),
  async (c) => {
    const validatedBody = c.req.valid("json");
    const newUser = await userService.signUp(validatedBody);
    return c.json(
      {
        data: newUser,
      },
      201,
    );
  },
);
