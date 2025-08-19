import { describe, test, beforeEach, expect, vi } from "vitest";
import { Hono } from "hono";
import { errorHandler } from "../../src/middlewares/error-handler";
import { NotFoundError } from "../../src/errors/not-found.error";
import { BadRequestError } from "../../src/errors/bad-request.error";
import { DataBaseError } from "../../src/errors/database.error";
import { ValidationError } from "../../src/errors/validation.error";
import { UploadError } from "../../src/errors/upload.error";
import { HTTPException } from "hono/http-exception";
import type { Bindings } from "../../src/lib/types";

describe("error handler middleware", () => {
  let app: Hono<Bindings>;
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = {
      error: vi.fn(() => {}),
      debug: vi.fn(() => {}),
      info: vi.fn(() => {}),
    };

    app = new Hono<Bindings>();
    app.use("*", async (c, next) => {
      c.set("logger", mockLogger);
      c.set("requestId", "test-req-123");
      await next();
    });
    app.onError(errorHandler);
  });

  describe("HTTPException handling", () => {
    test("should handle HTTPException with proper error response", async () => {
      app.get("/test", () => {
        throw new HTTPException(400, {
          message: "Bad Request",
          cause: { field: "email", issue: "invalid format" },
        });
      });

      const res = await app.request("/test");

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toEqual({
        success: false,
        message: "Bad Request",
        error: "HTTPException",
        cause: { field: "email", issue: "invalid format" },
      });
      expect(mockLogger.error).toHaveBeenCalled();
    });

    test("should handle HTTPException without cause", async () => {
      app.get("/test", () => {
        throw new HTTPException(500, { message: "Internal Server Error" });
      });

      const res = await app.request("/test");

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data).toEqual({
        success: false,
        message: "Internal Server Error",
        error: "HTTPException",
        cause: undefined,
      });
    });
  });

  describe("Custom error handling", () => {
    test("should handle NotFoundError with 404 status", async () => {
      app.get("/test", () => {
        throw new NotFoundError("Resource not found");
      });

      const res = await app.request("/test");

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data).toEqual({
        success: false,
        message: "Resource not found",
        error: "NotFoundError",
        cause: undefined,
      });
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          reqId: "test-req-123",
          name: "NotFoundError",
          message: "Resource not found",
          path: "/test",
          method: "GET",
        }),
        "Error handled",
      );
    });

    test("should handle BadRequestError with 400 status", async () => {
      app.get("/test", () => {
        throw new BadRequestError("Invalid input data");
      });

      const res = await app.request("/test");

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toEqual({
        success: false,
        message: "Invalid input data",
        error: "BadRequestError",
        cause: undefined,
      });
    });

    test("should handle DataBaseError with 400 status", async () => {
      app.get("/test", () => {
        throw new DataBaseError("Database connection failed");
      });

      const res = await app.request("/test");

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toEqual({
        success: false,
        message: "Database connection failed",
        error: "DataBaseError",
        cause: undefined,
      });
    });

    test("should handle ValidationError with 400 status", async () => {
      app.get("/test", () => {
        throw new ValidationError("Validation failed");
      });

      const res = await app.request("/test");

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toEqual({
        success: false,
        message: "Validation failed",
        error: "ValidationError",
        cause: undefined,
      });
    });

    test("should handle UploadError with custom status", async () => {
      app.get("/test", () => {
        throw new UploadError("File too large", 413, {
          maxSize: "10MB",
          actualSize: "15MB",
        });
      });

      const res = await app.request("/test");

      expect(res.status).toBe(413);
      const data = await res.json();
      expect(data).toEqual({
        success: false,
        message: "File too large",
        error: "UploadError",
        cause: {
          maxSize: "10MB",
          actualSize: "15MB",
        },
      });
    });
  });

  describe("Generic error handling", () => {
    test("should handle unknown errors with 500 status", async () => {
      app.get("/test", () => {
        throw new Error("Unknown error occurred");
      });

      const res = await app.request("/test");

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data).toEqual({
        success: false,
        message: "Internal Server Error",
        error: "Oops that's  on us",
        cause: undefined,
      });
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Error",
          message: "Unknown error occurred",
          stack: expect.any(String),
        }),
        "Error handled",
      );
    });

    test("should handle async errors properly", async () => {
      app.get("/test", async () => {
        await new Promise((resolve) => setTimeout(resolve, 1));
        throw new NotFoundError("Async error");
      });

      const res = await app.request("/test");

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.message).toBe("Async error");
    });
  });

  describe("Logger integration", () => {
    test("should use console as fallback when no logger is available", async () => {
      const consoleError = vi.fn(() => {});
      const originalConsoleError = console.error;
      console.error = consoleError;

      const noLoggerApp = new Hono<Bindings>();
      noLoggerApp.onError(errorHandler);
      noLoggerApp.get("/test", () => {
        throw new Error("Test error");
      });

      await noLoggerApp.request("/test");

      expect(consoleError).toHaveBeenCalled();
      console.error = originalConsoleError;
    });

    test("should include request context in error logs", async () => {
      app.post("/test/endpoint", () => {
        throw new ValidationError("Test validation error");
      });

      await app.request("/test/endpoint", { method: "POST" });

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          reqId: "test-req-123",
          path: "/test/endpoint",
          method: "POST",
          name: "ValidationError",
          message: "Test validation error",
        }),
        "Error handled",
      );
    });

    test("should handle errors without stack trace", async () => {
      app.get("/test", () => {
        const error = new Error("No stack error");
        delete error.stack;
        throw error;
      });

      const res = await app.request("/test");

      expect(res.status).toBe(500);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: undefined,
        }),
        "Error handled",
      );
    });
  });

  describe("Circular references", () => {
    test("should handle errors with circular references", async () => {
      app.get("/test", () => {
        const circularObj: any = {};
        circularObj.self = circularObj;
        const error = new Error("Circular error");
        (error as any).circular = circularObj;
        throw error;
      });

      const res = await app.request("/test");
      expect(res.status).toBe(500);
    });
  });
});
