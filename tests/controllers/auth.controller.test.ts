import { describe, it, expect, vi, beforeEach, type Mocked } from "vitest";
import { Hono, type Next } from "hono";
import { authRoutes } from "../../src/controllers/auth.controller";
import type { Context } from "hono";
import type { IAuthService } from "../../src/services/auth.service";
import type { IEmailService } from "../../src/services/email.service";
import { ValidationError } from "../../src/errors/validation.error";
import { testClient } from "hono/testing";
import {
  createMockUser,
  createMockUserWithPassword,
  createMockUserPayload,
  createMockAuthTokens,
  createMockRegistration,
  createMockLogin,
  VALID_USER_ID,
  INVALID_USER_ID,
  VALID_EMAIL,
  INVALID_EMAIL,
  EXISTING_USERNAME,
  AVAILABLE_USERNAME,
  VALID_PASSWORD,
  INVALID_PASSWORD,
  HASHED_PASSWORD,
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  RESET_TOKEN,
  VERIFICATION_TOKEN,
} from "../utils/auth.test-helpers";

vi.mock("../../src/lib/container", async () => {
  return {
    authService: {
      registerUser: vi.fn(),
      userLogin: vi.fn(),
      getByEmail: vi.fn(),
      isEmailVerified: vi.fn(),
      verifyUserEmail: vi.fn(),
      createResetPasswordToken: vi.fn(),
      validateDecodeResetPasswordToken: vi.fn(),
      createEmailVerificationToken: vi.fn(),
      validateEmailVerificationToken: vi.fn(),
      validateRefreshToken: vi.fn(),
      generateAuthTokens: vi.fn(),
      changeUserPassword: vi.fn(),
      isUsernameAvailable: vi.fn(),
    },
    emailService: {
      sendEmailVerification: vi.fn(),
      sendPasswordReset: vi.fn(),
      sendWelcomeEmail: vi.fn(),
    },
  };
});

vi.mock("../../src/middlewares/auth", () => ({
  jwt: () => (c: Context, next: Next) => {
    c.set("jwtPayload", {
      id: VALID_USER_ID.toString(),
      email: VALID_EMAIL,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    return next();
  },
}));

const testApp = new Hono().route("/", authRoutes);

describe("AuthController", () => {
  const client = testClient(testApp);
  let mockedAuthService: Mocked<IAuthService>;
  let mockedEmailService: Mocked<IEmailService>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const container = await vi.importMock("../../src/lib/container");
    mockedAuthService = container.authService as Mocked<IAuthService>;
    mockedEmailService = container.emailService as Mocked<IEmailService>;
  });

  describe("POST /signup", () => {
    it("should register a new user successfully", async () => {
      const mockUser = createMockUser();
      const mockTokens = createMockAuthTokens();
      const mockRegistration = createMockRegistration();

      mockedAuthService.registerUser.mockResolvedValue({
        ...mockUser,
        ...mockTokens,
      });
      mockedAuthService.createEmailVerificationToken.mockResolvedValue(
        VERIFICATION_TOKEN,
      );
      mockedEmailService.sendEmailVerification.mockResolvedValue(undefined);

      const response = await client.signup.$post({
        json: {
          email: mockRegistration.email,
          password: mockRegistration.password,
          confirmPassword: mockRegistration.password,
          username: mockRegistration.username,
        },
      });

      expect(response.status).toBe(201);
      const data = (await response.json()) as {
        success: boolean;
        message: string;
        data?: any;
      };
      expect(data.success).toBe(true);
      expect(data.message).toContain("User created successfully");
      expect(data.data.email).toBe(mockUser.email);
      expect(data.data.token).toBe(ACCESS_TOKEN);

      expect(mockedAuthService.registerUser).toHaveBeenCalledWith(
        mockRegistration,
      );
      expect(mockedEmailService.sendEmailVerification).toHaveBeenCalledWith({
        email: mockUser.email,
        username: mockUser.username,
        verificationToken: VERIFICATION_TOKEN,
      });

      const cookies = response.headers.get("set-cookie");
      expect(cookies).toContain(`refreshToken=${REFRESH_TOKEN}`);
      expect(cookies).toContain("HttpOnly");
      expect(cookies).toContain("SameSite=Strict");
    });

    it("should handle email already registered", async () => {
      const mockRegistration = createMockRegistration();

      mockedAuthService.registerUser.mockRejectedValue(
        new ValidationError("email already registered"),
      );

      const response = await client.signup.$post({
        json: {
          ...mockRegistration,
          confirmPassword: mockRegistration.password,
        },
      });

      expect(response.status).toBe(500);
      expect(mockedAuthService.registerUser).toHaveBeenCalledWith(
        mockRegistration,
      );
    });
  });

  describe("POST /signin", () => {
    it("should login user successfully", async () => {
      const mockUser = createMockUser();
      const mockTokens = createMockAuthTokens();
      const mockLogin = createMockLogin();

      mockedAuthService.userLogin.mockResolvedValue({
        ...mockUser,
        ...mockTokens,
      });

      const response = await client.signin.$post({
        json: mockLogin,
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as {
        success: boolean;
        message: string;
        data?: any;
      };
      expect(data.success).toBe(true);
      expect(data.message).toBe("user login successfully");
      expect(data.data.token).toBe(ACCESS_TOKEN);

      expect(mockedAuthService.userLogin).toHaveBeenCalledWith(mockLogin);

      const cookies = response.headers.get("set-cookie");
      expect(cookies).toContain(`refreshToken=${REFRESH_TOKEN}`);
    });

    it("should handle login service errors", async () => {
      const mockLogin = createMockLogin({ password: "WrongPassword" });

      mockedAuthService.userLogin.mockRejectedValue(
        new ValidationError("invalid email or password"),
      );

      const response = await client.signin.$post({
        json: mockLogin,
      });

      expect(response.status).toBe(500);
      expect(mockedAuthService.userLogin).toHaveBeenCalledWith(mockLogin);
    });
  });

  describe("POST /logout", () => {
    it("should logout user successfully", async () => {
      const response = await client.logout.$post({});

      expect(response.status).toBe(200);
      const data = (await response.json()) as {
        success: boolean;
        message: string;
        data?: any;
      };
      expect(data.success).toBe(true);
      expect(data.message).toBe("user logged out successfully");

      const cookies = response.headers.get("set-cookie");
      expect(cookies).toContain("refreshToken=");
      expect(cookies).toContain("Max-Age=0");
    });
  });

  describe("POST /forget-password", () => {
    it("should send password reset email successfully", async () => {
      const mockUser = createMockUser();

      mockedAuthService.getByEmail.mockResolvedValue(mockUser);
      mockedAuthService.createResetPasswordToken.mockResolvedValue(RESET_TOKEN);
      mockedEmailService.sendPasswordReset.mockResolvedValue(undefined);

      const response = await client["forget-password"].$post({
        json: { email: VALID_EMAIL },
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as {
        success: boolean;
        message: string;
        data?: any;
      };
      expect(data.success).toBe(true);
      expect(data.message).toBe("Reset password email sent successfully");

      expect(mockedAuthService.getByEmail).toHaveBeenCalledWith(VALID_EMAIL);
      expect(mockedAuthService.createResetPasswordToken).toHaveBeenCalledWith({
        id: VALID_USER_ID.toString(),
        email: mockUser.email,
        isEmailVerified: mockUser.isEmailVerified || false,
      });
      expect(mockedEmailService.sendPasswordReset).toHaveBeenCalledWith({
        email: mockUser.email,
        username: mockUser.username,
        resetToken: RESET_TOKEN,
      });
    });

    it("should handle user not found", async () => {
      mockedAuthService.getByEmail.mockRejectedValue(
        new ValidationError("User not found"),
      );

      const response = await client["forget-password"].$post({
        json: { email: INVALID_EMAIL },
      });

      expect(response.status).toBe(500);
      expect(mockedAuthService.getByEmail).toHaveBeenCalledWith(INVALID_EMAIL);
    });
  });

  describe("POST /reset-password/:token", () => {
    it("should reset password successfully", async () => {
      const token = "valid-reset-token";
      const passwordData = {
        password: "NewPassword123!",
        confirmPassword: "NewPassword123!",
      };
      const mockUserPayload = createMockUserPayload();

      mockedAuthService.validateDecodeResetPasswordToken.mockResolvedValue(
        mockUserPayload,
      );
      mockedAuthService.changeUserPassword.mockResolvedValue(undefined);

      const response = await client["reset-password"][":token"].$post({
        json: passwordData,
        param: { token },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("password reset successfully");

      expect(
        mockedAuthService.validateDecodeResetPasswordToken,
      ).toHaveBeenCalledWith(token);
      expect(mockedAuthService.changeUserPassword).toHaveBeenCalledWith(
        VALID_USER_ID,
        passwordData.password,
      );
    });

    it("should handle invalid token", async () => {
      const token = "invalid-token";
      const passwordData = {
        password: "NewPassword123!",
        confirmPassword: "NewPassword123!",
      };

      mockedAuthService.validateDecodeResetPasswordToken.mockRejectedValue(
        new ValidationError("Invalid token"),
      );

      const response = await client["reset-password"][":token"].$post({
        json: passwordData,
        param: { token },
      });

      expect(response.status).toBe(500);
      expect(mockedAuthService.changeUserPassword).not.toHaveBeenCalled();
    });
  });

  describe("POST /verify-email/:token", () => {
    it("should verify email successfully for new user", async () => {
      const mockUserPayload = createMockUserPayload();
      const mockUser = createMockUser();

      mockedAuthService.validateEmailVerificationToken.mockResolvedValue(
        mockUserPayload,
      );
      mockedAuthService.isEmailVerified.mockResolvedValue({ verified: false });
      mockedAuthService.verifyUserEmail.mockResolvedValue(true);
      mockedAuthService.getByEmail.mockResolvedValue(mockUser);
      mockedEmailService.sendWelcomeEmail.mockResolvedValue();

      const response = await client["verify-email"][":token"].$post({
        param: { token: VERIFICATION_TOKEN },
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as {
        success: boolean;
        message: string;
        data?: any;
      };
      expect(data.success).toBe(true);
      expect(data.message).toBe("Email verified successfully");
      expect(data.data.userId).toBe(mockUserPayload.id);

      expect(
        mockedAuthService.validateEmailVerificationToken,
      ).toHaveBeenCalledWith(VERIFICATION_TOKEN);
      expect(mockedAuthService.isEmailVerified).toHaveBeenCalledWith(
        VALID_USER_ID,
      );
      expect(mockedAuthService.verifyUserEmail).toHaveBeenCalledWith(
        VALID_USER_ID,
      );
      expect(mockedEmailService.sendWelcomeEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.username,
      );
    });

    it("should not send welcome email if email is already verified", async () => {
      const mockUserPayload = createMockUserPayload();

      mockedAuthService.validateEmailVerificationToken.mockResolvedValue(
        mockUserPayload,
      );
      mockedAuthService.isEmailVerified.mockResolvedValue({ verified: true });

      const response = await client["verify-email"][":token"].$post({
        param: { token: VERIFICATION_TOKEN },
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as {
        success: boolean;
        message: string;
        data?: any;
      };
      expect(data.success).toBe(true);
      expect(data.message).toBe("Email verified successfully");

      expect(mockedAuthService.verifyUserEmail).not.toHaveBeenCalled();
      expect(mockedAuthService.getByEmail).not.toHaveBeenCalled();
      expect(mockedEmailService.sendWelcomeEmail).not.toHaveBeenCalled();
    });

    it("should handle invalid verification token", async () => {
      const invalidToken = "invalid-token";

      mockedAuthService.validateEmailVerificationToken.mockRejectedValue(
        new ValidationError("jwt token invalid or expired"),
      );

      const response = await client["verify-email"][":token"].$post({
        param: { token: invalidToken },
      });

      expect(response.status).toBe(500);
      expect(mockedAuthService.isEmailVerified).not.toHaveBeenCalled();
    });

    it("should handle empty token", async () => {
      const response = await client["verify-email"][":token"].$post({
        param: { token: "" },
      });

      expect(response.status).toBe(404);
      expect(
        mockedAuthService.validateEmailVerificationToken,
      ).not.toHaveBeenCalled();
    });
  });

  describe("GET /email-verification-status/:userId", () => {
    it("should return email verification status", async () => {
      mockedAuthService.isEmailVerified.mockResolvedValue({ verified: true });

      const response = await client["email-verification-status"][
        ":userId"
      ].$get({
        param: { userId: VALID_USER_ID.toString() },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("email verification status retrieved");
      expect(data.data).toEqual({ verified: true });

      expect(mockedAuthService.isEmailVerified).toHaveBeenCalledWith(
        VALID_USER_ID,
      );
    });

    it("should handle invalid userId format", async () => {
      const response = await client["email-verification-status"][
        ":userId"
      ].$get({
        param: { userId: "invalid" },
      });

      expect(response.status).toBe(400);
      expect(mockedAuthService.isEmailVerified).not.toHaveBeenCalled();
    });

    it("should return false for unverified user", async () => {
      mockedAuthService.isEmailVerified.mockResolvedValue({ verified: false });

      const response = await client["email-verification-status"][
        ":userId"
      ].$get({
        param: { userId: VALID_USER_ID.toString() },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.verified).toBe(false);
    });
  });

  describe("POST /send-email-verification", () => {
    it("should send email verification successfully", async () => {
      const mockUser = createMockUser();

      mockedAuthService.createEmailVerificationToken.mockResolvedValue(
        VERIFICATION_TOKEN,
      );
      mockedAuthService.getByEmail.mockResolvedValue(mockUser);
      mockedEmailService.sendEmailVerification.mockResolvedValue(undefined);

      const response = await client["send-email-verification"].$post({
        Headers: {
          Authorization: "Bearer mock-jwt-token",
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("Email verification sent successfully");

      expect(
        mockedAuthService.createEmailVerificationToken,
      ).toHaveBeenCalledWith({
        id: VALID_USER_ID.toString(),
        email: VALID_EMAIL,
        isEmailVerified: false,
      });
      expect(mockedEmailService.sendEmailVerification).toHaveBeenCalledWith({
        email: mockUser.email,
        username: mockUser.username,
        verificationToken: VERIFICATION_TOKEN,
      });
    });
  });

  describe("POST /refresh-token", () => {
    it("should refresh tokens successfully", async () => {
      const mockUserPayload = createMockUserPayload();
      const mockTokens = createMockAuthTokens();

      mockedAuthService.validateRefreshToken.mockResolvedValue(mockUserPayload);
      mockedAuthService.generateAuthTokens.mockResolvedValue(mockTokens);

      const response = await client["refresh-token"].$post({
        cookie: { refreshToken: REFRESH_TOKEN },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("tokens refreshed");
      expect(data.data).toBe(ACCESS_TOKEN);

      expect(mockedAuthService.validateRefreshToken).toHaveBeenCalledWith(
        REFRESH_TOKEN,
      );
      expect(mockedAuthService.generateAuthTokens).toHaveBeenCalledWith(
        mockUserPayload,
      );

      const cookies = response.headers.get("set-cookie");
      expect(cookies).toContain(`refreshToken=${REFRESH_TOKEN}`);
    });

    it("should return 400 for missing refresh token", async () => {
      const response = await client["refresh-token"].$post({
        cookie: { refreshToken: "" },
      });

      expect(response.status).toBe(400);
      expect(mockedAuthService.validateRefreshToken).not.toHaveBeenCalled();
    });

    it("should handle invalid refresh token", async () => {
      mockedAuthService.validateRefreshToken.mockRejectedValue(
        new ValidationError("Invalid refresh token"),
      );

      const response = await client["refresh-token"].$post({
        cookie: { refreshToken: "invalid-token" },
      });

      expect(response.status).toBe(500);
      expect(mockedAuthService.validateRefreshToken).toHaveBeenCalledWith(
        "invalid-token",
      );
    });
  });

  describe("GET /check-username", () => {
    it("should return true when username is available", async () => {
      mockedAuthService.isUsernameAvailable.mockResolvedValue({
        available: true,
      });

      const response = await client["check-username"].$get({
        query: { username: AVAILABLE_USERNAME },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("username availability checked");
      expect(data.data).toEqual({
        username: AVAILABLE_USERNAME,
        available: true,
      });

      expect(mockedAuthService.isUsernameAvailable).toHaveBeenCalledWith(
        AVAILABLE_USERNAME,
      );
    });

    it("should return false when username is taken", async () => {
      mockedAuthService.isUsernameAvailable.mockResolvedValue({
        available: false,
      });

      const response = await client["check-username"].$get({
        query: { username: EXISTING_USERNAME },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.available).toBe(false);
    });
  });

  describe("Edge Cases and Error Scenarios", () => {
    it("should handle concurrent registration attempts", async () => {
      const mockRegistration = createMockRegistration();

      mockedAuthService.registerUser
        .mockResolvedValueOnce({
          ...createMockUser(),
          ...createMockAuthTokens(),
        })
        .mockRejectedValueOnce(new ValidationError("Email already exists"));

      mockedAuthService.createEmailVerificationToken.mockResolvedValue(
        VERIFICATION_TOKEN,
      );
      mockedEmailService.sendEmailVerification.mockResolvedValue(undefined);

      const [response1, response2] = await Promise.all([
        client.signup.$post({
          json: {
            ...mockRegistration,
            confirmPassword: mockRegistration.password,
          },
        }),
        client.signup.$post({
          json: {
            ...mockRegistration,
            confirmPassword: mockRegistration.password,
          },
        }),
      ]);

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(500);
    });
  });
});
