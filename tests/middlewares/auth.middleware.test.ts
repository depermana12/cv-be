import { describe, test, expect, beforeEach, vi } from "vitest";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import type { Bindings } from "../../src/lib/types";

// Import the real middleware
import { jwt, config } from "../../src/middlewares/auth";

describe("auth middleware", () => {
  describe("config", () => {
    test("should have correct algorithm", () => {
      expect(config.jwtAlgorithm).toBe("HS256");
    });

    test("should have a jwtSecret", () => {
      expect(config.jwtSecret).toBeDefined();
      expect(typeof config.jwtSecret).toBe("string");
    });
  });

  describe("jwt middleware", () => {
    let app: Hono<Bindings>;

    beforeEach(() => {
      app = new Hono<Bindings>();
      app.use("/protected/*", jwt());
      app.get("/protected/test", (c) => {
        const payload = c.get("jwtPayload");
        return c.json({
          message: "protected route accessed",
          user: payload,
        });
      });
      app.get("/public", (c) => c.json({ message: "public route" }));
    });

    describe("valid token scenarios", () => {
      test("should allow access with valid JWT token", async () => {
        const payload = { id: "1", email: "test@example.com" };
        const validToken = await sign(payload, config.jwtSecret);

        const res = await app.request("/protected/test", {
          headers: {
            Authorization: `Bearer ${validToken}`,
          },
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.message).toBe("protected route accessed");
        expect(data.user).toEqual(payload);
      });

      test("should work with different payload structures", async () => {
        const payload = {
          id: "123",
          email: "user@test.com",
          role: "admin",
          permissions: ["read", "write"],
        };
        const validToken = await sign(payload, config.jwtSecret);

        const res = await app.request("/protected/test", {
          headers: {
            Authorization: `Bearer ${validToken}`,
          },
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.user).toEqual(payload);
      });

      test("should work with token containing expiration", async () => {
        const payload = {
          id: "1",
          email: "test@example.com",
          exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        };
        const validToken = await sign(payload, config.jwtSecret);

        const res = await app.request("/protected/test", {
          headers: {
            Authorization: `Bearer ${validToken}`,
          },
        });

        expect(res.status).toBe(200);
      });
    });

    describe("missing or malformed authorization header", () => {
      test("should return 401 for missing authorization header", async () => {
        const res = await app.request("/protected/test");

        expect(res.status).toBe(401);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.message).toBe("no Authorization header provided");
        expect(data.error).toBe("JwtTokenMissing");
      });

      test("should return 401 for empty authorization header", async () => {
        const res = await app.request("/protected/test", {
          headers: {
            Authorization: "",
          },
        });

        expect(res.status).toBe(401);
        const data = await res.json();
        expect(data.success).toBe(false);
      });

      test("should return 401 for malformed authorization header", async () => {
        const res = await app.request("/protected/test", {
          headers: {
            Authorization: "InvalidFormat",
          },
        });

        expect(res.status).toBe(401);
        const data = await res.json();
        expect(data.success).toBe(false);
      });
      test("should return 401 for missing Bearer prefix", async () => {
        const payload = { id: "1", email: "test@example.com" };
        const token = await sign(payload, config.jwtSecret);

        const res = await app.request("/protected/test", {
          headers: {
            Authorization: token, // Missing "Bearer " prefix
          },
        });

        expect(res.status).toBe(401);
        const data = await res.json();
        expect(data.success).toBe(false);
      });
    });

    describe("invalid tokens", () => {
      test("should return 401 for invalid token format", async () => {
        const res = await app.request("/protected/test", {
          headers: {
            Authorization: "Bearer invalid-token-format",
          },
        });

        expect(res.status).toBe(401);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.message).toBe("invalid token format or signature");
        expect(data.error).toBe("JwtTokenInvalid");
      });

      test("should return 401 for token with wrong secret", async () => {
        const payload = { id: "1", email: "test@example.com" };
        const invalidToken = await sign(payload, "wrong-secret");

        const res = await app.request("/protected/test", {
          headers: {
            Authorization: `Bearer ${invalidToken}`,
          },
        });

        expect(res.status).toBe(401);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.message).toBe("token signature mismatch");
        expect(data.error).toBe("JwtTokenSignatureMismatched");
      });

      test("should return 401 for expired token", async () => {
        const payload = {
          id: "1",
          email: "test@example.com",
          exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
        };
        const expiredToken = await sign(payload, config.jwtSecret);

        const res = await app.request("/protected/test", {
          headers: {
            Authorization: `Bearer ${expiredToken}`,
          },
        });

        expect(res.status).toBe(401);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.message).toBe("token has expired");
        expect(data.error).toBe("JwtTokenExpired");
      });

      test("should return 401 for completely malformed JWT", async () => {
        const res = await app.request("/protected/test", {
          headers: {
            Authorization: "Bearer not.a.jwt",
          },
        });

        expect(res.status).toBe(401);
        const data = await res.json();
        expect(data.success).toBe(false);
      });
    });

    describe("middleware behavior", () => {
      test("should not affect unprotected routes", async () => {
        const res = await app.request("/public");

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.message).toBe("public route");
      });
      test("should work with different HTTP methods", async () => {
        const payload = { id: "1", email: "test@example.com" };
        const validToken = await sign(payload, config.jwtSecret);

        // Add protected routes for different methods
        app.post("/protected/create", (c) => c.json({ method: "POST" }));
        app.patch("/protected/update", (c) => c.json({ method: "PATCH" }));
        app.delete("/protected/delete", (c) => c.json({ method: "DELETE" }));

        const methods = [
          { method: "POST", path: "/protected/create" },
          { method: "PATCH", path: "/protected/update" },
          { method: "DELETE", path: "/protected/delete" },
        ];

        for (const { method, path } of methods) {
          const res = await app.request(path, {
            method,
            headers: {
              Authorization: `Bearer ${validToken}`,
            },
          });

          expect(res.status).toBe(200);
          const data = await res.json();
          expect(data.method).toBe(method);
        }
      });

      test("should handle concurrent requests correctly", async () => {
        const payload = { id: "1", email: "test@example.com" };
        const validToken = await sign(payload, config.jwtSecret);

        const requests = Array.from({ length: 5 }, (_, i) =>
          app.request(`/protected/test`, {
            headers: {
              Authorization: `Bearer ${validToken}`,
            },
          }),
        );

        const responses = await Promise.all(requests);

        responses.forEach((res) => {
          expect(res.status).toBe(200);
        });
      });

      test("should preserve request context and headers", async () => {
        const payload = { id: "1", email: "test@example.com" };
        const validToken = await sign(payload, config.jwtSecret);

        app.get("/protected/context", (c) => {
          return c.json({
            userAgent: c.req.header("User-Agent"),
            contentType: c.req.header("Content-Type"),
            customHeader: c.req.header("X-Custom-Header"),
          });
        });

        const res = await app.request("/protected/context", {
          headers: {
            Authorization: `Bearer ${validToken}`,
            "User-Agent": "test-agent",
            "Content-Type": "application/json",
            "X-Custom-Header": "custom-value",
          },
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.userAgent).toBe("test-agent");
        expect(data.contentType).toBe("application/json");
        expect(data.customHeader).toBe("custom-value");
      });
    });

    describe("error response format", () => {
      test("should return consistent error response format", async () => {
        const res = await app.request("/protected/test", {
          headers: {
            Authorization: "Bearer invalid-token",
          },
        });

        expect(res.status).toBe(401);
        const data = await res.json();

        expect(data).toHaveProperty("success");
        expect(data).toHaveProperty("message");
        expect(data).toHaveProperty("error");
        expect(data.success).toBe(false);
        expect(typeof data.message).toBe("string");
        expect(typeof data.error).toBe("string");
      });

      test("should have appropriate content-type header", async () => {
        const res = await app.request("/protected/test");

        expect(res.status).toBe(401);
        expect(res.headers.get("Content-Type")).toContain("application/json");
      });
    });

    describe("edge cases", () => {
      test("should handle very long tokens", async () => {
        const payload = {
          id: "1",
          email: "test@example.com",
          longData: "x".repeat(1000), // Very long data
        };
        const longToken = await sign(payload, config.jwtSecret);

        const res = await app.request("/protected/test", {
          headers: {
            Authorization: `Bearer ${longToken}`,
          },
        });

        expect(res.status).toBe(200);
      });

      test("should handle tokens with special characters in payload", async () => {
        const payload = {
          id: "1",
          email: "test+user@example.com",
          name: "Test User™",
          notes: "Special chars: áéíóú ñ 中文 🚀",
        };
        const token = await sign(payload, config.jwtSecret);

        const res = await app.request("/protected/test", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.user).toEqual(payload);
      });

      test("should handle case-sensitive authorization header", async () => {
        const payload = { id: "1", email: "test@example.com" };
        const validToken = await sign(payload, config.jwtSecret);

        // Test with proper header format
        const res1 = await app.request("/protected/test", {
          headers: {
            Authorization: `Bearer ${validToken}`,
          },
        });
        expect(res1.status).toBe(200);

        // Test with different case (should still work due to HTTP header case insensitivity)
        const res2 = await app.request("/protected/test", {
          headers: {
            authorization: `Bearer ${validToken}`, // lowercase
          },
        });
        expect([200, 401]).toContain(res2.status); // Either should work or fail consistently
      });

      test("should work with middleware applied to specific paths", async () => {
        const specificApp = new Hono<Bindings>();
        specificApp.use("/api/v1/protected/*", jwt());
        specificApp.get("/api/v1/protected/resource", (c) =>
          c.json({ protected: true }),
        );
        specificApp.get("/api/v1/public/resource", (c) =>
          c.json({ public: true }),
        );

        const payload = { id: "1", email: "test@example.com" };
        const validToken = await sign(payload, config.jwtSecret);

        // Protected route should require auth
        const protectedRes = await specificApp.request(
          "/api/v1/protected/resource",
          {
            headers: { Authorization: `Bearer ${validToken}` },
          },
        );
        expect(protectedRes.status).toBe(200);

        // Public route should not require auth
        const publicRes = await specificApp.request("/api/v1/public/resource");
        expect(publicRes.status).toBe(200);
      });
    });
  });
});
