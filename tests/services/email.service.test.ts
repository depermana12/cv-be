import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EmailService } from "../../src/services/email.service";
import nodemailer from "nodemailer";

const mockSendMail = vi.fn();
const mockVerify = vi.fn();
const mockCreateTransporter = vi.fn();

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(),
  },
}));

describe("EmailService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateTransporter.mockReturnValue({
      sendMail: mockSendMail,
      verify: mockVerify,
    });

    nodemailer.createTransport = mockCreateTransporter;
    mockVerify.mockResolvedValue(true);
    mockSendMail.mockResolvedValue({ messageId: "test-message-id" });

    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should log error when connection test fails", async () => {
      mockVerify.mockRejectedValue(
        new Error("Email service connection failed"),
      );

      new EmailService();

      // wait for async testConnection
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(console.error).toHaveBeenCalledWith(
        "Email service connection failed:",
        expect.any(Error),
      );
    });
    it("should log success when connection test passes", async () => {
      new EmailService();

      // wait for async testConnection
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockVerify).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith("Email service is ready");
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe("sendEmailVerification", () => {
    let emailService: EmailService;
    const verificationData = {
      email: "user@example.com",
      username: "testuser",
      verificationToken: "test-token-123",
    };

    beforeEach(() => {
      emailService = new EmailService();
    });

    it("should send email verification with html structure and content", async () => {
      await emailService.sendEmailVerification(verificationData);

      const [mailOptions] = mockSendMail.mock.calls[0];

      expect(mailOptions.from).toBe("CV Application <noreply@cvapp.com>");
      expect(mailOptions.to).toBe(verificationData.email);
      expect(mailOptions.subject).toBe("Please verify your email address");
      expect(mailOptions.html).toContain("<title>Email Verification</title>");
      expect(mailOptions.text).toContain("Welcome to CV Builder!");
      expect(mailOptions.html).toContain(
        `http://localhost:5173/verify-email/${verificationData.verificationToken}`,
      );
      expect(mailOptions.html).toContain(`Hi ${verificationData.username}!`);
    });

    it("should handle email sending failure", async () => {
      mockSendMail.mockRejectedValue(new Error("SMTP error"));

      await expect(
        emailService.sendEmailVerification(verificationData),
      ).rejects.toThrow("SMTP error");
    });

    it("should include all required HTML elements and structure", async () => {
      await emailService.sendEmailVerification(verificationData);

      const [mailOptions] = mockSendMail.mock.calls[0];

      expect(mailOptions.html).toMatch(/<!DOCTYPE html>.*<html.*<\/html>/s);
      expect(mailOptions.html).toContain("expire in 24 hours");
    });
  });

  describe("sendPasswordReset", () => {
    let emailService: EmailService;
    const resetData = {
      email: "user@example.com",
      username: "testuser",
      resetToken: "reset-token-456",
    };

    beforeEach(() => {
      emailService = new EmailService();
    });

    it("should send password reset email", async () => {
      await emailService.sendPasswordReset(resetData);

      const [mailOptions] = mockSendMail.mock.calls[0];

      expect(mailOptions.from).toBe("CV Application <noreply@cvapp.com>");
      expect(mailOptions.to).toBe(resetData.email);
      expect(mailOptions.subject).toBe("Reset your password");
      expect(mailOptions.html).toContain(
        `http://localhost:5173/reset-password/${resetData.resetToken}`,
      );
      expect(mailOptions.html).toContain(`Hi ${resetData.username}!`);
      expect(mailOptions.html).toContain("expire in 1 hour");
    });

    it("should handle password reset email sending failure", async () => {
      mockSendMail.mockRejectedValue(new Error("Network error"));

      await expect(emailService.sendPasswordReset(resetData)).rejects.toThrow(
        "Network error",
      );
    });

    it("should include security warnings in content", async () => {
      await emailService.sendPasswordReset(resetData);

      const [mailOptions] = mockSendMail.mock.calls[0];

      expect(mailOptions.html).toContain("didn't request a password reset");
      expect(mailOptions.text).toContain("didn't request a password reset");
    });
  });

  describe("sendWelcomeEmail", () => {
    let emailService: EmailService;
    const email = "user@example.com";
    const username = "testuser";

    beforeEach(() => {
      emailService = new EmailService();
    });

    it("should send welcome email", async () => {
      await emailService.sendWelcomeEmail(email, username);

      const [mailOptions] = mockSendMail.mock.calls[0];

      expect(mailOptions.from).toBe("CV Application <noreply@cvapp.com>");
      expect(mailOptions.to).toBe(email);
      expect(mailOptions.subject).toBe("Welcome! Your email is verified");
      expect(mailOptions.html).toContain("Welcome to CV Builder! 🎉");
      expect(mailOptions.html).toContain(`Hi ${username}!`);
      expect(mailOptions.html).toContain(
        "email has been successfully verified",
      );
    });

    it("should handle welcome email sending failure", async () => {
      mockSendMail.mockRejectedValue(new Error("Quota exceeded"));

      await expect(
        emailService.sendWelcomeEmail(email, username),
      ).rejects.toThrow("Quota exceeded");
    });

    it("should include cta elements", async () => {
      await emailService.sendWelcomeEmail(email, username);

      const [mailOptions] = mockSendMail.mock.calls[0];

      expect(mailOptions.html).toContain("Start Building Your CV");
      expect(mailOptions.html).toContain("/dashboard");
    });
  });

  describe("error handling and edge cases", () => {
    it("should handle unicode characters in usernames", async () => {
      const emailService = new EmailService();

      const unicodeUsername = "用户名测试";

      await emailService.sendWelcomeEmail("user@example.com", unicodeUsername);

      const [mailOptions] = mockSendMail.mock.calls[0];
      expect(mailOptions.html).toContain(unicodeUsername);
    });
  });

  describe("email content validation", () => {
    let emailService: EmailService;

    beforeEach(() => {
      emailService = new EmailService();
    });

    it("should generate valid HTML for all email types", async () => {
      const verificationData = {
        email: "user@example.com",
        username: "testuser",
        verificationToken: "token-123",
      };

      const resetData = {
        email: "user@example.com",
        username: "testuser",
        resetToken: "reset-123",
      };

      await emailService.sendEmailVerification(verificationData);
      await emailService.sendPasswordReset(resetData);
      await emailService.sendWelcomeEmail("user@example.com", "testuser");

      expect(mockSendMail).toHaveBeenCalledTimes(3);

      mockSendMail.mock.calls.forEach(([mailOptions]) => {
        expect(mailOptions.html).toContain("<!DOCTYPE html>");
        expect(mailOptions.html).toContain("<html>");
        expect(mailOptions.html).toContain("</html>");
        expect(mailOptions.html).toContain("<body");
        expect(mailOptions.html).toContain("</body>");
      });
    });

    it("should include proper email headers and from address", async () => {
      await emailService.sendWelcomeEmail("user@example.com", "testuser");
      const [mailOptions] = mockSendMail.mock.calls[0];

      expect(mailOptions).toMatchObject({
        from: expect.stringContaining("CV Application"),
        to: expect.stringContaining("@"),
        subject: expect.any(String),
      });
    });
  });
});
