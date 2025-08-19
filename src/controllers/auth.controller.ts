import { authService, emailService } from "../lib/container";
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
  usernameQuerySchema,
} from "../schemas/auth.schema";
import {
  JwtAlgorithmNotImplemented,
  JwtTokenExpired,
  JwtTokenInvalid,
  JwtTokenIssuedAt,
  JwtTokenNotBefore,
  JwtTokenSignatureMismatched,
} from "hono/utils/jwt/types";

/**
 * Cookie configuration for refresh tokens
 * Ensures secure transmission and proper storage
 */
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
} as const;

/**
 * Creates a standardized user payload for JWT tokens
 * @param user - User object containing ID, email, and email verification status
 * @returns Formatted user payload for token generation
 */
const createUserPayload = (user: {
  id: number;
  email: string;
  isEmailVerified?: boolean | null;
}) => ({
  id: user.id.toString(),
  email: user.email,
  isEmailVerified: user.isEmailVerified || false,
});

const handleJwtErrors = (err: unknown) => {
  if (
    err instanceof JwtTokenInvalid ||
    err instanceof JwtTokenExpired ||
    err instanceof JwtTokenNotBefore ||
    err instanceof JwtTokenIssuedAt ||
    err instanceof JwtTokenSignatureMismatched ||
    err instanceof JwtAlgorithmNotImplemented
  ) {
    throw new ValidationError("jwt token invalid or expired");
  }
  throw err;
};

export const authRoutes = createHonoBindings()
  /**
   * POST /signup
   * Registers a new user account with email verification
   */
  .post("/signup", zValidator("json", signupSchema), async (c) => {
    const validatedBody = c.req.valid("json");
    const { confirmPassword, ...registrationData } = validatedBody;

    const { accessToken, refreshToken, ...user } =
      await authService.registerUser(registrationData);

    setCookie(c, "refreshToken", refreshToken, COOKIE_OPTIONS);

    const verificationToken = await authService.createEmailVerificationToken(
      createUserPayload(user),
    );

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

  /**
   * POST /signin
   * Authenticates user and returns access token with refresh token cookie
   */
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

  /**
   * POST /logout
   * Logs out user by clearing refresh token cookie
   */
  .post("/logout", async (c) => {
    setCookie(c, "refreshToken", "", {
      ...COOKIE_OPTIONS,
      maxAge: 0,
    });

    return c.json(
      {
        success: true,
        message: "user logged out successfully",
      },
      200,
    );
  })

  /**
   * POST /forget-password
   * Initiates password reset process by sending reset email
   */
  .post(
    "/forget-password",
    zValidator("json", forgetPasswordSchema),
    async (c) => {
      const { email } = c.req.valid("json");
      const user = await authService.getByEmail(email);

      const resetToken = await authService.createResetPasswordToken(
        createUserPayload(user),
      );

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

  /**
   * POST /reset-password/:token
   * Resets user password using valid reset token
   */
  .post(
    "/reset-password/:token",
    zValidator("param", tokenParamsSchema),
    zValidator("json", resetPasswordSchema),
    async (c) => {
      const { token } = c.req.valid("param");
      const { password } = c.req.valid("json");

      const user = await authService.validateDecodeResetPasswordToken(token);
      await authService.changeUserPassword(+user.id, password);

      return c.json({
        success: true,
        message: "Password reset successfully",
      });
    },
  )

  /**
   * POST /verify-email/:token
   * Verifies user email using verification token and sends welcome email
   */
  .post(
    "/verify-email/:token",
    zValidator("param", tokenParamsSchema),
    async (c) => {
      try {
        const { token } = c.req.valid("param");

        const userPayload = await authService.validateEmailVerificationToken(
          token,
        );

        const { verified } = await authService.isEmailVerified(+userPayload.id);

        if (!verified) {
          await authService.verifyUserEmail(+userPayload.id);
          const fullUser = await authService.getByEmail(userPayload.email);
          await emailService.sendWelcomeEmail(
            fullUser.email,
            fullUser.username,
          );
        }

        return c.json({
          success: true,
          message: "Email verified successfully",
          data: {
            userId: userPayload.id,
          },
        });
      } catch (err) {
        handleJwtErrors(err);
      }
    },
  )

  /**
   * GET /email-verification-status/:userId
   * Retrieves email verification status for a user
   */
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

  /**
   * POST /send-email-verification
   * Sends email verification to authenticated user
   */
  .post("/send-email-verification", jwt(), async (c) => {
    const user = c.get("jwtPayload");

    const token = await authService.createEmailVerificationToken({
      id: user.id,
      email: user.email,
      isEmailVerified: user.isEmailVerified || false,
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

  /**
   * POST /refresh-token
   * Generates new access token using refresh token from cookie
   */
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

  /**
   * GET /check-username
   * Checks if username is available for registration
   */
  .get(
    "/check-username",
    zValidator("query", usernameQuerySchema),
    async (c) => {
      const { username } = c.req.valid("query");

      const result = await authService.isUsernameAvailable(username);

      return c.json({
        success: true,
        message: "username availability checked",
        data: {
          username,
          available: result.available,
        },
      });
    },
  );
