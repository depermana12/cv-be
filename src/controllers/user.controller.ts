import { Hono, type MiddlewareHandler } from "hono";
import { zValidator } from "../utils/validator";
import { UserService } from "../services/user.service";
import {
  userInputEmail,
  userInputResetPassword,
  userInsertSchema,
  userLoginSchema,
  userSelectSchema,
} from "../db/schema/user.db";
import { jwt } from "../middlewares/auth";
import type { Bindings } from "../lib/types";
import { UserRepository } from "../repositories/user.repo";
import { db } from "../db/index";

export const createUserRoutes = (
  userService: UserService,
  jwtMiddleware: MiddlewareHandler<Bindings> = jwt(),
) => {
  const app = new Hono<Bindings>()
    .use("/users/me", jwt())
    .get("/users/me", async (c) => {
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
      // TODO: email validation is failed because drizzle zod not adding it by default
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
    })
    .post("/forget-password", zValidator("json", userInputEmail), async (c) => {
      const validatedInput = c.req.valid("json");
      const user = await userService.getByEmail(validatedInput.email);

      await userService.createResetPasswordToken({
        id: user.id.toString(),
        email: user.email,
      });

      //TODO: email service
    })
    .post(
      "/reset-password/:token",
      zValidator("json", userInputResetPassword),
      async (c) => {
        const token = c.req.param("token");
        const user = await userService.validateDecodeResetToken(token);

        const validatedInput = c.req.valid("json");
        await userService.updatePassword(
          Number(user.id),
          validatedInput.password,
        );
        return c.json({
          success: true,
          message: "password reset successfully",
        });
      },
    );

  return app;
};

const userRepository = new UserRepository(await db);
export const userRoutes = createUserRoutes(
  new UserService(userRepository),
  jwt(),
);
