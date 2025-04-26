import { testClient } from "hono/testing";
import { describe, test, expect, beforeEach, mock } from "bun:test";
import { UserService } from "../src/services/user.service";
import {
  createUserRoutes,
  userRoutes,
} from "../src/controllers/user.controller";
import type { Context, Next } from "hono";
import { password } from "bun";
import { errorHandler } from "../src/middlewares/error-handler";

const mockUserRepository = {
  getById: mock(async (id: number) => {
    if (id === 1) {
      return {
        id: 1,
        username: "testuser1",
        email: "test1@example.com",
        password: await Bun.password.hash("correctpassword"),
        createdAt: new Date("2025-04-26"),
      };
    }
    return null;
  }),
  create: mock(async (data: any) => {
    const created = {
      id: 2,
      username: data.username,
      email: data.email,
      password: await Bun.password.hash(data.password),
      createdAt: "2025-04-26",
    };
    const { password, ...rest } = created;
    return { ...rest };
  }),
  getByEmail: mock(async (email: string) => {
    if (email === "test1@example.com" || email === "test2@example.com") {
      return {
        id: 1,
        username: "existingUser",
        email,
        password: "hashedpassword",
        createdAt: "2025-04-26",
      };
    }
    return null;
  }),
};

const mockJwt = () => async (c: Context, next: Next) => {
  c.set("jwtPayload", { id: 1, email: "depermana" });
  await next();
};

describe("auth controller", () => {
  let client: ReturnType<typeof testClient>;

  beforeEach(() => {
    mockUserRepository.getById.mockClear();
    mockUserRepository.create.mockClear();
    mockUserRepository.getByEmail.mockClear();

    const authService = new UserService(mockUserRepository as any);
    const app = createUserRoutes(authService, mockJwt());
    app.onError(errorHandler);
    client = testClient(app);
  });

  describe("POST /signup", () => {
    test("shold create a new user", async () => {
      const newUser = {
        username: "new user",
        email: "newuser123@gmail.com",
        password: "thisispassword",
      };

      const res = await client.signup.$post({
        json: newUser,
      });
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data).toEqual({
        success: true,
        message: "user created",
        data: {
          id: 2,
          username: "new user",
          email: "newuser123@gmail.com",
          token: expect.any(String),
          createdAt: "2025-04-26",
        },
      });
    });
    test("should fail when email is already registered", async () => {
      const existingUser = {
        username: "any",
        email: "test1@example.com",
        password: "secretdadada",
      };

      const res = await client.signup.$post({ json: existingUser });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toEqual({
        success: false,
        message: "email already registered",
        error: "ValidationError",
      });
      expect(mockUserRepository.getByEmail).toHaveBeenCalledWith(
        existingUser.email,
      );
    });
    test("should verify email format before checking existence", async () => {
      const invalidEmailUser = {
        username: "test",
        email: "thisisnotemailbro",
        password: "password123",
      };

      const res = await client.signup.$post({ json: invalidEmailUser });
      expect(res.status).toBe(400);
      expect(mockUserRepository.getByEmail).not.toHaveBeenCalled();
    });
  });
});
