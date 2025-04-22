import { Hono } from "hono";
import { zValidator } from "../utils/validator";
import { UserService } from "../services/user.service";
import {
  userInsertSchema,
  userLoginSchema,
  userSelectSchema,
} from "../db/schema/user.db";
import { jwt } from "../middlewares/auth";
import { decode } from "hono/jwt";
import type { Bindings } from "../lib/types";

const userService = new UserService();
export const userRoutes = new Hono<Bindings>()
  .use("/me", jwt())
  .get("/me", async (c) => {
    const { id } = c.get("jwtPayload");
    const me = await userService.getById(Number(id));
    return c.json(
      {
        success: true,
        message: "it's me",
        data: me,
      },
      200,
    );
  })
  .post("/signup", zValidator("json", userInsertSchema), async (c) => {
    const validatedBody = c.req.valid("json");
    const newUser = await userService.signUp(validatedBody);
    return c.json(
      { success: true, message: "user created", data: newUser },
      201,
    );
  })
  .post("/signin", zValidator("json", userLoginSchema), async (c) => {
    const validatedLogin = c.req.valid("json");
    const login = await userService.signIn(validatedLogin);
    return c.json({
      success: true,
      message: "user login successfully",
      data: login,
    });
  });
