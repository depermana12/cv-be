import { zValidator } from "../utils/validator";
import {
  userInputResetPassword,
  emailForPasswordReset,
  userLoginSchema,
  refreshTokenSchema,
} from "../schemas/auth.schema";
import { createHonoBindings } from "../lib/create-hono";
import { authService } from "../lib/container";
import { userInsertSchema } from "../schemas/user.schema";
import { setCookie } from "hono/cookie";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

const authRoutes = createHonoBindings();
authRoutes
  .post("/signup", zValidator("json", userInsertSchema), async (c) => {
    const validatedBody = c.req.valid("json");

    const { accessToken, refreshToken, ...user } =
      await authService.registerUser(validatedBody);
    setCookie(c, "refreshToken", refreshToken, COOKIE_OPTIONS);

    return c.json(
      {
        success: true,
        message: "user created",
        data: { ...user, token: accessToken },
      },
      201,
    );
  })
  .post("/signin", zValidator("json", userLoginSchema), async (c) => {
    const validatedLogin = c.req.valid("json");

    const { accessToken, refreshToken, ...user } = await authService.userLogin(
      validatedLogin,
    );
    setCookie(c, "refreshToken", refreshToken, COOKIE_OPTIONS);

    return c.json({
      success: true,
      message: "user login successfully",
      data: { ...user, token: accessToken },
    });
  })
  .post(
    "/forget-password",
    zValidator("json", emailForPasswordReset),
    async (c) => {
      const validatedInput = c.req.valid("json");
      const user = await authService.getByEmail(validatedInput.email);

      await authService.createResetPasswordToken({
        id: user.id.toString(),
        email: user.email,
      });

      // TODO: email service
      return c.json({
        success: true,
        message: "reset password email sent",
      });
    },
  )
  .post(
    "/reset-password/:token",
    zValidator("json", userInputResetPassword),
    async (c) => {
      const token = c.req.param("token");
      const validatedInput = c.req.valid("json");

      const user = await authService.validateDecodeResetPasswordToken(token);
      await authService.changeUserPassword(
        Number(user.id),
        validatedInput.password,
      );
      return c.json({
        success: true,
        message: "password reset successfully",
      });
    },
  )
  .post("/verify-email/:token", async (c) => {
    const token = c.req.param("token");

    const user = await authService.validateEmailVerificationToken(token);

    return c.json({
      success: true,
      message: "email verified successfully",
      data: { userId: user.id },
    });
  })
  .get("/email-verification-status/:userId", async (c) => {
    const userId = Number(c.req.param("userId"));

    const status = await authService.isEmailVerified(userId);

    return c.json({
      success: true,
      message: "email verification status retrieved",
      data: status,
    });
  })
  .post("/send-email-verification", async (c) => {
    const user = c.get("jwtPayload");

    const token = await authService.createEmailVerificationToken({
      id: user.id,
      email: user.email,
    });

    // TODO: Send email with verification link, and remove the token
    return c.json({
      success: true,
      message: "email verification sent",
      data: { token }, // remove this in production
    });
  })
  .post(
    "/refresh-token",
    zValidator("cookie", refreshTokenSchema),
    async (c) => {
      const { refreshToken } = c.req.valid("cookie");

      const userPayload = await authService.validateRefreshToken(refreshToken);
      const newTokens = await authService.generateAuthTokens(userPayload);

      setCookie(c, "refreshToken", newTokens.refreshToken, COOKIE_OPTIONS);
      return c.json({
        success: true,
        message: "tokens refreshed",
        data: newTokens.accessToken,
      });
    },
  );
export { authRoutes };
