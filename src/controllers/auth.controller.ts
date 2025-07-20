import { authService, emailService, userService } from "../lib/container";
import { ValidationError } from "../errors/validation.error";
import { createHonoBindings } from "../lib/create-hono";
import { zValidator } from "../utils/validator";
import { jwt } from "../middlewares/auth";
import { config } from "../config/index";
import { setCookie } from "hono/cookie";
import {
  signupSchema,
  signinSchema,
  resetPasswordSchema,
  forgetPasswordSchema,
  refreshTokenSchema,
  tokenParamsSchema,
  userIdParamsSchema,
  usernameParamsSchema,
} from "../schemas/auth.schema";
import {
  JwtAlgorithmNotImplemented,
  JwtTokenExpired,
  JwtTokenInvalid,
  JwtTokenIssuedAt,
  JwtTokenNotBefore,
  JwtTokenSignatureMismatched,
} from "hono/utils/jwt/types";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export const authRoutes = createHonoBindings()
  .post("/signup", zValidator("json", signupSchema), async (c) => {
    const validatedBody = c.req.valid("json");

    // Transform validated input to match service interface (remove confirmPassword)
    // confirm password only in schema level, not in service
    const { confirmPassword, ...registrationData } = validatedBody;

    const { accessToken, refreshToken, ...user } =
      await authService.registerUser(registrationData);
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
  .post("/signin", zValidator("json", signinSchema), async (c) => {
    const validatedLogin = c.req.valid("json");

    const { accessToken, refreshToken, ...user } = await authService.userLogin(
      validatedLogin,
    );
    setCookie(c, "refreshToken", refreshToken, COOKIE_OPTIONS);

    return c.json(
      {
        success: true,
        message: "user login successfully",
        data: { ...user, token: accessToken },
      },
      200,
    );
  })
  .post("/logout", async (c) => {
    // Backend clear the refresh token cookie
    // Frontend clear local storage and session storage
    setCookie(c, "refreshToken", "", {
      ...COOKIE_OPTIONS,
      maxAge: 0, // Immediately expire the cookie
    });

    return c.json(
      {
        success: true,
        message: "user logged out successfully",
      },
      200,
    );
  })
  .post(
    "/forget-password",
    zValidator("json", forgetPasswordSchema),
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

      return c.json(
        {
          success: true,
          message: "Reset password email sent successfully",
        },
        200,
      );
    },
  )
  .post(
    "/reset-password/:token",
    zValidator("param", tokenParamsSchema),
    zValidator("json", resetPasswordSchema),
    async (c) => {
      const { token } = c.req.valid("param");
      const validatedInput = c.req.valid("json");

      const user = await authService.validateDecodeResetPasswordToken(token);
      await authService.changeUserPassword(+user.id, validatedInput.password);

      return c.json({
        success: true,
        message: "password reset successfully",
      });
    },
  )
  .post(
    "/verify-email/:token",
    zValidator("param", tokenParamsSchema),
    async (c) => {
      try {
        const { token } = c.req.valid("param");

        const user = await authService.validateEmailVerificationToken(token);

        const isVerified = await authService.isEmailVerified(+user.id);
        if (!isVerified.verified) {
          await authService.verifyUserEmail(+user.id);
          const fullUser = await authService.getByEmail(user.email);
          await emailService.sendWelcomeEmail(
            fullUser.email,
            fullUser.username,
          );
        }

        return c.json({
          success: true,
          message: "Email verified successfully",
          data: { userId: user.id },
        });
      } catch (err) {
        if (
          err instanceof JwtTokenInvalid ||
          err instanceof JwtTokenExpired ||
          err instanceof JwtTokenNotBefore ||
          err instanceof JwtTokenIssuedAt ||
          err instanceof JwtTokenSignatureMismatched ||
          err instanceof JwtAlgorithmNotImplemented
        ) {
          console.log("jwt token error");
          throw new ValidationError("jwt token invalid or expired");
        }
        throw err;
      }
    },
  )
  .get(
    "/email-verification-status/:userId",
    zValidator("param", userIdParamsSchema),
    async (c) => {
      const { userId } = c.req.valid("param");

      const status = await authService.isEmailVerified(userId);

      return c.json({
        success: true,
        message: "email verification status retrieved",
        data: status,
      });
    },
  )
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
  )
  .get(
    "/check-username/:username",
    zValidator("param", usernameParamsSchema),
    async (c) => {
      const { username } = c.req.valid("param");

      // Add artificial delay to prevent timing attacks
      const startTime = Date.now();
      const exists = await userService.isUsernameExists(username);
      const elapsedTime = Date.now() - startTime;

      // Ensure minimum response time to prevent timing analysis
      const minResponseTime = 100; // 100ms minimum
      if (elapsedTime < minResponseTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, minResponseTime - elapsedTime),
        );
      }

      return c.json({
        success: true,
        message: "username availability checked",
        data: {
          username,
          available: !exists,
          exists,
        },
      });
    },
  );
