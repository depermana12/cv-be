import { describe, it, expect, vi, beforeEach, type Mocked } from "vitest";
import { Hono, type Next } from "hono";
import { authRoutes } from "../../src/controllers/auth.controller";
import type { Context } from "hono";
import type { IAuthService } from "../../src/services/auth.service";
import type { IEmailService } from "../../src/services/email.service";
import type {
  AuthUserLogin,
  AuthUserRegister,
  AuthUserSafe,
} from "../../src/db/types/auth.type";
import type { UserPayload } from "../../src/lib/types";
import { ValidationError } from "../../src/errors/validation.error";
import { testClient } from "hono/testing";

// mock the service container - inline mock objects to avoid hoisting issues
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
      id: "1",
      email: "test@example.com",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    return next();
  },
}));

const testApp = new Hono().route("/", authRoutes);

describe("http integration auth test", () => {
  const client = testClient(testApp);
  let mockedAuthService: Mocked<IAuthService>;
  let mockedEmailService: Mocked<IEmailService>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const container = await vi.importMock("../../src/lib/container");
    mockedAuthService = container.authService as Mocked<IAuthService>;
    mockedEmailService = container.emailService as Mocked<IEmailService>;
  });

  const userId = 1;
  const mockUser: AuthUserSafe = {
    id: userId,
    email: "tungtungsahur@email.com",
    firstName: "tung tung",
    lastName: "sahur",
    username: "tung2sahur",
    isEmailVerified: true,
    profileImage: "imageurloftungtungtungsahur",
    birthDate: new Date("2025-03-01"),
    gender: null,
    createdAt: new Date("2025-07-01"),
    updatedAt: new Date("2025-07-01"),
  };

  const mockUserWithPassword = {
    ...mockUser,
    password: "moCkHashedPassworD",
  };

  const mockAuthTokens = {
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
  };

  const mockPerTokenan = {
    verificationToken: "mock-verification-token",
    resetToken: "mock-reset-token",
  };

  const mockResetPassword = {
    email: mockUser.email,
    username: mockUser.username,
    resetToken: mockPerTokenan.resetToken,
  };

  const mockRegistration: AuthUserRegister = {
    email: mockUser.email,
    password: "ballerinaCapuccina",
    username: mockUser.username,
  };

  const mockLogin: AuthUserLogin = {
    email: mockUser.email,
    password: "ballerinaCapuccina",
  };

  const mockUserPayload: UserPayload = { id: "1", email: mockUser.email };

  describe("POST /auth/signup", () => {
    it("should register a new user successfully", async () => {
      mockedAuthService.registerUser.mockResolvedValue({
        ...mockUser,
        ...mockAuthTokens,
      });
      mockedAuthService.createEmailVerificationToken.mockResolvedValue(
        "verification-token",
      );
      mockedEmailService.sendEmailVerification.mockResolvedValue(undefined);

      const response = await client.signup.$post({
        json: mockRegistration,
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain("User created successfully");
      expect(data.data.email).toBe(mockUser.email);
      expect(data.data.token).toBe(mockAuthTokens.accessToken);

      expect(mockedAuthService.registerUser).toHaveBeenCalledWith(
        mockRegistration,
      );
      expect(mockedEmailService.sendEmailVerification).toHaveBeenCalledWith({
        email: mockUser.email,
        username: mockUser.username,
        verificationToken: "verification-token",
      });

      const cookies = response.headers.get("set-cookie");
      expect(cookies).toContain("refreshToken=mock-refresh-token");
      expect(cookies).toContain("HttpOnly");
      expect(cookies).toContain("SameSite=Strict");
    });

    it("should validate required fields", async () => {
      const invalidData = {
        email: "testemail.com",
        password: "",
        username: "",
      };

      const response = await client.signup.$post({
        json: invalidData,
      });

      expect(response.status).toBe(400);
      expect(mockedAuthService.registerUser).not.toHaveBeenCalled();
    });

    it("should handle user already registered", async () => {
      const userData = {
        email: mockUser.email,
        password: "strongpassword123!",
        username: "testuser",
      };

      mockedAuthService.registerUser.mockRejectedValue(
        new ValidationError("email already registered"),
      );

      const response = await client.signup.$post({
        json: userData,
      });

      expect(response.status).toBe(500);
      expect(mockedAuthService.registerUser).toHaveBeenCalledWith(userData);
    });
  });

  describe("POST /auth/signin", () => {
    it("should login user successfully", async () => {
      mockedAuthService.userLogin.mockResolvedValue({
        ...mockUser,
        ...mockAuthTokens,
      });

      const response = await client.signin.$post({
        json: mockLogin,
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("user login successfully");
      expect(data.data.token).toBe(mockAuthTokens.accessToken);

      expect(mockedAuthService.userLogin).toHaveBeenCalledWith(mockLogin);

      const cookies = response.headers.get("set-cookie");
      expect(cookies).toContain("refreshToken=mock-refresh-token");
    });

    it("should return 400 for invalid login data", async () => {
      const invalidData = {
        email: "invalidemail.com",
        password: "123pw",
      };

      const response = await client.signin.$post({
        json: invalidData,
      });

      expect(response.status).toBe(400);
      expect(mockedAuthService.userLogin).not.toHaveBeenCalled();
    });

    it("should handle login service errors", async () => {
      const loginData = {
        email: "test@example.com",
        password: "WrongPassword123!",
      };

      mockedAuthService.userLogin.mockRejectedValue(
        new ValidationError("invalid email or password"),
      );

      const response = await client.signin.$post({
        json: loginData,
      });

      expect(response.status).toBe(500);
      expect(mockedAuthService.userLogin).toHaveBeenCalledWith(loginData);
    });
  });

  describe("POST /auth/forget-password", () => {
    it("should send password reset email successfully", async () => {
      mockedAuthService.getByEmail.mockResolvedValue(mockUser);
      mockedAuthService.createResetPasswordToken.mockResolvedValue(
        mockPerTokenan.resetToken,
      );
      mockedEmailService.sendPasswordReset.mockResolvedValue(undefined);

      const response = await client["forget-password"].$post({
        json: mockResetPassword,
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("Reset password email sent successfully");

      expect(mockedAuthService.getByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(mockedAuthService.createResetPasswordToken).toHaveBeenCalledWith({
        id: "1",
        email: mockUser.email,
      });
      expect(mockedEmailService.sendPasswordReset).toHaveBeenCalledWith(
        mockResetPassword,
      );
    });
  });

  describe("POST /auth/reset-password/:token", () => {
    it("should reset password successfully", async () => {
      const token = "valid-reset-token";
      const passwordData = {
        password: "NewPassword123!",
        confirmPassword: "NewPassword123!",
      };

      const mockUser = {
        id: "1",
        email: "test@example.com",
      };

      mockedAuthService.validateDecodeResetPasswordToken.mockResolvedValue(
        mockUser,
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
        1,
        passwordData.password,
      );
    });
  });

  describe("POST /auth/verify-email/:token", () => {
    it("should verify email successfully for new user", async () => {
      const verificationToken = "mock-verification-token";

      mockedAuthService.validateEmailVerificationToken.mockResolvedValue(
        mockUserPayload,
      );
      mockedAuthService.isEmailVerified.mockResolvedValue({ verified: false });
      mockedAuthService.verifyUserEmail.mockResolvedValue(true);
      mockedAuthService.getByEmail.mockResolvedValue(mockUser);
      mockedEmailService.sendWelcomeEmail.mockResolvedValue();

      const response = await client["verify-email"][":token"].$post({
        param: { token: verificationToken },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("Email verified successfully");
      expect(Number(data.data.userId)).toBe(mockUser.id);

      expect(
        mockedAuthService.validateEmailVerificationToken,
      ).toHaveBeenCalledWith(verificationToken);
      expect(mockedAuthService.isEmailVerified).toHaveBeenCalledWith(1);
      expect(mockedAuthService.verifyUserEmail).toHaveBeenCalledWith(1);
      expect(mockedAuthService.getByEmail).toHaveBeenCalledWith(mockUser.email);

      expect(mockedEmailService.sendWelcomeEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.username,
      );
    });
    it("should not send welcome email if email is already verified", async () => {
      const verificationToken = "mock-verification-token";

      mockedAuthService.validateEmailVerificationToken.mockResolvedValue(
        mockUserPayload,
      );
      mockedAuthService.isEmailVerified.mockResolvedValue({ verified: true });
      // this should not be called since email is already verified
      // mockedAuthService.verifyUserEmail.mockResolvedValue(true);
      mockedAuthService.getByEmail.mockResolvedValue(mockUser);
      mockedEmailService.sendWelcomeEmail.mockResolvedValue();

      const response = await client["verify-email"][":token"].$post({
        param: { token: verificationToken },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("Email verified successfully");
      expect(Number(data.data.userId)).toBe(mockUser.id);

      expect(
        mockedAuthService.validateEmailVerificationToken,
      ).toHaveBeenCalledWith(verificationToken);
      expect(mockedAuthService.isEmailVerified).toHaveBeenCalledWith(1);

      expect(mockedAuthService.verifyUserEmail).not.toHaveBeenCalled();
      expect(mockedAuthService.getByEmail).not.toHaveBeenCalled();
      expect(mockedEmailService.sendWelcomeEmail).not.toHaveBeenCalled();
    });

    it("should handle invalid verification token", async () => {
      const invalidToken = "invalid-token";

      mockedAuthService.validateEmailVerificationToken.mockRejectedValueOnce(
        new ValidationError("jwt token invalid or expired"),
      );

      const response = await client["verify-email"][":token"].$post({
        param: { token: invalidToken },
      });
      // this is not match status
      expect(response.status).toBe(500);

      expect(
        mockedAuthService.validateEmailVerificationToken,
      ).toHaveBeenCalledWith(invalidToken);

      expect(mockedAuthService.isEmailVerified).not.toHaveBeenCalled();
      expect(mockedAuthService.verifyUserEmail).not.toHaveBeenCalled();
      expect(mockedAuthService.getByEmail).not.toHaveBeenCalled();
      expect(mockedEmailService.sendWelcomeEmail).not.toHaveBeenCalled();
    });
  });

  describe("GET /auth/email-verification-status/:userId", () => {
    it("should return email verification status", async () => {
      const userId = "1";
      mockedAuthService.isEmailVerified.mockResolvedValue({ verified: true });

      const response = await client["email-verification-status"][
        ":userId"
      ].$get({
        param: { userId },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("email verification status retrieved");
      expect(data.data).toEqual({ verified: true });

      expect(mockedAuthService.isEmailVerified).toHaveBeenCalledWith(1);
    });
  });

  describe("POST /auth/send-email-verification", () => {
    it("should send email verification successfully", async () => {
      mockedAuthService.createEmailVerificationToken.mockResolvedValue(
        "verification-token",
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
        id: "1",
        email: "test@example.com",
      });
      expect(mockedEmailService.sendEmailVerification).toHaveBeenCalledWith({
        email: mockUser.email,
        username: mockUser.username,
        verificationToken: "verification-token",
      });
    });
  });

  describe("POST /auth/refresh-token", () => {
    it("should refresh tokens successfully", async () => {
      const refreshToken = "mock-valid-refresh-token";
      mockedAuthService.validateRefreshToken.mockResolvedValue(mockUserPayload);
      mockedAuthService.generateAuthTokens.mockResolvedValue(mockAuthTokens);

      const response = await client["refresh-token"].$post({
        cookie: { refreshToken },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("tokens refreshed");
      expect(data.data).toBe(mockAuthTokens.accessToken);

      expect(mockedAuthService.validateRefreshToken).toHaveBeenCalledWith(
        refreshToken,
      );

      expect(mockedAuthService.generateAuthTokens).toHaveBeenCalledWith(
        mockUserPayload,
      );

      const cookies = response.headers.get("set-cookie");
      expect(cookies).toContain("refreshToken=mock-refresh-token");
    });

    it("should return 400 for missing refresh token", async () => {
      const response = await client["refresh-token"].$post({
        cookie: { refreshToken: "" },
      });

      expect(response.status).toBe(400);
      expect(mockedAuthService.validateRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases and Error Scenarios", () => {
    it("should handle concurrent registration attempts", async () => {
      // First request succeeds
      mockedAuthService.registerUser
        .mockResolvedValueOnce({
          ...mockUser,
          ...mockAuthTokens,
        })
        // Second request fails due to duplicate email
        .mockRejectedValueOnce(new ValidationError("Email already exists"));

      mockedAuthService.createEmailVerificationToken.mockResolvedValue(
        "verification-token",
      );
      mockedEmailService.sendEmailVerification.mockResolvedValue(undefined); // Act
      const [response1, response2] = await Promise.all([
        client.signup.$post({
          json: mockRegistration,
        }),
        client.signup.$post({
          json: mockRegistration,
        }),
      ]);

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(500);
    });
  });
});
