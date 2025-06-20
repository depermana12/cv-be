import { zValidator } from "../utils/validator";
import {
  userInputResetPassword,
  emailForPasswordReset,
  userLoginSchema,
  refreshTokenSchema,
} from "../schemas/auth.schema";
import { createHonoBindings } from "../lib/create-hono";
import { authService, emailService } from "../lib/container";
import { userInsertSchema } from "../schemas/user.schema";
import { setCookie } from "hono/cookie";
import { jwt } from "../middlewares/auth";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export const authRoutes = createHonoBindings();
authRoutes
  .post("/signup", zValidator("json", userInsertSchema), async (c) => {
    const validatedBody = c.req.valid("json");

    const { accessToken, refreshToken, ...user } =
      await authService.registerUser(validatedBody);
    setCookie(c, "refreshToken", refreshToken, COOKIE_OPTIONS);

    const verificationToken = await authService.createEmailVerificationToken({
      id: user.id.toString(),
      email: user.email,
    });

    await emailService.sendEmailVerification({
      email: user.email,
      username: user.username,
      verificationToken,
    });

    return c.json(
      {
        success: true,
        message:
          "User created successfully. Please check your email for verification.",
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

      const resetToken = await authService.createResetPasswordToken({
        id: user.id.toString(),
        email: user.email,
      });

      await emailService.sendPasswordReset({
        email: user.email,
        username: user.username,
        resetToken,
      });

      return c.json({
        success: true,
        message: "Reset password email sent successfully",
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

    const isVerified = await authService.isEmailVerified(Number(user.id));
    if (!isVerified) {
      const fullUser = await authService.getByEmail(user.email);
      await emailService.sendWelcomeEmail(fullUser.email, fullUser.username);
    }

    return c.json({
      success: true,
      message: "Email verified successfully",
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
  .post("/send-email-verification", jwt(), async (c) => {
    const user = c.get("jwtPayload");

    const token = await authService.createEmailVerificationToken({
      id: user.id,
      email: user.email,
    });

    const fullUser = await authService.getByEmail(user.email);
    await emailService.sendEmailVerification({
      email: fullUser.email,
      username: fullUser.username,
      verificationToken: token,
    });

    return c.json({
      success: true,
      message: "Email verification sent successfully",
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
